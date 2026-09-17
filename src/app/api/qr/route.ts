import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { getAuthenticatedAdmin } from '@/lib/auth/admin';
export async function POST(req: Request) {
  try {
    const { user, isAdmin } = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminClient = createAdminClient();

    const body = await req.json();
    const { target_url, label, exhibition_id, artwork_id } = body;

    if (!target_url) {
      return NextResponse.json({ error: 'Missing target_url' }, { status: 400 });
    }

    const qr_data_url = await QRCode.toDataURL(target_url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const { data: qrRecord, error } = await adminClient
      .from('qr_codes')
      .insert({
        target_url,
        label,
        exhibition_id,
        artwork_id
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error saving QR:', error);
      return NextResponse.json({ error: 'Failed to save QR code' }, { status: 500 });
    }

    return NextResponse.json({ qr_data_url, id: qrRecord.id }, { status: 201 });
  } catch (error) {
    console.error('QR Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
