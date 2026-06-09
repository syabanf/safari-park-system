import { ed25519 } from '@noble/curves/ed25519';
import { decodeJws } from './jws';
import type { PublicKeyEntry, VerificationResult } from './types';

interface VerifyOptions {
  publicKeys: PublicKeyEntry[];
  now?: number;
  isReplayed?: (jti: string) => boolean;
  clockSkewSeconds?: number;
}

function base64UrlToBytes(input: string): Uint8Array {
  const pad = input.length % 4 === 2 ? '==' : input.length % 4 === 3 ? '=' : '';
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function verifyToken(jws: string, opts: VerifyOptions): VerificationResult {
  const decoded = decodeJws(jws);
  if (!decoded) return { ok: false, reason: 'malformed' };

  const { header, payload, signingInput, signature } = decoded;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const skew = opts.clockSkewSeconds ?? 5;

  if (header.alg !== 'EdDSA') return { ok: false, reason: 'malformed' };

  const key = opts.publicKeys.find((k) => k.kid === header.kid);
  if (!key) return { ok: false, reason: 'unknown-kid' };
  if (now + skew < key.notBefore) return { ok: false, reason: 'not-yet-valid' };
  if (now - skew > key.notAfter) return { ok: false, reason: 'expired' };

  if (payload.nbf && now + skew < payload.nbf) return { ok: false, reason: 'not-yet-valid' };
  if (now - skew > payload.exp) return { ok: false, reason: 'expired' };

  if (opts.isReplayed?.(payload.jti)) return { ok: false, reason: 'jti-replay' };

  const publicKeyBytes = base64UrlToBytes(key.publicKey);
  const valid = ed25519.verify(signature, signingInput, publicKeyBytes);
  if (!valid) return { ok: false, reason: 'signature-invalid' };

  return { ok: true, payload };
}
