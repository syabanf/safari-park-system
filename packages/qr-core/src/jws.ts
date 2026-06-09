import type { JwsHeader, TokenPayload } from './types';

function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 2 ? '==' : input.length % 4 === 3 ? '=' : '';
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export interface DecodedJws {
  header: JwsHeader;
  payload: TokenPayload;
  signingInput: Uint8Array;
  signature: Uint8Array;
}

export function decodeJws(jws: string): DecodedJws | null {
  const parts = jws.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts as [string, string, string];
  try {
    const header = JSON.parse(bytesToString(base64UrlDecode(h))) as JwsHeader;
    const payload = JSON.parse(bytesToString(base64UrlDecode(p))) as TokenPayload;
    const signingInput = new TextEncoder().encode(`${h}.${p}`);
    const signature = base64UrlDecode(s);
    return { header, payload, signingInput, signature };
  } catch {
    return null;
  }
}

export function encodeJwsPayload(payload: TokenPayload): string {
  return btoa(JSON.stringify(payload)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
