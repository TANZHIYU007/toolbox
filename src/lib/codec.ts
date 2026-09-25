/**
 * Base64 编解码。
 * 不直接用 btoa/atob：它们只认 Latin-1，中文会直接抛错，
 * 必须先过 TextEncoder 转成字节。
 */
export function utf8ToBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary);
  return urlSafe
    ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    : encoded;
}

/** 同时兼容标准 Base64 和 URL-safe 变体，缺失的 padding 会自动补齐 */
export function base64ToUtf8(input: string): string {
  const normalized = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/** 字符集和长度粗筛，给 detect() 用，避免对任意文本都去跑一遍 atob */
export function looksLikeBase64(text: string): boolean {
  const s = text.replace(/\s+/g, '');
  if (s.length < 8) return false;
  if (!/^[A-Za-z0-9+/\-_]+={0,2}$/.test(s)) return false;
  return s.replace(/=+$/, '').length % 4 !== 1;
}

/** 解码结果里可打印字符的占比，用来判断「解出来的是人话还是二进制乱码」 */
export function printableRatio(text: string): number {
  if (text.length === 0) return 0;
  // eslint-disable-next-line no-control-regex
  const junk = text.match(/[\u0000-\u0008\u000E-\u001F�]/g);
  return 1 - (junk?.length ?? 0) / text.length;
}

export function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
