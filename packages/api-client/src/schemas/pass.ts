import { z } from 'zod';

export const passTierSchema = z.enum(['adult', 'child', 'senior', 'family']);
export const passStatusSchema = z.enum(['active', 'expired', 'suspended', 'pending']);

export const passSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  tier: passTierSchema,
  status: passStatusSchema,
  holderName: z.string(),
  validFrom: z.string(),
  validUntil: z.string(),
  visitsAllowed: z.number().int().nonnegative().nullable(),
  visitsUsed: z.number().int().nonnegative(),
  issuedAt: z.string(),
});

export type Pass = z.infer<typeof passSchema>;
export type PassTier = z.infer<typeof passTierSchema>;
export type PassStatus = z.infer<typeof passStatusSchema>;
