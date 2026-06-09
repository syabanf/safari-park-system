import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().int().positive(),
});

export const staffLoginRequestSchema = z.object({
  username: z.string().min(1),
  pin: z.string().min(4),
  gateId: z.string().min(1).optional(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type StaffLoginRequest = z.infer<typeof staffLoginRequestSchema>;
