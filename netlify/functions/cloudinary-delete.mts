import type { Context } from '@netlify/functions';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify caller is an authenticated editor/admin.
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[cloudinary-delete] Supabase service role not configured');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const userToken = auth.slice('Bearer '.length);
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify the JWT and check editor role.
  const { data: userData, error: userError } = await adminClient.auth.getUser(userToken);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { data: roleData } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  const EDITOR_ROLES = ['editor', 'admin', 'super_admin'];
  if (!roleData || !EDITOR_ROLES.includes(roleData.role)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  let publicId: string;
  let resourceType: string = 'image';

  try {
    const body = await req.json() as { publicId?: unknown; resourceType?: unknown };
    if (typeof body.publicId !== 'string' || !body.publicId) {
      return new Response(JSON.stringify({ error: 'publicId requis' }), { status: 400 });
    }
    publicId = body.publicId;
    if (body.resourceType === 'video') resourceType = 'video';
  } catch {
    return new Response(JSON.stringify({ error: 'Body JSON invalide' }), { status: 400 });
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as 'image' | 'video' });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[cloudinary-delete] uploader error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
