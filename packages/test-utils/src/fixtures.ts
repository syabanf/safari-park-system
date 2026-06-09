import type { Member, Pass } from '@tsi/api-client';
import type { PublicKeyEntry, TokenBufferEntry } from '@tsi/qr-core';

export function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'm_demo_001',
    email: 'demo@tamansafari.id',
    fullName: 'Demo Member',
    phoneE164: '+6281200000000',
    nationality: 'ID',
    dateOfBirth: '1990-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function makePass(overrides: Partial<Pass> = {}): Pass {
  return {
    id: 'p_demo_001',
    memberId: 'm_demo_001',
    tier: 'adult',
    status: 'active',
    holderName: 'Demo Member',
    validFrom: '2026-01-01',
    validUntil: '2027-01-01',
    visitsAllowed: null,
    visitsUsed: 3,
    issuedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function fakeJws(jti: string, passId: string, exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'EdDSA', kid: 'k_dev_001', typ: 'JWT' }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const payload = btoa(JSON.stringify({ jti, passId, iat: Math.floor(Date.now() / 1000), exp }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const signature = btoa(`fake-signature-${jti}`)
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

export function makeTokenBuffer(count = 10, passId = 'p_demo_001'): TokenBufferEntry[] {
  const now = Math.floor(Date.now() / 1000);
  const windowSec = 45;
  return Array.from({ length: count }, (_, i) => {
    const iat = now + i * windowSec;
    const exp = iat + windowSec + 5;
    const jti = `jti_${now}_${i}`;
    return {
      jws: fakeJws(jti, passId, exp),
      jti,
      kid: 'k_dev_001',
      exp,
      iat,
      passId,
    };
  });
}

export function makePublicKey(overrides: Partial<PublicKeyEntry> = {}): PublicKeyEntry {
  const now = Math.floor(Date.now() / 1000);
  return {
    kid: 'k_dev_001',
    publicKey: 'AAAA-dev-public-key-placeholder',
    algorithm: 'EdDSA',
    notBefore: now - 86400,
    notAfter: now + 86400 * 30,
    ...overrides,
  };
}
