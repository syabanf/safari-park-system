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
    // Business-flow pipeline: every WIT redemption traverses these stages.
    // Drop-offs between stages tell us where reconciliation is leaking.
    pipeline: {
      description:
        'Every WIT validation flows through these 5 stages. Stages 2–4 happen inside the ACL; stage 5 closes the loop via GT webhook.',
      stages: [
        {
          key: 'wit-validated',
          label: 'WIT validated',
          description: 'Gate scan accepted by WIT (online or offline)',
          count: 412,
          system: 'WIT' as const,
          avgLatencyMs: 12,
        },
        {
          key: 'gt-reserved',
          label: 'GT reserved',
          description: 'POST /api/booking/reserve — holds the Duration ticket',
          count: 412,
          system: 'GT' as const,
          avgLatencyMs: 142,
        },
        {
          key: 'gt-confirmed',
          label: 'GT confirmed',
          description: 'POST /api/booking/confirm — booking status CONFIRMED',
          count: 410,
          system: 'GT' as const,
          avgLatencyMs: 168,
        },
        {
          key: 'gt-redeemed',
          label: 'GT redeemed',
          description: 'IssuedTicketStatus flipped to REDEEMED',
          count: 408,
          system: 'GT' as const,
          avgLatencyMs: 38,
        },
        {
          key: 'webhook-ack',
          label: 'Webhook ack',
          description: 'TICKET_REDEEM webhook received + signature verified',
          count: 408,
          system: 'WIT' as const,
          avgLatencyMs: 920,
        },
      ],
    },
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
    // Business-flow pipeline for ESB voucher lifecycle.
    pipeline: {
      description:
        'Every member perk redemption traverses these 5 stages once ESB OMS is live. Currently all stages 2–5 are mocked.',
      stages: [
        {
          key: 'wit-issued',
          label: 'Voucher issued',
          description: 'WIT mints a single-use voucher token tied to the perk + member',
          count: 1_842,
          system: 'WIT' as const,
          avgLatencyMs: 8,
        },
        {
          key: 'esb-registered',
          label: 'ESB registered',
          description: 'ACL pushes the voucher into ESB OMS (waiting on real endpoint)',
          count: 1_842,
          system: 'ESB' as const,
          avgLatencyMs: null,
        },
        {
          key: 'member-presents',
          label: 'Member presents',
          description: 'Member scans/shows QR to cashier — WIT validates token',
          count: 1_204,
          system: 'WIT' as const,
          avgLatencyMs: 22,
        },
        {
          key: 'esb-applied',
          label: 'ESB applied',
          description: 'Discount applied at order line — POS confirms',
          count: 1_204,
          system: 'ESB' as const,
          avgLatencyMs: null,
        },
        {
          key: 'reconciled',
          label: 'Reconciled',
          description: 'OrderClosed webhook ties redemption to settled receipt',
          count: 1_198,
          system: 'WIT' as const,
          avgLatencyMs: 840,
        },
      ],
    },
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
  };
}
