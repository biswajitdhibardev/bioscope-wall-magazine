import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

const BUCKET = 'artworks';
const VALID_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalUuid(value: string): string | null {
  return value && value !== 'none' ? value : null;
}

function optionalNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function safeExtension(file: File): string {
  switch (file.type) {
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    default: return 'jpg';
  }
}

async function requireAdmin() {
  const { user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const supabase = createAdminClient();
    const [{ data: artworks, error: artworksError }, { data: artists, error: artistsError }, { data: exhibitions, error: exhibitionsError }] = await Promise.all([
      supabase
        .from('artworks')
        .select('*, artist:artists(id, name)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase.from('artists').select('id, name').order('name', { ascending: true }),
      supabase.from('exhibitions').select('id, name').order('name', { ascending: true }),
    ]);

    if (artworksError) throw artworksError;
    if (artistsError) throw artistsError;
    if (exhibitionsError) throw exhibitionsError;

    return NextResponse.json({ artworks: artworks ?? [], artists: artists ?? [], exhibitions: exhibitions ?? [] });
  } catch (error) {
    console.error('Admin artworks GET error:', error);
    return NextResponse.json({ error: 'Failed to load artworks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let uploadedPath: string | null = null;

  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const title = text(formData.get('title'));
    const description = text(formData.get('description'));
    const medium = text(formData.get('medium'));
    const dimensions = text(formData.get('dimensions'));
    const year = optionalNumber(text(formData.get('year')));
    const category = text(formData.get('category'));
    const artistId = optionalUuid(text(formData.get('artist_id')));
    const exhibitionId = optionalUuid(text(formData.get('exhibition_id')));
    const isPublished = text(formData.get('is_published')) !== 'false';
    const file = formData.get('file');

    if (!title) return NextResponse.json({ error: 'Artwork title is required' }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ error: 'Please select an artwork image' }, { status: 400 });
    if (!VALID_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are supported' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image must be 10 MB or smaller' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const path = `${category ? category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'uncategorized'}/${crypto.randomUUID()}.${safeExtension(file)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) throw uploadError;
    uploadedPath = uploadData.path;

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath);

    const { data: artwork, error: insertError } = await supabase
      .from('artworks')
      .insert({
        title,
        description: description || null,
        medium: medium || null,
        dimensions: dimensions || null,
        year,
        category: category || null,
        artist_id: artistId,
        exhibition_id: exhibitionId,
        image_path: uploadedPath,
        image_url: publicUrlData.publicUrl,
        is_published: isPublished,
        display_order: 0,
      })
      .select('*, artist:artists(id, name)')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ artwork }, { status: 201 });
  } catch (error) {
    console.error('Admin artworks POST error:', error);

    if (uploadedPath) {
      try {
        const supabase = createAdminClient();
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded artwork:', cleanupError);
      }
    }

    const message = error instanceof Error ? error.message : 'Failed to create artwork';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  let newUploadedPath: string | null = null;

  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const id = text(formData.get('id'));
    if (!id) return NextResponse.json({ error: 'Artwork id is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase
      .from('artworks')
      .select('image_path')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      title: text(formData.get('title')),
      description: text(formData.get('description')) || null,
      medium: text(formData.get('medium')) || null,
      dimensions: text(formData.get('dimensions')) || null,
      year: optionalNumber(text(formData.get('year'))),
      category: text(formData.get('category')) || null,
      artist_id: optionalUuid(text(formData.get('artist_id'))),
      exhibition_id: optionalUuid(text(formData.get('exhibition_id'))),
      is_published: text(formData.get('is_published')) !== 'false',
    };

    const file = formData.get('file');
    if (file instanceof File && file.size > 0) {
      if (!VALID_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are supported' }, { status: 400 });
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'Image must be 10 MB or smaller' }, { status: 400 });
      }

      const category = text(formData.get('category'));
      newUploadedPath = `${category ? category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'uncategorized'}/${crypto.randomUUID()}.${safeExtension(file)}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newUploadedPath, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(newUploadedPath);
      updates.image_path = newUploadedPath;
      updates.image_url = publicUrlData.publicUrl;
    }

    if (!updates.title) return NextResponse.json({ error: 'Artwork title is required' }, { status: 400 });

    const { data: artwork, error: updateError } = await supabase
      .from('artworks')
      .update(updates)
      .eq('id', id)
      .select('*, artist:artists(id, name)')
      .single();

    if (updateError) throw updateError;

    if (newUploadedPath && existing.image_path && existing.image_path !== newUploadedPath) {
      await supabase.storage.from(BUCKET).remove([existing.image_path]);
    }

    return NextResponse.json({ artwork });
  } catch (error) {
    console.error('Admin artworks PATCH error:', error);
    if (newUploadedPath) {
      try {
        const supabase = createAdminClient();
        await supabase.storage.from(BUCKET).remove([newUploadedPath]);
      } catch (cleanupError) {
        console.error('Failed to clean up replacement artwork:', cleanupError);
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to update artwork';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await req.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Artwork id is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase
      .from('artworks')
      .select('image_path')
      .eq('id', id)
      .single();

    if (existingError || !existing) return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });

    const { error: deleteError } = await supabase.from('artworks').delete().eq('id', id);
    if (deleteError) throw deleteError;

    if (existing.image_path) {
      await supabase.storage.from(BUCKET).remove([existing.image_path]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin artworks DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 });
  }
}
