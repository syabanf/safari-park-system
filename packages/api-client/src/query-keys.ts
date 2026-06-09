export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => ['auth', 'session'] as const,
  },
  member: {
    all: ['member'] as const,
    me: () => ['member', 'me'] as const,
  },
  pass: {
    all: ['pass'] as const,
    mine: () => ['pass', 'mine'] as const,
    byId: (id: string) => ['pass', 'byId', id] as const,
  },
  tokens: {
    all: ['tokens'] as const,
    buffer: () => ['tokens', 'buffer'] as const,
  },
  keys: {
    all: ['keys'] as const,
    active: () => ['keys', 'active'] as const,
  },
  redemptions: {
    all: ['redemptions'] as const,
    recent: () => ['redemptions', 'recent'] as const,
  },
} as const;
