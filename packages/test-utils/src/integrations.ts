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
        description: 'Every WIT validation flows through these 5 stages. Stages 2–4 happen inside the ACL; stage 5 closes the loop via GT webhook.',
        category: 'gate' as const,
        frequency: 'per gate scan',
        todayVolume: 412,
        lastActivity: pastH(0.1),
        successRatePct: 99.03,
        stages: [
          { key: 'wit-validated', label: 'WIT validated', description: 'Gate scan accepted by WIT (online or offline)', count: 412, system: 'WIT' as const, avgLatencyMs: 12 },
          { key: 'gt-reserved', label: 'GT reserved', description: 'POST /api/booking/reserve — holds the Duration ticket', count: 412, system: 'GT' as const, avgLatencyMs: 142 },
          { key: 'gt-confirmed', label: 'GT confirmed', description: 'POST /api/booking/confirm — booking status CONFIRMED', count: 410, system: 'GT' as const, avgLatencyMs: 168 },
          { key: 'gt-redeemed', label: 'GT redeemed', description: 'IssuedTicketStatus flipped to REDEEMED', count: 408, system: 'GT' as const, avgLatencyMs: 38 },
          { key: 'webhook-ack', label: 'Webhook ack', description: 'TICKET_REDEEM webhook received + signature verified', count: 408, system: 'WIT' as const, avgLatencyMs: 920 },
        ],
      },
      {
        key: 'new-booking',
        label: 'New booking · sales',
        description: 'Non-AP sales: renewals, companion tickets, add-on F&B vouchers booked through the member app or admin console.',
        category: 'transaction' as const,
        frequency: 'per checkout',
        todayVolume: 87,
        lastActivity: pastH(0.4),
        successRatePct: 96.55,
        stages: [
          { key: 'availability', label: 'Availability checked', description: 'GET /api/ticketType/checkEventAvailability', count: 92, system: 'WIT' as const, avgLatencyMs: 180 },
          { key: 'reserved', label: 'Reserved', description: 'POST /api/booking/reserve · status RESERVED', count: 90, system: 'GT' as const, avgLatencyMs: 220 },
          { key: 'payment', label: 'Payment captured', description: 'Payment gateway settles before confirm', count: 88, system: 'WIT' as const, avgLatencyMs: 1_840 },
          { key: 'confirmed', label: 'Confirmed', description: 'POST /api/booking/confirm · status CONFIRMED', count: 87, system: 'GT' as const, avgLatencyMs: 196 },
          { key: 'eticket-ready', label: 'E-ticket ready', description: 'BOOKING_TRANSACTION_UPDATE webhook · isTicketsReady=true', count: 84, system: 'WIT' as const, avgLatencyMs: 28_000 },
        ],
      },
      {
        key: 'cancellation',
        label: 'Cancellation · refund',
        description: 'Cancellable tickets revoked before the visit. cancellationPolicy.refundDuration gates the refund.',
        category: 'transaction' as const,
        frequency: 'on customer request',
        todayVolume: 4,
        lastActivity: pastH(3.2),
        successRatePct: 100,
        stages: [
          { key: 'cancel-requested', label: 'Cancel requested', description: 'Customer or staff initiates the revoke', count: 4, system: 'WIT' as const, avgLatencyMs: 8 },
          { key: 'cutoff-check', label: 'Refund cutoff check', description: 'WIT computes vs cancellationPolicy.refundDuration', count: 4, system: 'WIT' as const, avgLatencyMs: 6 },
          { key: 'gt-revoke', label: 'GT revoke', description: 'GET /api/transaction/revoke?reference_number=…', count: 4, system: 'GT' as const, avgLatencyMs: 412 },
          { key: 'ticket-revoked', label: 'Ticket revoked', description: 'TICKET_REVOKE webhook · status REVOKED', count: 4, system: 'WIT' as const, avgLatencyMs: 1_120 },
          { key: 'refund-issued', label: 'Refund issued', description: 'Payment gateway returns funds to source', count: 3, system: 'WIT' as const, avgLatencyMs: 3_400 },
        ],
      },
      {
        key: 'reservation-timeout',
        label: 'Reservation timeout',
        description: 'Reserved bookings auto-release after 1h if not confirmed. Credits are returned. Track to spot a failing checkout funnel.',
        category: 'risk' as const,
        frequency: 'background timer',
        todayVolume: 9,
        lastActivity: pastH(1.8),
        successRatePct: 100,
        stages: [
          { key: 'reserved', label: 'Reserved', description: 'POST /api/booking/reserve · status RESERVED', count: 9, system: 'GT' as const, avgLatencyMs: 220 },
          { key: 'timer-started', label: 'Confirm timer started', description: '1h countdown begins; UI polls user for payment', count: 9, system: 'WIT' as const, avgLatencyMs: 0 },
          { key: 'timer-fired', label: 'Timer fired', description: 'Customer abandoned checkout', count: 9, system: 'WIT' as const, avgLatencyMs: 0 },
          { key: 'auto-released', label: 'Auto-released', description: 'GT releases reservation automatically', count: 9, system: 'GT' as const, avgLatencyMs: null },
          { key: 'credits-returned', label: 'Credits returned', description: 'Reseller credits restored to agent account', count: 9, system: 'GT' as const, avgLatencyMs: 220 },
        ],
      },
      {
        key: 'catalogue-sync',
        label: 'Catalogue sync',
        description: 'Periodic pull of GT product catalogue so the member app shows current products + prices. Runs 4× per day or on PRODUCT_INFO_UPDATE webhook.',
        category: 'catalogue' as const,
        frequency: '4× daily + event-driven',
        todayVolume: 5,
        lastActivity: pastH(1.5),
        successRatePct: 100,
        stages: [
          { key: 'countries', label: 'Countries fetched', description: 'GET /api/country/getAllCountries', count: 5, system: 'GT' as const, avgLatencyMs: 320 },
          { key: 'list', label: 'Products listed', description: 'GET /api/product/list (paginated, 16/page)', count: 5, system: 'GT' as const, avgLatencyMs: 480 },
          { key: 'info', label: 'Product info pulled', description: 'GET /api/product/info?id= per product', count: 5, system: 'GT' as const, avgLatencyMs: 8_200 },
          { key: 'options', label: 'Options + ticket types', description: 'GET /api/product/options?id= per product', count: 5, system: 'GT' as const, avgLatencyMs: 6_400 },
          { key: 'local-refresh', label: 'Local catalogue refreshed', description: 'Cache invalidated, member app sees new data on next fetch', count: 5, system: 'WIT' as const, avgLatencyMs: 90 },
        ],
      },
      {
        key: 'price-update',
        label: 'Price update',
        description: 'Webhook-driven price refresh. PRICE_UPDATE webhook fires only on merchant price changes (not currency rate moves).',
        category: 'catalogue' as const,
        frequency: 'event-driven',
        todayVolume: 3,
        lastActivity: pastH(4.1),
        successRatePct: 100,
        stages: [
          { key: 'webhook-received', label: 'PRICE_UPDATE webhook', description: 'GT posts payload to our endpoint', count: 3, system: 'GT' as const, avgLatencyMs: 220 },
          { key: 'signature-verified', label: 'Signature verified', description: 'HMAC check against shared secret', count: 3, system: 'WIT' as const, avgLatencyMs: 4 },
          { key: 'price-stored', label: 'New price stored', description: 'productId + optionId + ticketTypeId → newNettPrice', count: 3, system: 'WIT' as const, avgLatencyMs: 18 },
          { key: 'cache-busted', label: 'Cache invalidated', description: 'CDN + in-memory cache invalidation', count: 3, system: 'WIT' as const, avgLatencyMs: 1_200 },
          { key: 'member-app-sees', label: 'Member app sees new price', description: 'Next /perks fetch returns updated value', count: 3, system: 'WIT' as const, avgLatencyMs: 0 },
        ],
      },
      {
        key: 'ticket-expiry',
        label: 'Ticket expiry',
        description: 'When TicketValidity windows close, GT fires TICKET_EXPIRED. We update the member-facing status so unused tickets are obvious.',
        category: 'lifecycle' as const,
        frequency: 'event-driven',
        todayVolume: 12,
        lastActivity: pastH(0.7),
        successRatePct: 100,
        stages: [
          { key: 'window-end', label: 'Validity window ends', description: 'TicketValidity.redeemEnd reached', count: 12, system: 'GT' as const, avgLatencyMs: 0 },
          { key: 'expired-webhook', label: 'TICKET_EXPIRED webhook', description: 'GT posts payload with id + expiredDate', count: 12, system: 'GT' as const, avgLatencyMs: 240 },
          { key: 'status-updated', label: 'Status updated', description: 'Local IssuedTicketStatus → EXPIRED', count: 12, system: 'WIT' as const, avgLatencyMs: 22 },
          { key: 'member-notified', label: 'Member notified', description: 'In-app banner: "Ticket expired without use"', count: 11, system: 'WIT' as const, avgLatencyMs: 380 },
        ],
      },
      {
        key: 'token-rotation',
        label: 'Auth token rotation',
        description: 'GT access tokens live 24h. We rotate at 23h to avoid mid-call expiry. Failures here freeze all GT writes.',
        category: 'security' as const,
        frequency: 'every 23h',
        todayVolume: 1,
        lastActivity: pastH(0.6),
        successRatePct: 100,
        stages: [
          { key: 'ttl-check', label: 'TTL check', description: 'Background job inspects cached token age', count: 1, system: 'WIT' as const, avgLatencyMs: 2 },
          { key: 'pre-expiry-trigger', label: 'Pre-expiry trigger', description: 'Triggered at 23h since last issue', count: 1, system: 'WIT' as const, avgLatencyMs: 0 },
          { key: 'login-called', label: 'Login called', description: 'POST /api/auth/login · username + password', count: 1, system: 'GT' as const, avgLatencyMs: 412 },
          { key: 'token-cached', label: 'Token cached', description: 'New JWT stored, marked active', count: 1, system: 'WIT' as const, avgLatencyMs: 4 },
          { key: 'old-retired', label: 'Old token retired', description: 'Previous token removed from cache', count: 1, system: 'WIT' as const, avgLatencyMs: 2 },
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
        description: 'Every member perk redemption traverses these 5 stages once ESB OMS is live. Currently stages 2/4 are mocked pending the real endpoints.',
        category: 'transaction' as const,
        frequency: 'per cashier scan',
        todayVolume: 87,
        lastActivity: pastH(0.3),
        successRatePct: 99.5,
        stages: [
          { key: 'wit-issued', label: 'Voucher issued', description: 'WIT mints a single-use voucher token tied to the perk + member', count: 1_842, system: 'WIT' as const, avgLatencyMs: 8 },
          { key: 'esb-registered', label: 'ESB registered', description: 'ACL pushes voucher into ESB OMS (waiting on real endpoint)', count: 1_842, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'member-presents', label: 'Member presents', description: 'Member scans/shows QR to cashier — WIT validates token', count: 1_204, system: 'WIT' as const, avgLatencyMs: 22 },
          { key: 'esb-applied', label: 'ESB applied', description: 'Discount applied at order line — POS confirms', count: 1_204, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'reconciled', label: 'Reconciled', description: 'OrderClosed webhook ties redemption to settled receipt', count: 1_198, system: 'WIT' as const, avgLatencyMs: 840 },
        ],
      },
      {
        key: 'birthday-auto-issue',
        label: 'Birthday auto-issuance',
        description: 'Monthly cron grants every member a free cake voucher in their birthday month — no member action required. Drives F&B traffic on birthdays.',
        category: 'engagement' as const,
        frequency: 'daily cron @ 00:01',
        todayVolume: 14,
        lastActivity: pastH(7.9),
        successRatePct: 100,
        stages: [
          { key: 'cron-fired', label: 'Cron fired', description: 'Daily job inspects members with birthdays today', count: 14, system: 'WIT' as const, avgLatencyMs: 240 },
          { key: 'eligibility', label: 'Eligibility check', description: 'Active pass + no prior birthday voucher this year', count: 14, system: 'WIT' as const, avgLatencyMs: 8 },
          { key: 'voucher-minted', label: 'Voucher minted', description: 'Single-use cake voucher created in WIT ledger', count: 14, system: 'WIT' as const, avgLatencyMs: 22 },
          { key: 'esb-registered', label: 'ESB registered', description: 'ACL pushes voucher into ESB OMS (pending endpoint)', count: 14, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'push-sent', label: 'Push notification sent', description: '"🎂 Happy birthday! Your free cake is waiting"', count: 14, system: 'WIT' as const, avgLatencyMs: 1_200 },
        ],
      },
      {
        key: 'member-rate-pricing',
        label: 'Member-rate pricing',
        description: 'Tier-based pricing applied automatically when a member identifier is recognised at the POS. Eliminates manual discount keying.',
        category: 'transaction' as const,
        frequency: 'per F&B order with member',
        todayVolume: 312,
        lastActivity: pastH(0.2),
        successRatePct: 98.4,
        stages: [
          { key: 'member-scanned', label: 'Member scanned at POS', description: 'Cashier scans member QR via ESB OMS lookup endpoint', count: 318, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'tier-lookup', label: 'Tier lookup', description: 'WIT returns member tier + entitlements', count: 318, system: 'WIT' as const, avgLatencyMs: 42 },
          { key: 'rate-resolved', label: 'Rate resolved', description: 'WIT computes line discount per ticketed item', count: 316, system: 'WIT' as const, avgLatencyMs: 18 },
          { key: 'esb-applied', label: 'Applied at line', description: 'ESB OMS applies discount before order finalisation', count: 312, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'usage-logged', label: 'Usage logged', description: 'Member F&B spend tracked for tier-renewal scoring', count: 312, system: 'WIT' as const, avgLatencyMs: 12 },
        ],
      },
      {
        key: 'voucher-expiry',
        label: 'Voucher expiry',
        description: 'Unused vouchers auto-expire after the validity window. Track to spot perks members don\'t notice.',
        category: 'lifecycle' as const,
        frequency: 'nightly sweep',
        todayVolume: 22,
        lastActivity: pastH(8.5),
        successRatePct: 100,
        stages: [
          { key: 'window-end', label: 'Validity ended', description: 'Voucher validUntil < now', count: 22, system: 'WIT' as const, avgLatencyMs: 0 },
          { key: 'state-updated', label: 'State → expired', description: 'WIT ledger entry marked expired', count: 22, system: 'WIT' as const, avgLatencyMs: 28 },
          { key: 'esb-invalidated', label: 'ESB invalidated', description: 'ACL marks corresponding ESB voucher unusable', count: 22, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'analytics-recorded', label: 'Loss recorded', description: 'Counts as unrealised member benefit for analytics', count: 22, system: 'WIT' as const, avgLatencyMs: 8 },
        ],
      },
      {
        key: 'order-closed-recon',
        label: 'Order-closed reconciliation',
        description: 'ESB OrderClosed webhook closes the loop: did the discount we asked for actually apply at the receipt?',
        category: 'reconciliation' as const,
        frequency: 'per closed F&B order',
        todayVolume: 1_204,
        lastActivity: pastH(0.4),
        successRatePct: 99.5,
        stages: [
          { key: 'order-closed', label: 'OrderClosed webhook', description: 'ESB posts payload on settled receipt', count: 1_204, system: 'ESB' as const, avgLatencyMs: null },
          { key: 'signature-verified', label: 'Signature verified', description: 'HMAC check (mechanism TBD per ESB)', count: 1_204, system: 'WIT' as const, avgLatencyMs: 4 },
          { key: 'voucher-matched', label: 'Voucher matched', description: 'Receipt line discount ↔ issued voucher token', count: 1_200, system: 'WIT' as const, avgLatencyMs: 28 },
          { key: 'drift-flagged', label: 'Drift flagged', description: '4 receipts had no matching voucher — investigate', count: 4, system: 'WIT' as const, avgLatencyMs: 12 },
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
