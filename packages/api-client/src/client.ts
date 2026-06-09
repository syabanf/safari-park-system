import ky, { type KyInstance } from 'ky';

export interface ApiClientOptions {
  baseUrl: string;
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void | Promise<void>;
}

export interface ApiClient {
  http: KyInstance;
  setAuthToken: (token: string | null) => void;
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
  let currentToken: string | null = opts.getAuthToken?.() ?? null;

  const http = ky.create({
    prefixUrl: opts.baseUrl,
    timeout: 10_000,
    retry: { limit: 2, methods: ['get'] },
    hooks: {
      beforeRequest: [
        (req) => {
          if (currentToken) {
            req.headers.set('Authorization', `Bearer ${currentToken}`);
          }
        },
      ],
      afterResponse: [
        async (_req, _opts, res) => {
          if (res.status === 401) {
            await opts.onUnauthorized?.();
          }
          return res;
        },
      ],
    },
  });

  return {
    http,
    setAuthToken(token: string | null) {
      currentToken = token;
    },
  };
}
