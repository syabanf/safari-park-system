type EventName =
  | 'scan.detected'
  | 'scan.allowed'
  | 'scan.denied'
  | 'scan.offline'
  | 'scan.manual'
  | 'queue.retry'
  | 'queue.batch.start'
  | 'queue.batch.end';

export function track(_event: EventName, _props?: Record<string, unknown>): void {
  // no-op stub
}
