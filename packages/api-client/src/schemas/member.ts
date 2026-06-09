import { z } from 'zod';

export const memberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phoneE164: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  createdAt: z.string(),
});

export const enrolmentRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phoneE164: z.string().min(8),
  dateOfBirth: z.string(),
  nationality: z.string().min(2),
  consentMarketing: z.boolean().default(false),
  consentDataProcessing: z.boolean(),
});

export type Member = z.infer<typeof memberSchema>;
export type EnrolmentRequest = z.infer<typeof enrolmentRequestSchema>;
