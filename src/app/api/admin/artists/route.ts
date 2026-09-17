import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

const BUCKET = 'artworks';
const VALID_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const STORAGE_PREFIX = 'artists/';

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function safeExtension(file: File): string {
  switch (file.type) {
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    default: return 'jpg';
  }
}

function parseSocialLinks(value: string) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const allowed = ['website', 'instagram', 'twitter', 'facebook', 'linkedin', 'behance'];
    return Object.fromEntries(
      allowed
        .filter((key) => typeof parsed[key] === 'string' && parsed[key].trim())
        .map((key) => [key, parsed[key].trim()])
    );
  } catch {
    return {};
  }
}

function getArtistStoragePath(profileImage: string | null): string | null {
  if (!profileImage) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = profileImage.indexOf(marker);
  if (index === -1) return null;
  const path = decodeURIComponent(profileImage.slice(index + marker.length));
  return path.startsWith(STORAGE_PREFIX) ? path : null;
}

async function requireAdmin() {
  const { user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

async function uploadProfileImage(
  supabase: ReturnType<typeof createAdminClient>,
  file: File,
) {
  if (!VALID_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, and WebP profile images are supported');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Profile image must be 5 MB or smaller');
  }

  const path = `${STORAGE_PREFIX}${crypto.randomUUID()}.${safeExtension(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { path: data.path, publicUrl: publicUrlData.publicUrl };
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const supabase = createAdminClient();
    const [{ data: artists, error: artistsError }, { data: artworkRows, error: artworkError }] = await Promise.all([
      supabase.from('artists').select('*').order('name', { ascending: true }),
      supabase.from('artworks').select('artist_id'),
    ]);

    if (artistsError) throw artistsError;
    if (artworkError) throw artworkError;

    const counts = new Map<string, number>();
    for (const row of artworkRows ?? []) {
      if (!row.artist_id) continue;
      counts.set(row.artist_id, (counts.get(row.artist_id) ?? 0) + 1);
    }

    const result = (artists ?? []).map((artist) => ({
      ...artist,
      artworks_count: counts.get(artist.id) ?? 0,
    }));

    return NextResponse.json({ artists: result });
  } catch (error) {
    console.error('Admin artists GET error:', error);
    return NextResponse.json({ error: 'Failed to load artists' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let uploadedPath: string | null = null;

  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const name = text(formData.get('name'));
    const biography = text(formData.get('biography'));
    const artisticStyle = text(formData.get('artistic_style'));
    const education = text(formData.get('education'));
    const socialLinks = parseSocialLinks(text(formData.get('social_links')));
    const file = formData.get('file');

    if (!name) return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });

    const supabase = createAdminClient();
    let profileImage: string | null = null;

    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadProfileImage(supabase, file);
      uploadedPath = uploaded.path;
      profileImage = uploaded.publicUrl;
    }

    const { data: artist, error } = await supabase
      .from('artists')
      .insert({
        name,
        biography: biography || null,
        artistic_style: artisticStyle || null,
        education: education || null,
        profile_image: profileImage,
        social_links: socialLinks,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ artist: { ...artist, artworks_count: 0 } }, { status: 201 });
  } catch (error) {
    console.error('Admin artists POST error:', error);
    if (uploadedPath) {
      try { await createAdminClient().storage.from(BUCKET).remove([uploadedPath]); }
      catch (cleanupError) { console.error('Failed to clean up uploaded artist image:', cleanupError); }
    }
    const message = error instanceof Error ? error.message : 'Failed to create artist';
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
    const name = text(formData.get('name'));
    const biography = text(formData.get('biography'));
    const artisticStyle = text(formData.get('artistic_style'));
    const education = text(formData.get('education'));
    const socialLinks = parseSocialLinks(text(formData.get('social_links')));
    const removeProfileImage = text(formData.get('remove_profile_image')) === 'true';
    const file = formData.get('file');

    if (!id) return NextResponse.json({ error: 'Artist id is required' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase
      .from('artists')
      .select('profile_image')
      .eq('id', id)
      .single();

    if (existingError || !existing) return NextResponse.json({ error: 'Artist not found' }, { status: 404 });

    const updates: Record<string, unknown> = {
      name,
      biography: biography || null,
      artistic_style: artisticStyle || null,
      education: education || null,
      social_links: socialLinks,
    };

    if (removeProfileImage) updates.profile_image = null;

    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadProfileImage(supabase, file);
      newUploadedPath = uploaded.path;
      updates.profile_image = uploaded.publicUrl;
    }

    const { data: artist, error: updateError } = await supabase
      .from('artists')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    const oldPath = getArtistStoragePath(existing.profile_image);
    if (oldPath && (newUploadedPath || removeProfileImage)) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    const { count, error: countError } = await supabase
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', id);
    if (countError) throw countError;

    return NextResponse.json({ artist: { ...artist, artworks_count: count ?? 0 } });
  } catch (error) {
    console.error('Admin artists PATCH error:', error);
    if (newUploadedPath) {
      try { await createAdminClient().storage.from(BUCKET).remove([newUploadedPath]); }
      catch (cleanupError) { console.error('Failed to clean up replacement artist image:', cleanupError); }
    }
    const message = error instanceof Error ? error.message : 'Failed to update artist';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await req.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Artist id is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase
      .from('artists')
      .select('profile_image, name')
      .eq('id', id)
      .single();

    if (existingError || !existing) return NextResponse.json({ error: 'Artist not found' }, { status: 404 });

    const { count, error: countError } = await supabase
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', id);
    if (countError) throw countError;

    const { error: deleteError } = await supabase.from('artists').delete().eq('id', id);
    if (deleteError) throw deleteError;

    const profilePath = getArtistStoragePath(existing.profile_image);
    if (profilePath) await supabase.storage.from(BUCKET).remove([profilePath]);

    return NextResponse.json({ success: true, unlinked_artworks: count ?? 0 });
  } catch (error) {
    console.error('Admin artists DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 });
  }
}
