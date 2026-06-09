import type { ApiClient } from '../client';
import { type Pass, passSchema } from '../schemas/pass';

export async function getMyPass(api: ApiClient): Promise<Pass> {
  const json = await api.http.get('passes/me').json();
  return passSchema.parse(json);
}

export async function getPassById(api: ApiClient, id: string): Promise<Pass> {
  const json = await api.http.get(`passes/${id}`).json();
  return passSchema.parse(json);
}

export async function renewPass(api: ApiClient): Promise<Pass> {
  const json = await api.http.post('passes/me/renew').json();
  return passSchema.parse(json);
}
