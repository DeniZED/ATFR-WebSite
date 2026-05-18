import type { Context } from '@netlify/functions';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
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
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
