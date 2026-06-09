import { z } from 'zod';

export const redemptionRequestSchema = z.object({
  jti: z.string(),
  passId: z.string(),
  gateId: z.string(),
  scannedAt: z.number().int().positive(),
  verdict: z.enum(['allow', 'deny', 'manual']),
  reason: z.string().optional(),
});

export const redemptionResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['accepted', 'rejected', 'duplicate']),
  passHolder: z.string().optional(),
  remainingVisits: z.number().int().nullable().optional(),
});

export type RedemptionRequest = z.infer<typeof redemptionRequestSchema>;
export type RedemptionResponse = z.infer<typeof redemptionResponseSchema>;
