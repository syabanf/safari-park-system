type EventName =
  | 'enrolment.started'
  | 'enrolment.completed'
  | 'pass.viewed'
  | 'qr.rendered'
  | 'qr.buffer.refilled'
  | 'qr.buffer.exhausted'
  | 'renewal.initiated';

export function track(_event: EventName, _props?: Record<string, unknown>): void {
  // no-op stub — wire Segment/Amplitude/PostHog later
}
