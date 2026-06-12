// Vendor-integration fixtures for the admin Integrations section.
// Shapes mirror what a real ACL service would expose to the front-end after
// summarising vendor state — nothing here calls a real vendor.

const now = Date.now();
const pastH = (h: number) => new Date(now - h * 3_600_000).toISOString();
const pastD = (d: number) => new Date(now - d * 86_400_000).toISOString();
const inD = (d: number) => new Date(now + d * 86_400_000).toISOString();

// ─── GlobalTix (ticketing) ─────────────────────────────────────────

export function makeGlobalTixIntegration() {
  return {
    vendor: 'globaltix' as const,
    displayName: 'GlobalTix',
    subtitle: 'Singapore · core ticketing platform',
    status: 'connected' as const,
    environment: 'staging' as const, // 'staging' | 'production'
    health: 'healthy' as const, // 'healthy' | 'degraded' | 'down'
    baseUrl: 'https://stg-api.globaltix.com',
    productionBaseUrl: 'https://sg-api.globaltix.com',
    authMethod: 'JWT (username + password → 24h Bearer)',
    tokenExpiresAt: pastH(-23.4), // 23.4h from now (still valid)
    lastTokenRefresh: pastH(0.6),
    integrationModel:
      'Hybrid — WIT mints, GT records. Every WIT redemption mirrors a Duration ticket booking in GT.',
    summary: {
      todayRedemptions: 412,
      todayGtConfirmed: 408,
      todayGtPending: 4,
      todayGtFailed: 0,
      sevenDayRedemptions: 2_140,
      sevenDayReconciliationPct: 99.81,
      avgRoundTripMs: 348,
      webhooksReceived24h: 412,
      webhookSignatureFailures24h: 0,
    },
    // Every business-affecting flow across the GT integration.
    // Each pipeline is a 4–5 step pipeline with realistic counts; drop-offs
    // tell operators where money / experience is leaking.
    pipelines: [
      {
        key: 'ap-redemption',
        label: 'AP redemption',
        description: 'Every time a guest enters the park, the visit is mirrored to GlobalTix so both systems always agree on who came in.',
        category: 'gate' as const,
        frequency: 'per gate scan',
        todayVolume: 412,
        lastActivity: pastH(0.1),
        successRatePct: 99.03,
        stages: [
          { key: 'wit-validated', label: 'Guest enters the park', description: 'A gate scans the pass and lets the guest in — this works even if the internet drops.', count: 412, system: 'WIT' as const, avgLatencyMs: 12, tech: 'WIT gate validation (online or offline)' },
          { key: 'gt-reserved', label: 'Hold the visit at GlobalTix', description: 'We reserve a matching ticket in GlobalTix so the visit is on their books too.', count: 412, system: 'GT' as const, avgLatencyMs: 142, tech: 'POST /api/booking/reserve' },
          { key: 'gt-confirmed', label: 'Confirm the visit', description: 'GlobalTix accepts the booking and marks it confirmed.', count: 410, system: 'GT' as const, avgLatencyMs: 168, tech: 'POST /api/booking/confirm' },
          { key: 'gt-redeemed', label: 'Mark the visit as used', description: 'The ticket is flipped to “used” so a single visit can never be counted twice.', count: 408, system: 'GT' as const, avgLatencyMs: 38, tech: 'IssuedTicketStatus → REDEEMED' },
          { key: 'webhook-ack', label: 'Both systems agree', description: 'GlobalTix confirms back to us that the visit is recorded — now the two systems match.', count: 408, system: 'WIT' as const, avgLatencyMs: 920, tech: 'TICKET_REDEEM webhook + signature check' },
        ],
      },
      {
        key: 'new-booking',
        label: 'New booking · sales',
        description: 'Selling something other than an entry: pass renewals, companion tickets, and F&B add-ons bought in the member app or admin console.',
        category: 'transaction' as const,
        frequency: 'per checkout',
        todayVolume: 87,
        lastActivity: pastH(0.4),
        successRatePct: 96.55,
        stages: [
          { key: 'availability', label: 'Check availability', description: 'We confirm the date and ticket type can still be sold before taking any money.', count: 92, system: 'WIT' as const, avgLatencyMs: 180, tech: 'GET /api/ticketType/checkEventAvailability' },
          { key: 'reserved', label: 'Hold the booking', description: 'GlobalTix holds the seats while the guest pays.', count: 90, system: 'GT' as const, avgLatencyMs: 220, tech: 'POST /api/booking/reserve · RESERVED' },
          { key: 'payment', label: 'Take payment', description: 'The guest pays; we wait for the payment to clear before finalising.', count: 88, system: 'WIT' as const, avgLatencyMs: 1_840, tech: 'Payment gateway settle' },
          { key: 'confirmed', label: 'Confirm the booking', description: 'GlobalTix confirms the sale and the seats are locked in for the guest.', count: 87, system: 'GT' as const, avgLatencyMs: 196, tech: 'POST /api/booking/confirm · CONFIRMED' },
          { key: 'eticket-ready', label: 'Send the e-ticket', description: 'The guest receives their ticket, ready to scan at the gate.', count: 84, system: 'WIT' as const, avgLatencyMs: 28_000, tech: 'BOOKING_TRANSACTION_UPDATE · isTicketsReady' },
        ],
      },
      {
        key: 'cancellation',
        label: 'Cancellation · refund',
        description: 'When a guest cancels before their visit, we void the ticket and refund them if the cancellation policy still allows it.',
        category: 'transaction' as const,
        frequency: 'on customer request',
        todayVolume: 4,
        lastActivity: pastH(3.2),
        successRatePct: 100,
        stages: [
          { key: 'cancel-requested', label: 'Cancellation requested', description: 'A guest or staff member asks to cancel a ticket.', count: 4, system: 'WIT' as const, avgLatencyMs: 8, tech: 'Revoke initiated' },
          { key: 'cutoff-check', label: 'Check refund eligibility', description: 'We check the cancellation policy to see whether a refund is still allowed.', count: 4, system: 'WIT' as const, avgLatencyMs: 6, tech: 'Compare vs cancellationPolicy.refundDuration' },
          { key: 'gt-revoke', label: 'Cancel at GlobalTix', description: 'GlobalTix voids the ticket so it can no longer be used.', count: 4, system: 'GT' as const, avgLatencyMs: 412, tech: 'GET /api/transaction/revoke' },
          { key: 'ticket-revoked', label: 'Confirm it is voided', description: 'GlobalTix confirms the ticket is cancelled on their side too.', count: 4, system: 'WIT' as const, avgLatencyMs: 1_120, tech: 'TICKET_REVOKE webhook · REVOKED' },
          { key: 'refund-issued', label: 'Return the money', description: 'The payment is refunded back to the guest.', count: 3, system: 'WIT' as const, avgLatencyMs: 3_400, tech: 'Payment gateway refund' },
        ],
      },
      {
        key: 'reservation-timeout',
        label: 'Reservation timeout',
        description: 'When a guest starts a booking but does not pay within an hour, the held seats are released automatically. A rising count here means people are abandoning checkout.',
        category: 'risk' as const,
        frequency: 'background timer',
        todayVolume: 9,
        lastActivity: pastH(1.8),
        successRatePct: 100,
        stages: [
          { key: 'reserved', label: 'Booking held', description: 'Seats are held while the guest finishes paying.', count: 9, system: 'GT' as const, avgLatencyMs: 220, tech: 'POST /api/booking/reserve · RESERVED' },
          { key: 'timer-started', label: 'One-hour timer starts', description: 'The hold lasts one hour while we wait for the guest to pay.', count: 9, system: 'WIT' as const, avgLatencyMs: 0, tech: '1h countdown' },
          { key: 'timer-fired', label: 'Guest did not finish', description: 'The hour passed without payment — the guest left checkout.', count: 9, system: 'WIT' as const, avgLatencyMs: 0, tech: 'Checkout abandoned' },
          { key: 'auto-released', label: 'Seats released', description: 'GlobalTix automatically frees the held seats for someone else.', count: 9, system: 'GT' as const, avgLatencyMs: null, tech: 'Auto-release' },
          { key: 'credits-returned', label: 'Allocation restored', description: 'The held inventory is returned so nothing is lost.', count: 9, system: 'GT' as const, avgLatencyMs: 220, tech: 'Reseller credits restored' },
        ],
      },
      {
        key: 'catalogue-sync',
        label: 'Catalogue sync',
        description: 'We refresh the list of products and prices from GlobalTix several times a day so guests always see what is currently on sale.',
        category: 'catalogue' as const,
        frequency: '4× daily + event-driven',
        todayVolume: 5,
        lastActivity: pastH(1.5),
        successRatePct: 100,
        stages: [
          { key: 'countries', label: 'Pull the catalogue', description: 'We ask GlobalTix for the current list of parks and attractions.', count: 5, system: 'GT' as const, avgLatencyMs: 320, tech: 'GET /api/country/getAllCountries' },
          { key: 'list', label: 'List every product', description: 'We read every product currently on sale.', count: 5, system: 'GT' as const, avgLatencyMs: 480, tech: 'GET /api/product/list (16/page)' },
          { key: 'info', label: 'Read product details', description: 'For each product we pull its full description and rules.', count: 5, system: 'GT' as const, avgLatencyMs: 8_200, tech: 'GET /api/product/info per product' },
          { key: 'options', label: 'Read prices and options', description: 'We pull the ticket types and prices for each product.', count: 5, system: 'GT' as const, avgLatencyMs: 6_400, tech: 'GET /api/product/options per product' },
          { key: 'local-refresh', label: 'Update the member app', description: 'The app now shows the latest products and prices to guests.', count: 5, system: 'WIT' as const, avgLatencyMs: 90, tech: 'Local cache refreshed' },
        ],
      },
      {
        key: 'price-update',
        label: 'Price update',
        description: 'When GlobalTix changes a price, we update it everywhere so guests never see an out-of-date figure.',
        category: 'catalogue' as const,
        frequency: 'event-driven',
        todayVolume: 3,
        lastActivity: pastH(4.1),
        successRatePct: 100,
        stages: [
          { key: 'webhook-received', label: 'GlobalTix changes a price', description: 'GlobalTix tells us a product price has changed.', count: 3, system: 'GT' as const, avgLatencyMs: 220, tech: 'PRICE_UPDATE webhook' },
          { key: 'signature-verified', label: 'Check it is genuine', description: 'We verify the message really came from GlobalTix.', count: 3, system: 'WIT' as const, avgLatencyMs: 4, tech: 'HMAC signature check' },
          { key: 'price-stored', label: 'Save the new price', description: 'The updated price is recorded in our system.', count: 3, system: 'WIT' as const, avgLatencyMs: 18, tech: 'Store newNettPrice' },
          { key: 'cache-busted', label: 'Clear the old price', description: 'We remove the old cached price so nobody sees a stale figure.', count: 3, system: 'WIT' as const, avgLatencyMs: 1_200, tech: 'Cache invalidation' },
          { key: 'member-app-sees', label: 'Guests see the new price', description: 'The member app now shows the correct, current price.', count: 3, system: 'WIT' as const, avgLatencyMs: 0, tech: 'Next /perks fetch' },
        ],
      },
      {
        key: 'ticket-expiry',
        label: 'Ticket expiry',
        description: 'When a ticket goes unused past its valid period, we mark it expired and let the guest know.',
        category: 'lifecycle' as const,
        frequency: 'event-driven',
        todayVolume: 12,
        lastActivity: pastH(0.7),
        successRatePct: 100,
        stages: [
          { key: 'window-end', label: 'Ticket window closes', description: 'A ticket reaches the end of the period it was valid for.', count: 12, system: 'GT' as const, avgLatencyMs: 0, tech: 'TicketValidity.redeemEnd reached' },
          { key: 'expired-webhook', label: 'GlobalTix marks it expired', description: 'GlobalTix tells us the ticket expired unused.', count: 12, system: 'GT' as const, avgLatencyMs: 240, tech: 'TICKET_EXPIRED webhook' },
          { key: 'status-updated', label: 'Update our records', description: 'We mark the ticket as expired on our side too.', count: 12, system: 'WIT' as const, avgLatencyMs: 22, tech: 'Status → EXPIRED' },
          { key: 'member-notified', label: 'Let the guest know', description: 'The guest sees a note that a ticket expired without being used.', count: 11, system: 'WIT' as const, avgLatencyMs: 380, tech: 'In-app banner' },
        ],
      },
      {
        key: 'token-rotation',
        label: 'Auth token rotation',
        description: 'We keep our GlobalTix connection signed in, renewing the login each day before it lapses. If this ever fails, nothing can sync to GlobalTix until it is fixed.',
        category: 'security' as const,
        frequency: 'every 23h',
        todayVolume: 1,
        lastActivity: pastH(0.6),
        successRatePct: 100,
        stages: [
          { key: 'ttl-check', label: 'Check the login age', description: 'A background check looks at how old our GlobalTix login is.', count: 1, system: 'WIT' as const, avgLatencyMs: 2, tech: 'Inspect cached token age' },
          { key: 'pre-expiry-trigger', label: 'Renew before it lapses', description: 'We renew the login early so the connection never drops mid-day.', count: 1, system: 'WIT' as const, avgLatencyMs: 0, tech: 'Triggered at 23h' },
          { key: 'login-called', label: 'Sign in to GlobalTix', description: 'We sign in again to get a fresh access pass.', count: 1, system: 'GT' as const, avgLatencyMs: 412, tech: 'POST /api/auth/login' },
          { key: 'token-cached', label: 'Save the new login', description: 'The fresh login is stored and put to work.', count: 1, system: 'WIT' as const, avgLatencyMs: 4, tech: 'New token cached' },
          { key: 'old-retired', label: 'Retire the old one', description: 'The previous login is discarded.', count: 1, system: 'WIT' as const, avgLatencyMs: 2, tech: 'Old token removed' },
        ],
      },
    ],
    syncHistory: Array.from({ length: 12 }, (_, i) => {
      const offset = 11 - i;
      const total = 280 + Math.round(60 * Math.sin(i * 0.7)) + offset * 6;
      const failed = i === 4 ? 12 : i === 9 ? 3 : 0;
      return {
        date: new Date(now - offset * 86_400_000).toISOString().slice(0, 10),
        attempted: total,
        confirmed: total - failed,
        failed,
        avgLatencyMs: 280 + Math.round(40 * Math.cos(i * 0.5)),
      };
    }),
    reconciliationDrift: [
      {
        id: 'recon-001',
        redemptionId: 'red-9821',
        passId: 'p_demo_4421',
        gateId: 'gate-bgr-02',
        witAt: pastH(2.3),
        gtConfirmedAt: null,
        ageMinutes: 138,
        attempts: 4,
        stage: 'gt-reserved' as const,
        lastError: 'GT 503 — Upstream timeout (after 3 retries)',
        severity: 'high' as const,
      },
      {
        id: 'recon-002',
        redemptionId: 'red-9783',
        passId: 'p_demo_3092',
        gateId: 'gate-prg-01',
        witAt: pastH(5.1),
        gtConfirmedAt: null,
        ageMinutes: 306,
        attempts: 5,
        stage: 'gt-confirmed' as const,
        lastError: 'GT 400 — Reference number collision',
        severity: 'high' as const,
      },
      {
        id: 'recon-003',
        redemptionId: 'red-9755',
        passId: 'p_demo_2814',
        gateId: 'gate-bgr-01',
        witAt: pastH(8.4),
        gtConfirmedAt: null,
        ageMinutes: 504,
        attempts: 8,
        stage: 'gt-redeemed' as const,
        lastError: 'GT 401 — Token rotated mid-flight',
        severity: 'medium' as const,
      },
      {
        id: 'recon-004',
        redemptionId: 'red-9601',
        passId: 'p_demo_1029',
        gateId: 'gate-bal-01',
        witAt: pastH(22),
        gtConfirmedAt: null,
        ageMinutes: 1320,
        attempts: 12,
        stage: 'webhook-ack' as const,
        lastError: 'GT 422 — Product option deactivated',
        severity: 'medium' as const,
      },
    ],
    recentWebhooks: [
      { id: 'wh-2231', eventType: 'TICKET_REDEEM', receivedAt: pastH(0.1), signatureOk: true, referenceNumber: 'TSI04B9GT' },
      { id: 'wh-2230', eventType: 'TICKET_REDEEM', receivedAt: pastH(0.2), signatureOk: true, referenceNumber: 'TSI04A2GT' },
      { id: 'wh-2229', eventType: 'BOOKING_TRANSACTION_UPDATE', receivedAt: pastH(0.3), signatureOk: true, referenceNumber: 'TSI049XGT' },
      { id: 'wh-2228', eventType: 'TICKET_REDEEM', receivedAt: pastH(0.5), signatureOk: true, referenceNumber: 'TSI049KGT' },
      { id: 'wh-2227', eventType: 'TICKET_EXPIRED', receivedAt: pastH(0.7), signatureOk: true, referenceNumber: 'TSI048MGT' },
      { id: 'wh-2226', eventType: 'TICKET_REDEEM', receivedAt: pastH(0.9), signatureOk: true, referenceNumber: 'TSI048AGT' },
      { id: 'wh-2225', eventType: 'PRICE_UPDATE', receivedAt: pastH(1.4), signatureOk: true, referenceNumber: '—' },
      { id: 'wh-2224', eventType: 'TICKET_REDEEM', receivedAt: pastH(1.6), signatureOk: true, referenceNumber: 'TSI046ZGT' },
      { id: 'wh-2223', eventType: 'BOOKING_TICKET_UPDATE', receivedAt: pastH(2.1), signatureOk: true, referenceNumber: 'TSI045AGT' },
      { id: 'wh-2222', eventType: 'TICKET_REDEEM', receivedAt: pastH(2.4), signatureOk: true, referenceNumber: 'TSI044RGT' },
    ],
    fieldMapping: [
      { witField: 'Pass.id', gtField: 'productOption.id (custom "TSI AP Visit" product)', note: 'WIT-native; GT used for reconciliation only.' },
      { witField: 'Redemption.jti', gtField: 'booking.partnerReference', note: 'One redemption = one booking.' },
      { witField: 'Redemption.scannedAt', gtField: 'booking.confirmTime', note: 'GT confirms within 348ms avg.' },
      { witField: 'Redemption.verdict=allow', gtField: 'IssuedTicketStatus → REDEEMED', note: 'Allow flips ticket immediately.' },
      { witField: 'Redemption.verdict=deny', gtField: '(no GT call)', note: 'Denials never reach GT.' },
      { witField: 'Member.id', gtField: '— (no member API)', note: 'GT only sees customerName + email per booking.' },
      { witField: 'Pass.visitsAllowed', gtField: '— (no multi-visit)', note: 'Gap #1; WIT enforces.' },
      { witField: 'TokenBufferEntry.jws', gtField: '— (GT is static QR)', note: 'Gap #2; WIT-native rotating tokens.' },
    ],
    products: [
      { gtProductId: 53081, gtTicketTypeId: 256011, name: 'TSI Annual Pass Visit · Adult', validity: 'Duration · 1 day', allocatedLast24h: 312, nettPrice: '—' },
      { gtProductId: 53081, gtTicketTypeId: 256016, name: 'TSI Annual Pass Visit · Child', validity: 'Duration · 1 day', allocatedLast24h: 87, nettPrice: '—' },
      { gtProductId: 53081, gtTicketTypeId: 256019, name: 'TSI Annual Pass Visit · Senior', validity: 'Duration · 1 day', allocatedLast24h: 13, nettPrice: '—' },
    ],
    gaps: [
      {
        id: 'gt-gap-1',
        severity: 'high' as const,
        title: 'No multi-visit / re-entry model',
        impact: 'AP needs unlimited entries; GT PARTIALLY_REDEEMED is packages-only.',
        workaround: 'One Duration ticket created + redeemed per visit. ACL absorbs the cost.',
        phaseTwoArgument: 'WIT entitlement ledger does this natively — no per-visit booking overhead.',
      },
      {
        id: 'gt-gap-2',
        severity: 'high' as const,
        title: 'No dynamic / rotating QR',
        impact: 'Static codes are share/replay-vulnerable. AP fraud risk.',
        workaround: 'WIT issues rotating QR token buffer; GT never sees them.',
        phaseTwoArgument: 'WIT anti-share validation is core to the AP value prop.',
      },
      {
        id: 'gt-gap-3',
        severity: 'medium' as const,
        title: 'No customer / member identity API',
        impact: 'Only customerName + email per booking. Cannot query "passes for member X".',
        workaround: 'WIT owns identity; GT is fed event-by-event.',
        phaseTwoArgument: 'A real ticketing core needs proper member objects.',
      },
      {
        id: 'gt-gap-4',
        severity: 'medium' as const,
        title: 'No native annual pass / season concept',
        impact: 'Closest validity model is "Duration N days", still single-use within a window.',
        workaround: 'Modelled around it; reconciliation works.',
        phaseTwoArgument: 'Annual passes / season tickets are first-class in any modern ticketing system.',
      },
      {
        id: 'gt-gap-5',
        severity: 'low' as const,
        title: 'Per-ticket webhook only',
        impact: 'No booking-level "consumed across multi-entry" event; we synthesise it from per-ticket REDEEMED.',
        workaround: 'ACL aggregates events.',
        phaseTwoArgument: 'A native booking lifecycle event would simplify reconciliation.',
      },
      {
        id: 'gt-gap-6',
        severity: 'low' as const,
        title: 'STG environment lags PROD',
        impact: 'STG duplicated from PROD only "1-2x per year" — new product changes invisible in test.',
        workaround: 'Smoke tests must include PROD with feature flag.',
        phaseTwoArgument: 'Real partners need a continuously-synced sandbox.',
      },
    ],
    config: {
      webhookEndpoint: 'https://api.tsi-annualpass.id/v1/admin/webhooks/gt',
      retryStrategy: 'Exponential, 5 attempts, 1s → 16s',
      circuitBreaker: 'Open after 10 consecutive 5xx in 60s',
      lastConfigChange: pastD(8),
      configChangedBy: 'admin@tamansafari.id',
    },
    blackbox: makeBlackbox('globaltix'),
  };
}

