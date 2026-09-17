import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

const BUCKET = 'artworks';
const STORAGE_PREFIX = 'exhibitions/';
const VALID_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function text(value: FormDataEntryValue | null): string { return typeof value === 'string' ? value.trim() : ''; }
function safeExtension(file: File): string { return file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'; }
function getStoragePath(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = decodeURIComponent(url.slice(index + marker.length));
  return path.startsWith(STORAGE_PREFIX) ? path : null;
}
async function requireAdmin() {
  const { user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}
async function uploadCover(supabase: ReturnType<typeof createAdminClient>, file: File) {
  if (!VALID_IMAGE_TYPES.has(file.type)) throw new Error('Only JPG, PNG, and WebP cover images are supported');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Cover image must be 10 MB or smaller');
  const path = `${STORAGE_PREFIX}${crypto.randomUUID()}.${safeExtension(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { path: data.path, publicUrl: publicUrlData.publicUrl };
}

export async function GET() {
  try {
    const authError = await requireAdmin(); if (authError) return authError;
    const supabase = createAdminClient();
    const [{ data: exhibitions, error: exError }, { data: rows, error: artError }] = await Promise.all([
      supabase.from('exhibitions').select('*').order('created_at', { ascending: false }),
      supabase.from('artworks').select('exhibition_id'),
    ]);
    if (exError) throw exError; if (artError) throw artError;
    const counts = new Map<string, number>();
    for (const row of rows ?? []) if (row.exhibition_id) counts.set(row.exhibition_id, (counts.get(row.exhibition_id) ?? 0) + 1);
    return NextResponse.json({ exhibitions: (exhibitions ?? []).map((e) => ({ ...e, artworks_count: counts.get(e.id) ?? 0 })) });
  } catch (error) {
    console.error('Admin exhibitions GET error:', error);
    return NextResponse.json({ error: 'Failed to load exhibitions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let uploadedPath: string | null = null;
  try {
    const authError = await requireAdmin(); if (authError) return authError;
    const form = await req.formData();
    const name = text(form.get('name')); const description = text(form.get('description'));
    const start_date = text(form.get('start_date')) || null; const end_date = text(form.get('end_date')) || null;
    const is_active = text(form.get('is_active')) === 'true'; const file = form.get('file');
    if (!name) return NextResponse.json({ error: 'Exhibition name is required' }, { status: 400 });
    if (start_date && end_date && start_date > end_date) return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 });
    const supabase = createAdminClient(); let cover_image: string | null = null;
    if (file instanceof File && file.size > 0) { const uploaded = await uploadCover(supabase, file); uploadedPath = uploaded.path; cover_image = uploaded.publicUrl; }
    const { data, error } = await supabase.from('exhibitions').insert({ name, description: description || null, cover_image, start_date, end_date, is_active }).select('*').single();
    if (error) throw error;
    return NextResponse.json({ exhibition: { ...data, artworks_count: 0 } }, { status: 201 });
  } catch (error) {
    if (uploadedPath) try { await createAdminClient().storage.from(BUCKET).remove([uploadedPath]); } catch {}
    console.error('Admin exhibitions POST error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create exhibition' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  let newPath: string | null = null;
  try {
    const authError = await requireAdmin(); if (authError) return authError;
    const form = await req.formData(); const id = text(form.get('id')); const name = text(form.get('name'));
    const description = text(form.get('description')); const start_date = text(form.get('start_date')) || null; const end_date = text(form.get('end_date')) || null;
    const is_active = text(form.get('is_active')) === 'true'; const remove = text(form.get('remove_cover_image')) === 'true'; const file = form.get('file');
    if (!id) return NextResponse.json({ error: 'Exhibition id is required' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Exhibition name is required' }, { status: 400 });
    if (start_date && end_date && start_date > end_date) return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 });
    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase.from('exhibitions').select('cover_image').eq('id', id).single();
    if (existingError || !existing) return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
    const updates: Record<string, unknown> = { name, description: description || null, start_date, end_date, is_active };
    if (remove) updates.cover_image = null;
    if (file instanceof File && file.size > 0) { const uploaded = await uploadCover(supabase, file); newPath = uploaded.path; updates.cover_image = uploaded.publicUrl; }
    const { data, error } = await supabase.from('exhibitions').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    const oldPath = getStoragePath(existing.cover_image);
    if (oldPath && (remove || newPath)) await supabase.storage.from(BUCKET).remove([oldPath]);
    const { count } = await supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('exhibition_id', id);
    return NextResponse.json({ exhibition: { ...data, artworks_count: count ?? 0 } });
  } catch (error) {
    if (newPath) try { await createAdminClient().storage.from(BUCKET).remove([newPath]); } catch {}
    console.error('Admin exhibitions PATCH error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update exhibition' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin(); if (authError) return authError;
    const body = await req.json(); const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Exhibition id is required' }, { status: 400 });
    const supabase = createAdminClient();
    const { data: existing, error: existingError } = await supabase.from('exhibitions').select('cover_image').eq('id', id).single();
    if (existingError || !existing) return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
    const { count } = await supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('exhibition_id', id);
    const { error } = await supabase.from('exhibitions').delete().eq('id', id);
    if (error) throw error;
    const oldPath = getStoragePath(existing.cover_image); if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    return NextResponse.json({ success: true, unlinked_artworks: count ?? 0 });
  } catch (error) {
    console.error('Admin exhibitions DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete exhibition' }, { status: 500 });
  }
}
