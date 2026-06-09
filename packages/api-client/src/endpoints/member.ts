import type { ApiClient } from '../client';
import { type EnrolmentRequest, type Member, memberSchema } from '../schemas/member';

export async function getMe(api: ApiClient): Promise<Member> {
  const json = await api.http.get('members/me').json();
  return memberSchema.parse(json);
}

export async function enrol(api: ApiClient, body: EnrolmentRequest): Promise<Member> {
  const json = await api.http.post('members', { json: body }).json();
  return memberSchema.parse(json);
}
