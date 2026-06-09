import type { ApiClient } from '../client';
import {
  type RedemptionRequest,
  type RedemptionResponse,
  redemptionResponseSchema,
} from '../schemas/redemptions';

export async function submitRedemption(
  api: ApiClient,
  body: RedemptionRequest,
): Promise<RedemptionResponse> {
  const json = await api.http.post('redemptions', { json: body }).json();
  return redemptionResponseSchema.parse(json);
}
