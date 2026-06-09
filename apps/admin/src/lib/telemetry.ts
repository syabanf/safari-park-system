type EventName = 'admin.viewed' | 'admin.action';

export function track(_event: EventName, _props?: Record<string, unknown>): void {
  // no-op
}
