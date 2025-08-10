// 文件预览/流式播放 URL 生成工具（通过网关，使用相对路径）

export type FitMode = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

export interface PreviewParams {
  w?: number; // 输出宽度
  h?: number; // 输出高度
  fit?: FitMode; // 适应方式
  format?: string; // 输出格式，如 jpg/png/webp
  q?: number; // 质量 1-100
  t?: number; // 视频时间点（秒）
  frame?: number; // 视频帧（替代 t）
}

function buildQuery(params?: PreviewParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.w) search.set('w', String(params.w));
  if (params.h) search.set('h', String(params.h));
  if (params.fit) search.set('fit', params.fit);
  if (params.format) search.set('format', params.format);
  if (params.q) search.set('q', String(params.q));
  if (typeof params.t === 'number') search.set('t', String(params.t));
  if (typeof params.frame === 'number') search.set('frame', String(params.frame));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// 缩略图/截帧预览（图片/视频）
export function getFilePreviewUrl(fileId: string, params?: PreviewParams): string {
  // 通过网关：/file/api/...
  return `/file/api/file/preview/${encodeURIComponent(fileId)}${buildQuery(params)}`;
}

// 流式播放（视频）
export function getFileStreamUrl(fileId: string): string {
  return `/file/api/file/preview/stream/${encodeURIComponent(fileId)}`;
}

// 原始文件访问（图片/GIF/其他）
export function getFileDownloadUrl(fileId: string, attachment: boolean = false): string {
  const qs = attachment ? '?attachment=true' : '?attachment=false';
  return `/file/api/file/preview/download/${encodeURIComponent(fileId)}${qs}`;
}

// 获取文件基础信息（如需要元数据）
export function getFileInfoApiPath(fileId: string): string {
  return `/file/api/file/preview/info/${encodeURIComponent(fileId)}`;
}

