import type { Context } from '@netlify/functions';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EDITOR_ROLES = ['editor', 'admin', 'super_admin'];
const FOLDER_RE = /^[a-zA-Z0-9/_-]{1,100}$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!API_KEY || !API_SECRET || !CLOUD_NAME) {
    console.error('[cloudinary-sign] Cloudinary credentials not configured');
    return json({ error: 'Server configuration error' }, 500);
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[cloudinary-sign] Supabase service role not configured');
    return json({ error: 'Server configuration error' }, 500);
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const userToken = auth.slice('Bearer '.length);
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await adminClient.auth.getUser(userToken);
  if (userError || !userData.user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { data: roleData } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (!roleData || !EDITOR_ROLES.includes(roleData.role)) {
    return json({ error: 'Forbidden' }, 403);
  }

  let folder = 'atfr/media';
  try {
    const body = await req.json() as { folder?: unknown };
    if (typeof body.folder === 'string' && FOLDER_RE.test(body.folder)) {
      folder = body.folder;
    }
  } catch { /* use default folder */ }

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signature: SHA-1(alphabetically sorted params + api_secret)
  const paramsString = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash('sha1').update(paramsString + API_SECRET).digest('hex');

  return json({ signature, timestamp, api_key: API_KEY, cloud_name: CLOUD_NAME, folder });
}
