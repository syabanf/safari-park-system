import { z } from 'zod';

export const tokenBufferRequestSchema = z.object({
  count: z.number().int().min(1).max(50),
  deviceId: z.string().min(1),
});

export const tokenBufferEntrySchema = z.object({
  jws: z.string(),
  jti: z.string(),
  kid: z.string(),
  exp: z.number().int().positive(),
  iat: z.number().int().positive(),
  passId: z.string(),
});

export const tokenBufferResponseSchema = z.object({
  tokens: z.array(tokenBufferEntrySchema),
  refreshAfter: z.number().int().positive(),
});

export type TokenBufferRequest = z.infer<typeof tokenBufferRequestSchema>;
export type TokenBufferResponse = z.infer<typeof tokenBufferResponseSchema>;