// ─── Blackbox: heartbeat + raw API call log + connection metrics ─

function makeBlackbox(vendor: 'globaltix' | 'esb') {
  const isProvisional = vendor === 'esb';

  const heartbeatHistory = Array.from({ length: 48 }, (_, i) => {
    const at = new Date(now - (47 - i) * 30 * 60_000).toISOString(); // every 30 min · 24h
    const ok = isProvisional ? false : i === 16 || i === 17 ? false : true; // a 1h blip yesterday
    return {
      at,
      ok,
      latencyMs: ok ? 280 + Math.round(80 * Math.sin(i * 0.7)) + (i % 6) * 4 : null,
    };
  });
  const successesIn24h = heartbeatHistory.filter((h) => h.ok).length;
  const uptimePct = isProvisional ? 0 : Math.round((successesIn24h / heartbeatHistory.length) * 10_000) / 100;

  const endpoints = isProvisional
    ? [
        { method: 'POST', path: '/oms/voucher/apply', purpose: 'apply-discount' },
        { method: 'POST', path: '/oms/voucher/issue', purpose: 'issue-voucher' },
        { method: 'GET', path: '/oms/order/{ref}', purpose: 'order-status' },
        { method: 'POST', path: '/oms/order/{ref}/close', purpose: 'order-closed-cb' },
      ]
    : [
        { method: 'POST', path: '/api/booking/reserve', purpose: 'reserve' },
        { method: 'POST', path: '/api/booking/confirm', purpose: 'confirm' },
        { method: 'GET', path: '/api/booking/details', purpose: 'details' },
        { method: 'GET', path: '/api/transaction/revoke', purpose: 'revoke' },
        { method: 'GET', path: '/api/ticketType/checkEventAvailability', purpose: 'availability' },
        { method: 'POST', path: '/api/auth/login', purpose: 'auth' },
        { method: 'GET', path: '/api/product/info', purpose: 'product-info' },
      ];

  // ~25 most recent calls, newest first.
  const calls = Array.from({ length: 25 }, (_, i) => {
    const ep = endpoints[i % endpoints.length]!;
    const at = new Date(now - i * (45 + ((i * 17) % 90)) * 1_000).toISOString();
    // Mostly 2xx; sprinkle a 4xx/5xx/timeout to make the log honest.
    const statusFlavour = i === 3 ? 503 : i === 7 ? 400 : i === 11 ? 401 : i === 19 ? 0 : 200;
    const statusCode = isProvisional ? 0 : statusFlavour;
    const latencyMs = statusCode === 0 ? 30_000 : 120 + ((i * 47) % 320);
    return {
      id: `call-${i.toString().padStart(4, '0')}`,
      at,
      direction: i % 6 === 0 ? ('inbound' as const) : ('outbound' as const), // mostly outbound
      method: i % 6 === 0 ? 'POST' : ep.method,
      endpoint: i % 6 === 0 ? '/api/v1/admin/webhooks/gt' : ep.path,
      purpose: i % 6 === 0 ? 'webhook-receive' : ep.purpose,
      statusCode,
      latencyMs,
      sizeBytes: 240 + ((i * 113) % 1_800),
      correlationId: `cid-${Math.random().toString(36).slice(2, 10)}`,
      retryAttempt: statusCode >= 500 || statusCode === 0 ? Math.min(i % 4, 3) : 0,
    };
  });

  const okLatencies = calls.filter((c) => c.statusCode >= 200 && c.statusCode < 300).map((c) => c.latencyMs);
  const sorted = okLatencies.slice().sort((a, b) => a - b);
  const pct = (p: number) => (sorted.length ? sorted[Math.min(Math.floor(sorted.length * p), sorted.length - 1)]! : 0);

  return {
    heartbeat: {
      lastPingAt: isProvisional ? null : pastH(0.01),
      lastPingOk: !isProvisional,
      lastPingLatencyMs: isProvisional ? null : 264,
      uptime24hPct: uptimePct,
      consecutiveSuccess: isProvisional ? 0 : 28,
      consecutiveFailure: isProvisional ? 0 : 0,
      nextProbeAt: isProvisional ? null : new Date(now + 30_000).toISOString(),
      probeIntervalSec: 30,
      history: heartbeatHistory,
    },
    connection: {
      p50LatencyMs: pct(0.5),
      p95LatencyMs: pct(0.95),
      p99LatencyMs: pct(0.99),
      errorRate1hPct: isProvisional ? 100 : 0.97,
      throughputPerMin: isProvisional ? 0 : 17.3,
      tlsHandshakeMs: isProvisional ? null : 84,
      dnsLookupMs: isProvisional ? null : 12,
    },
    recentCalls: calls,
    sample: {
      // A canonical good-path sample exchange for the field engineer to inspect.
      // (Headers redacted where they'd be real secrets.)
      requestHeaders: isProvisional
        ? '— pending real endpoint —'
        : [
            'POST /api/booking/reserve HTTP/1.1',
            'Host: stg-api.globaltix.com',
            'Authorization: Bearer eyJhbGc***REDACTED***',
            'Accept-Version: 1.0',
            'Content-Type: application/json',
            'X-Correlation-Id: cid-7y3kq2vp',
          ].join('\n'),
      requestBody: isProvisional
        ? '— pending real endpoint —'
        : JSON.stringify(
            {
              ticketTypes: [{ index: 0, id: 256011, quantity: 1 }],
              otherInfo: { partnerReference: 'TSI-AP-9821' },
              customerName: 'TSI Annual Pass',
              email: 'redemption@tamansafari.id',
              paymentMethod: 'CREDIT',
            },
            null,
            2,
          ),
      responseHeaders: isProvisional
        ? '— pending real endpoint —'
        : [
            'HTTP/1.1 200 OK',
            'Content-Type: application/json',
            'X-Correlation-Id: cid-7y3kq2vp',
            'X-RateLimit-Remaining: 1486',
          ].join('\n'),
      responseBody: isProvisional
        ? '— pending real endpoint —'
        : JSON.stringify(
            {
              data: {
                referenceNumber: 'LMDOOIGHGT',
                bookingTime: '2026-06-09T07:44:28Z',
                customer: 'TSI Annual Pass',
                email: 'redemption@tamansafari.id',
                status: 'RESERVED',
              },
              error: null,
              size: null,
              success: true,
            },
            null,
            2,
          ),
    },
  };
}

