import { z } from 'zod';

export const publicKeySchema = z.object({
  kid: z.string(),
  publicKey: z.string(),
  algorithm: z.literal('EdDSA'),
  notBefore: z.number().int().positive(),
  notAfter: z.number().int().positive(),
});

export const activeKeysResponseSchema = z.object({
  keys: z.array(publicKeySchema),
});

export type PublicKey = z.infer<typeof publicKeySchema>;
export type ActiveKeysResponse = z.infer<typeof activeKeysResponseSchema>;
