import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

export async function POST() {
  try {
    const { user, isAdmin } = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin ensure error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
