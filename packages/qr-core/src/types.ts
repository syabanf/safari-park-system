export interface TokenBufferEntry {
  jws: string;
  jti: string;
  kid: string;
  exp: number;
  iat: number;
  passId: string;
}

export interface PublicKeyEntry {
  kid: string;
  publicKey: string;
  algorithm: 'EdDSA';
  notBefore: number;
  notAfter: number;
}

export type VerificationResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; reason: VerificationFailure };

export type VerificationFailure =
  | 'expired'
  | 'not-yet-valid'
  | 'signature-invalid'
  | 'jti-replay'
  | 'unknown-kid'
  | 'malformed';

export interface TokenPayload {
  jti: string;
  passId: string;
  iat: number;
  exp: number;
  nbf?: number;
}

export interface JwsHeader {
  alg: 'EdDSA';
  kid: string;
  typ?: 'JWT';
}