// ─── ESB (F&B POS) ─────────────────────────────────────────────────

export function makeEsbIntegration() {
  return {
    vendor: 'esb' as const,
    displayName: 'ESB',
    subtitle: 'Indonesia · F&B point-of-sale',
    status: 'provisional' as const, // not connected — credentials pending
    environment: 'unset' as const,
    health: 'unknown' as const,
    baseUrl: '— (pending credentials)',
    authMethod: '— (TBD: API key per outlet? OAuth client-credentials? Tenant JWT?)',
    integrationModel:
      'Provisional Hybrid — WIT owns perks ledger; ESB OMS receives discount/voucher at order time.',
    summary: {
      perksDefined: 6,
      vouchersIssuedThisMonth: 1_842,
      vouchersRedeemedThisMonth: 1_204,
      redemptionRatePct: 65.3,
      outletsConfigured: 0,
      outletsExpected: 14,
    },
    products: [
      { id: 'esb-prod-q', name: 'ESB Order QS', purpose: 'Pick-up / delivery / scheduled', status: 'not-applicable' as const, note: 'Out of band for AP perks.' },
      { id: 'esb-prod-f', name: 'ESB Order FS', purpose: 'Dine-in', status: 'not-applicable' as const, note: 'Out of band for AP perks.' },
      { id: 'esb-prod-c', name: 'ESB Core', purpose: 'Custom reporting / ERP export', status: 'maybe-phase-2' as const, note: 'Useful for finance reconciliation.' },
      { id: 'esb-prod-o', name: 'ESB OMS', purpose: 'External system → POS module', status: 'target' as const, note: 'This is the integration target for AP perks.' },
      { id: 'esb-prod-l', name: 'ESB Loop', purpose: 'Branded app customisation', status: 'not-applicable' as const, note: 'AP already has its own PWA.' },
    ],
    // Every business-affecting flow across the ESB integration.
    // Numbers are forward-projected — ESB endpoints aren't live yet, so
    // ESB-side stages render "pending endpoint" in the UI.
    pipelines: [
      {
        key: 'voucher-redemption',
        label: 'Voucher redemption',
        description: 'How a member perk turns into a real discount at the F&B counter. The restaurant-side steps go live once ESB is connected.',
        category: 'transaction' as const,
        frequency: 'per cashier scan',
        todayVolume: 87,
        lastActivity: pastH(0.3),
        successRatePct: 99.5,
        stages: [
          { key: 'wit-issued', label: 'Member gets a voucher', description: 'We create a single-use voucher tied to the member and the perk.', count: 1_842, system: 'WIT' as const, avgLatencyMs: 8, tech: 'WIT mints voucher token' },
          { key: 'esb-registered', label: 'Tell the restaurant system', description: 'The voucher is registered with ESB so the till can recognise it.', count: 1_842, system: 'ESB' as const, avgLatencyMs: null, tech: 'Push to ESB OMS (endpoint pending)' },
          { key: 'member-presents', label: 'Member shows it at the counter', description: 'The cashier scans the member QR and we confirm the voucher is valid.', count: 1_204, system: 'WIT' as const, avgLatencyMs: 22, tech: 'WIT validates token' },
          { key: 'esb-applied', label: 'Discount comes off the bill', description: 'The till applies the discount to the order.', count: 1_204, system: 'ESB' as const, avgLatencyMs: null, tech: 'Applied at order line (endpoint pending)' },
          { key: 'reconciled', label: 'Match to the receipt', description: 'The closed receipt confirms the discount actually applied.', count: 1_198, system: 'WIT' as const, avgLatencyMs: 840, tech: 'OrderClosed webhook' },
        ],
      },
      {
        key: 'birthday-auto-issue',
        label: 'Birthday auto-issuance',
        description: 'Each member automatically gets a free cake voucher in their birthday month — no action needed. A simple way to bring members in to celebrate.',
        category: 'engagement' as const,
        frequency: 'daily cron @ 00:01',
        todayVolume: 14,
        lastActivity: pastH(7.9),
        successRatePct: 100,
        stages: [
          { key: 'cron-fired', label: 'Find birthdays today', description: 'Each morning we look for members whose birthday is today.', count: 14, system: 'WIT' as const, avgLatencyMs: 240, tech: 'Daily birthday job' },
          { key: 'eligibility', label: 'Check they qualify', description: 'They need an active pass and no birthday treat claimed yet this year.', count: 14, system: 'WIT' as const, avgLatencyMs: 8, tech: 'Eligibility check' },
          { key: 'voucher-minted', label: 'Create the cake voucher', description: 'A single-use free-cake voucher is created for the member.', count: 14, system: 'WIT' as const, avgLatencyMs: 22, tech: 'Mint voucher in ledger' },
          { key: 'esb-registered', label: 'Tell the restaurant system', description: 'The voucher is registered with ESB so the counter can honour it.', count: 14, system: 'ESB' as const, avgLatencyMs: null, tech: 'Push to ESB OMS (endpoint pending)' },
          { key: 'push-sent', label: 'Send a birthday message', description: 'The member gets a happy-birthday note telling them their cake is waiting.', count: 14, system: 'WIT' as const, avgLatencyMs: 1_200, tech: 'Push notification' },
        ],
      },
      {
        key: 'member-rate-pricing',
        label: 'Member-rate pricing',
        description: 'Members automatically get their tier price at the till — no manual discount keying by the cashier.',
        category: 'transaction' as const,
        frequency: 'per F&B order with member',
        todayVolume: 312,
        lastActivity: pastH(0.2),
        successRatePct: 98.4,
        stages: [
          { key: 'member-scanned', label: 'Member scanned at the till', description: 'The cashier scans the member QR when an order starts.', count: 318, system: 'ESB' as const, avgLatencyMs: null, tech: 'ESB OMS member lookup (endpoint pending)' },
          { key: 'tier-lookup', label: 'Look up their tier', description: 'We return the member tier and what they are entitled to.', count: 318, system: 'WIT' as const, avgLatencyMs: 42, tech: 'WIT tier + entitlements' },
          { key: 'rate-resolved', label: 'Work out the member price', description: 'We calculate the right discount for each item on the order.', count: 316, system: 'WIT' as const, avgLatencyMs: 18, tech: 'Compute line discount' },
          { key: 'esb-applied', label: 'Apply it to the bill', description: 'The till applies the member price before the order is finalised.', count: 312, system: 'ESB' as const, avgLatencyMs: null, tech: 'ESB OMS discount (endpoint pending)' },
          { key: 'usage-logged', label: 'Record the spend', description: 'We log the visit and spend to help with tier renewals later.', count: 312, system: 'WIT' as const, avgLatencyMs: 12, tech: 'Track for renewal scoring' },
        ],
      },
      {
        key: 'voucher-expiry',
        label: 'Voucher expiry',
        description: 'Vouchers that go unused expire on their own. A high count here points to perks members are not noticing.',
        category: 'lifecycle' as const,
        frequency: 'nightly sweep',
        todayVolume: 22,
        lastActivity: pastH(8.5),
        successRatePct: 100,
        stages: [
          { key: 'window-end', label: 'Voucher window closes', description: 'A voucher reaches the end of the time it was valid.', count: 22, system: 'WIT' as const, avgLatencyMs: 0, tech: 'validUntil reached' },
          { key: 'state-updated', label: 'Mark it expired', description: 'We mark the voucher expired so it can no longer be used.', count: 22, system: 'WIT' as const, avgLatencyMs: 28, tech: 'Ledger entry → expired' },
          { key: 'esb-invalidated', label: 'Tell the restaurant system', description: 'ESB is told the voucher is no longer usable at the counter.', count: 22, system: 'ESB' as const, avgLatencyMs: null, tech: 'Invalidate in ESB OMS (endpoint pending)' },
          { key: 'analytics-recorded', label: 'Note the missed perk', description: 'We record it as a benefit the member did not get round to using.', count: 22, system: 'WIT' as const, avgLatencyMs: 8, tech: 'Unrealised-benefit analytics' },
        ],
      },
      {
        key: 'order-closed-recon',
        label: 'Order-closed reconciliation',
        description: 'After each bill is paid, we check the discount we asked for actually came off the receipt.',
        category: 'reconciliation' as const,
        frequency: 'per closed F&B order',
        todayVolume: 1_204,
        lastActivity: pastH(0.4),
        successRatePct: 99.5,
        stages: [
          { key: 'order-closed', label: 'Receipt is settled', description: 'ESB tells us a bill has been paid and closed.', count: 1_204, system: 'ESB' as const, avgLatencyMs: null, tech: 'OrderClosed webhook (pending)' },
          { key: 'signature-verified', label: 'Check it is genuine', description: 'We verify the message really came from ESB.', count: 1_204, system: 'WIT' as const, avgLatencyMs: 4, tech: 'Signature check (mechanism TBD)' },
          { key: 'voucher-matched', label: 'Match discount to voucher', description: 'We confirm the discount on the receipt matches a voucher we issued.', count: 1_200, system: 'WIT' as const, avgLatencyMs: 28, tech: 'Receipt line ↔ voucher token' },
          { key: 'drift-flagged', label: 'Flag what does not match', description: 'A handful of receipts had no matching voucher — worth a closer look.', count: 4, system: 'WIT' as const, avgLatencyMs: 12, tech: 'Mismatch flagged' },
        ],
      },
    ],
    perkMapping: [
      { perkId: 'perk-001', title: '20% off F&B', mapping: 'ESB OMS apply-discount at line item, percent = 20, scope = category=Food', voucherType: 'Recurring', status: 'mapped' as const },
      { perkId: 'perk-002', title: 'Free guided tour', mapping: '— (not F&B; skip ESB)', voucherType: '—', status: 'n/a' as const },
      { perkId: 'perk-003', title: 'Companion entry — Rp 50.000', mapping: '— (not F&B; skip ESB)', voucherType: '—', status: 'n/a' as const },
      { perkId: 'perk-004', title: 'Souvenir shop · 10% off', mapping: 'ESB OMS apply-discount at order, percent = 10', voucherType: 'Recurring', status: 'mapped' as const },
      { perkId: 'perk-005', title: 'Priority parking', mapping: '— (not F&B; skip ESB)', voucherType: '—', status: 'n/a' as const },
      { perkId: 'perk-006', title: 'Birthday treat', mapping: 'ESB OMS create-voucher, single-use, item = "Safari Cake"', voucherType: 'Single-use', status: 'mapped' as const },
    ],
    outlets: [
      { id: 'esb-outlet-1', name: 'Savanna Café · Bogor', location: 'Bogor', status: 'pending' as const },
      { id: 'esb-outlet-2', name: 'Lion\'s Den Restaurant · Bogor', location: 'Bogor', status: 'pending' as const },
      { id: 'esb-outlet-3', name: 'Tiger Pavilion Bistro · Bogor', location: 'Bogor', status: 'pending' as const },
      { id: 'esb-outlet-4', name: 'Predator Coffee · Bogor', location: 'Bogor', status: 'pending' as const },
      { id: 'esb-outlet-5', name: 'Family Picnic Hall · Prigen', location: 'Prigen', status: 'pending' as const },
      { id: 'esb-outlet-6', name: 'Safari Grill · Prigen', location: 'Prigen', status: 'pending' as const },
      { id: 'esb-outlet-7', name: 'Reef Bar · Bali', location: 'Bali', status: 'pending' as const },
    ],
    openQuestions: [
      {
        id: 'esb-q-1',
        severity: 'high' as const,
        question: 'Auth mechanism — API key per outlet, OAuth client-credentials, or tenant-scoped JWT?',
        owner: 'ESB',
        status: 'pending' as const,
      },
      {
        id: 'esb-q-2',
        severity: 'high' as const,
        question: 'How does an external system apply a discount or voucher at an existing/in-flight order? Endpoint name + payload shape.',
        owner: 'ESB',
        status: 'pending' as const,
      },
      {
        id: 'esb-q-3',
        severity: 'high' as const,
        question: 'Is there a member/loyalty model in OMS, or must we model AP holders as promo codes?',
        owner: 'ESB',
        status: 'pending' as const,
      },
      {
        id: 'esb-q-4',
        severity: 'medium' as const,
        question: 'Webhooks for OrderClosed / PaymentSettled — exist? Signed how?',
        owner: 'ESB',
        status: 'pending' as const,
      },
      {
        id: 'esb-q-5',
        severity: 'medium' as const,
        question: 'Multi-outlet scoping — one credential for all of TSI\'s outlets, or one per outlet?',
        owner: 'ESB',
        status: 'pending' as const,
      },
      {
        id: 'esb-q-6',
        severity: 'low' as const,
        question: 'Sandbox availability — does ESB have a non-prod tenant we can integrate against?',
        owner: 'ESB',
        status: 'pending' as const,
      },
    ],
    recentVoucherActivity: [
      { id: 'v-9921', perkId: 'perk-006', memberId: 'm_2104', outletId: 'esb-outlet-1', issuedAt: pastH(1), redeemedAt: pastH(0.3), state: 'redeemed' as const, value: 'Free safari cake' },
      { id: 'v-9920', perkId: 'perk-001', memberId: 'm_2099', outletId: 'esb-outlet-2', issuedAt: pastH(2.4), redeemedAt: pastH(2.2), state: 'redeemed' as const, value: '20% off · Rp 38.400' },
      { id: 'v-9919', perkId: 'perk-001', memberId: 'm_2087', outletId: 'esb-outlet-1', issuedAt: pastH(3.1), redeemedAt: null, state: 'issued' as const, value: '20% off · pending' },
      { id: 'v-9918', perkId: 'perk-004', memberId: 'm_2071', outletId: 'esb-outlet-3', issuedAt: pastH(5), redeemedAt: pastH(4.7), state: 'redeemed' as const, value: '10% off · Rp 7.200' },
      { id: 'v-9917', perkId: 'perk-001', memberId: 'm_2068', outletId: 'esb-outlet-4', issuedAt: pastH(6.4), redeemedAt: null, state: 'expired' as const, value: '20% off · unused' },
      { id: 'v-9916', perkId: 'perk-006', memberId: 'm_2055', outletId: 'esb-outlet-1', issuedAt: pastH(8.1), redeemedAt: pastH(7.9), state: 'redeemed' as const, value: 'Free safari cake' },
      { id: 'v-9915', perkId: 'perk-001', memberId: 'm_2049', outletId: 'esb-outlet-5', issuedAt: pastH(11.2), redeemedAt: pastH(10.8), state: 'redeemed' as const, value: '20% off · Rp 52.000' },
      { id: 'v-9914', perkId: 'perk-001', memberId: 'm_2031', outletId: 'esb-outlet-6', issuedAt: pastH(14), redeemedAt: null, state: 'issued' as const, value: '20% off · pending' },
    ],
    nextSteps: [
      { id: 'ns-1', label: 'Receive ESB OMS credentials from TSI', owner: 'TSI', eta: inD(14) },
      { id: 'ns-2', label: 'Confirm answers to the 6 open questions', owner: 'ESB', eta: inD(21) },
      { id: 'ns-3', label: 'Map all 6 perk types to ESB voucher/discount shapes', owner: 'WIT', eta: inD(28) },
      { id: 'ns-4', label: 'Build real ESB ACL adapter (replace mock stub)', owner: 'WIT', eta: inD(42) },
      { id: 'ns-5', label: 'Pilot with one Bogor outlet (Savanna Café)', owner: 'TSI + WIT', eta: inD(60) },
    ],
    blackbox: makeBlackbox('esb'),
  };
}
