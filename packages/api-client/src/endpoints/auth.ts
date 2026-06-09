import type { ApiClient } from '../client';
import {
  type LoginRequest,
  type LoginResponse,
  type StaffLoginRequest,
  loginResponseSchema,
} from '../schemas/auth';

export async function login(api: ApiClient, body: LoginRequest): Promise<LoginResponse> {
  const json = await api.http.post('auth/login', { json: body }).json();
  return loginResponseSchema.parse(json);
}

export async function staffLogin(api: ApiClient, body: StaffLoginRequest): Promise<LoginResponse> {
  const json = await api.http.post('auth/staff/login', { json: body }).json();
  return loginResponseSchema.parse(json);
}

export async function logout(api: ApiClient): Promise<void> {
  await api.http.post('auth/logout');
}
