// Runtime must be Node.js to access local filesystem
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Base directory for local files. Configure in .env.local if needed.
const DEFAULT_BASE_WINDOWS = 'C:\\Users\\nanpr\\javaProject\\filePath';
const BASE_DIR = (process.env.LOCAL_FILES_BASE || DEFAULT_BASE_WINDOWS).trim();

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.bmp':
      return 'image/bmp';
    case '.mp4':
      return 'video/mp4';
    case '.mov':
      return 'video/quicktime';
    case '.avi':
      return 'video/x-msvideo';
    case '.mkv':
      return 'video/x-matroska';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.txt':
      return 'text/plain; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function isSafeChildPath(childAbs: string, baseAbs: string): boolean {
  const rel = path.relative(baseAbs, childAbs);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

async function buildHeaders(filePath: string, size: number) {
  const contentType = getContentType(filePath);
  return {
    'Content-Type': contentType,
    'Content-Length': String(size),
    // Cache aggressively in dev for preview files; adjust as needed
    'Cache-Control': 'public, max-age=604800, immutable',
  } as Record<string, string>;
}

export async function GET(_req: NextRequest, ctx: { params: { path: string[] } }) {
  try {
    const segments = ctx.params?.path || [];
    // Join segments into filesystem path. Next 已对中文进行解码。
    const abs = path.resolve(BASE_DIR, ...segments);
    const baseAbs = path.resolve(BASE_DIR);
    if (!isSafeChildPath(abs, baseAbs)) {
      return new Response('Forbidden', { status: 403 });
    }
    const stat = await fs.stat(abs);
    if (stat.isDirectory()) {
      return new Response('Not Found', { status: 404 });
    }
    const data = await fs.readFile(abs);
    const headers = await buildHeaders(abs, data.byteLength);
    return new Response(data, { status: 200, headers });
  } catch (err: any) {
    const code = err?.code === 'ENOENT' ? 404 : 500;
    return new Response(code === 404 ? 'Not Found' : 'Internal Server Error', { status: code });
  }
}

export async function HEAD(_req: NextRequest, ctx: { params: { path: string[] } }) {
  try {
    const segments = ctx.params?.path || [];
    const abs = path.resolve(BASE_DIR, ...segments);
    const baseAbs = path.resolve(BASE_DIR);
    if (!isSafeChildPath(abs, baseAbs)) {
      return new Response(null, { status: 403 });
    }
    const stat = await fs.stat(abs);
    if (stat.isDirectory()) {
      return new Response(null, { status: 404 });
    }
    const headers = await buildHeaders(abs, stat.size);
    return new Response(null, { status: 200, headers });
  } catch (err: any) {
    const code = err?.code === 'ENOENT' ? 404 : 500;
    return new Response(null, { status: code });
  }
}

