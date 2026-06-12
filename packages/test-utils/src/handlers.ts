import { http, HttpResponse } from 'msw';
import {
  makeAdminAnalytics,
  makeAdminGates,
  makeAdminMembers,
  makeAdminRedemptions,
  makeGapRegister,
  makeOverview,
  makePassesBreakdown,
} from './admin-fixtures';
import {
  makeAuditLog,
  makeGateDetail,
  makeMemberDetail,
  makePassDetail,
  makeReconciliation,
  makeSlaMetrics,
} from './admin-operations';
import {
  makeAnimalDetail,
  makeAnimals,
  makeBookings,
  makeBookingsCapacity,
  makeCampaigns,
  makeCompliance,
  makeInventory,
  makeInventorySummary,
  makeMarketingSummary,
  makePurchaseOrders,
  makeSafetyIncidents,
  makeSafetySummary,
  makeStaffDirectory,
  makeStaffRosterSummary,
  makeVendors,
} from './erp-fixtures';
import {
  makeBookingDetail,
  makeCampaignDetail,
  makeCmsContent,
  makeComplianceDocDetail,
  makeInventoryItemDetail,
  makeMasterData,
  makeRedemptionDetail,
  makeSafetyIncidentDetail,
  makeShiftCoverage,
  makeShiftRoster,
  makeStaffDetail,
  makeSwapRequests,
  makeVendorDetail,
} from './erp-detail-fixtures';
import { makeMember, makePass, makePublicKey, makeTokenBuffer } from './fixtures';
import {
  makeAttendance,
  makeEventDetail,
  makeFinanceSummary,
  makeFinanceTransactions,
  makeGateMapPositions,
  makeMaintenanceDetail,
  makeMaintenanceTickets,
  makeOperationalReports,
  makePromotions,
  makeRecentVisits,
  makeStaffProfile,
  makeValidatorReports,
} from './extras-v2';
import {
  makeBanners,
  makeEvents,
  makeMemberProfileExtras,
  makeNotifications,
  makeParkInfo,
  makeParkStatus,
  makePerks,
} from './member-extras';
import { makeEsbIntegration, makeGlobalTixIntegration } from './integrations';

const API = '*/api/v1';

export const handlers = [
  http.post(`${API}/auth/login`, async () => {
    return HttpResponse.json({
      accessToken: 'dev.member.fake-jwt',
      expiresIn: 3600,
    });
  }),

  http.post(`${API}/auth/staff/login`, async () => {
    return HttpResponse.json({
      accessToken: 'dev.staff.fake-jwt',
      expiresIn: 3600,
    });
  }),

  http.post(`${API}/auth/logout`, () => HttpResponse.json({ ok: true })),

  http.get(`${API}/members/me`, () => HttpResponse.json(makeMember())),
  http.get(`${API}/members/me/extras`, () => HttpResponse.json(makeMemberProfileExtras())),
  http.post(`${API}/members`, async ({ request }) => {
    const body = (await request.json()) as { email: string; fullName: string };
    return HttpResponse.json(makeMember({ email: body.email, fullName: body.fullName }), {
      status: 201,
    });
  }),

  http.get(`${API}/passes/me`, () => HttpResponse.json(makePass())),
  http.post(`${API}/passes/me/renew`, () =>
    HttpResponse.json(makePass({ validUntil: '2028-01-01' })),
  ),
  http.get(`${API}/passes/:id`, ({ params }) =>
    HttpResponse.json(makePass({ id: String(params.id) })),
  ),

  http.post(`${API}/tokens/buffer`, async ({ request }) => {
    const body = (await request.json()) as { count?: number };
    const tokens = makeTokenBuffer(body.count ?? 10);
    return HttpResponse.json({
      tokens,
      refreshAfter: Math.floor(Date.now() / 1000) + 600,
    });
  }),

  http.get(`${API}/keys/active`, () => HttpResponse.json({ keys: [makePublicKey()] })),

  // Redemption. Most pass ids are accepted, but a small set of SEEDED ids
  // return an HTTP 409 deny so suspended / out-of-visits / wrong-gate flows are
  // demoable via manual entry (just type the id) or a QR encoding the id.
  //
  //   Demo deny ids:
  //     p_suspended  -> 409 { status: 'denied', reason: 'suspended' }
  //     p_exhausted  -> 409 { status: 'denied', reason: 'visits-exhausted' }
  //     p_wronggate  -> 409 { status: 'denied', reason: 'wrong-gate' }
  //
  // A 409 is a *server* deny (distinct from a thrown network error, which the
  // client buffers offline). Everything else stays `accepted`.
  http.post(`${API}/redemptions`, async ({ request }) => {
    const body = (await request.json()) as { passId: string };

    const denyReasons: Record<string, 'suspended' | 'visits-exhausted' | 'wrong-gate'> = {
      p_suspended: 'suspended',
      p_exhausted: 'visits-exhausted',
      p_wronggate: 'wrong-gate',
    };
    const denyReason = denyReasons[body.passId];
    if (denyReason) {
      return HttpResponse.json(
        { status: 'denied', reason: denyReason, passId: body.passId },
        { status: 409 },
      );
    }

    return HttpResponse.json({
      id: `r_${Math.floor(Date.now() / 1000)}`,
      status: 'accepted',
      passHolder: 'Demo Member',
      remainingVisits: null,
      passId: body.passId,
    });
  }),

  // Member extras
  http.get(`${API}/banners`, () => HttpResponse.json({ banners: makeBanners() })),
  http.get(`${API}/park/status`, () => HttpResponse.json(makeParkStatus())),
  http.get(`${API}/park/info`, () => HttpResponse.json(makeParkInfo())),
  http.get(`${API}/notifications`, () =>
    HttpResponse.json({ notifications: makeNotifications() }),
  ),
  http.post(`${API}/notifications/:id/read`, () => HttpResponse.json({ ok: true })),
  http.get(`${API}/events`, () => HttpResponse.json({ events: makeEvents() })),
  http.get(`${API}/events/:id`, ({ params }) =>
    HttpResponse.json(makeEventDetail(String(params.id))),
  ),
  http.get(`${API}/perks`, () => HttpResponse.json({ perks: makePerks() })),
  http.get(`${API}/promotions`, () =>
    HttpResponse.json({ promotions: makePromotions() }),
  ),

  // Validator extras
  http.get(`${API}/validator/reports`, () => HttpResponse.json(makeValidatorReports())),
  http.get(`${API}/validator/staff/me`, () => HttpResponse.json(makeStaffProfile())),
  http.get(`${API}/validator/attendance`, () => HttpResponse.json(makeAttendance())),
  http.post(`${API}/validator/attendance/clock-in`, () =>
    HttpResponse.json({ ok: true, clockedInAt: new Date().toISOString() }),
  ),
  http.post(`${API}/validator/attendance/clock-out`, () =>
    HttpResponse.json({ ok: true, clockedOutAt: new Date().toISOString() }),
  ),
  http.get(`${API}/validator/recent-visits`, () =>
    HttpResponse.json({ visits: makeRecentVisits() }),
  ),

  // Admin endpoints
  http.get(`${API}/admin/overview`, () => HttpResponse.json(makeOverview())),
  http.get(`${API}/admin/members`, () =>
    HttpResponse.json({ members: makeAdminMembers() }),
  ),
  http.get(`${API}/admin/passes/breakdown`, () => HttpResponse.json(makePassesBreakdown())),
  http.get(`${API}/admin/redemptions`, () =>
    HttpResponse.json({ redemptions: makeAdminRedemptions() }),
  ),
  http.get(`${API}/admin/analytics`, () => HttpResponse.json(makeAdminAnalytics())),
  http.get(`${API}/admin/gates`, () => HttpResponse.json({ gates: makeAdminGates() })),
  http.get(`${API}/admin/gap-register`, () =>
    HttpResponse.json({ gaps: makeGapRegister() }),
  ),
  http.get(`${API}/admin/sla`, () => HttpResponse.json(makeSlaMetrics())),
  http.get(`${API}/admin/reconciliation`, () => HttpResponse.json(makeReconciliation())),
  http.get(`${API}/admin/audit`, () => HttpResponse.json({ entries: makeAuditLog() })),
  http.get(`${API}/admin/members/:id`, ({ params }) =>
    HttpResponse.json(makeMemberDetail(String(params.id))),
  ),
  http.get(`${API}/admin/gates/:id`, ({ params }) =>
    HttpResponse.json(makeGateDetail(String(params.id))),
  ),
  http.get(`${API}/admin/passes/:id`, ({ params }) =>
    HttpResponse.json(makePassDetail(String(params.id))),
  ),
  http.get(`${API}/admin/maintenance`, () =>
    HttpResponse.json({ tickets: makeMaintenanceTickets() }),
  ),
  http.get(`${API}/admin/maintenance/:id`, ({ params }) =>
    HttpResponse.json(makeMaintenanceDetail(String(params.id))),
  ),
  http.get(`${API}/admin/finance/summary`, () => HttpResponse.json(makeFinanceSummary())),
  http.get(`${API}/admin/finance/transactions`, () =>
    HttpResponse.json({ transactions: makeFinanceTransactions() }),
  ),
  http.get(`${API}/admin/reports`, () =>
    HttpResponse.json({ reports: makeOperationalReports() }),
  ),
  http.get(`${API}/admin/gates/map/positions`, () =>
    HttpResponse.json({ positions: makeGateMapPositions() }),
  ),

  // ERP — People
  http.get(`${API}/admin/staff`, () =>
    HttpResponse.json({ staff: makeStaffDirectory(), summary: makeStaffRosterSummary() }),
  ),
  http.get(`${API}/admin/bookings`, () =>
    HttpResponse.json({ bookings: makeBookings(), capacity: makeBookingsCapacity() }),
  ),

  // ERP — Park
  http.get(`${API}/admin/animals`, () => HttpResponse.json({ animals: makeAnimals() })),
  http.get(`${API}/admin/animals/:id`, ({ params }) =>
    HttpResponse.json(makeAnimalDetail(String(params.id))),
  ),
  http.get(`${API}/admin/safety`, () =>
    HttpResponse.json({ incidents: makeSafetyIncidents(), summary: makeSafetySummary() }),
  ),
  http.get(`${API}/admin/compliance`, () =>
    HttpResponse.json({ documents: makeCompliance() }),
  ),

  // ERP — Commerce
  http.get(`${API}/admin/inventory`, () =>
    HttpResponse.json({ items: makeInventory(), summary: makeInventorySummary() }),
  ),
  http.get(`${API}/admin/vendors`, () =>
    HttpResponse.json({ vendors: makeVendors(), purchaseOrders: makePurchaseOrders() }),
  ),
  http.get(`${API}/admin/marketing`, () =>
    HttpResponse.json({ campaigns: makeCampaigns(), summary: makeMarketingSummary() }),
  ),

  // ERP — Detail pages
  http.get(`${API}/admin/staff/:id`, ({ params }) =>
    HttpResponse.json(makeStaffDetail(String(params.id))),
  ),
  http.get(`${API}/admin/bookings/:id`, ({ params }) =>
    HttpResponse.json(makeBookingDetail(String(params.id))),
  ),
  http.get(`${API}/admin/safety/:id`, ({ params }) =>
    HttpResponse.json(makeSafetyIncidentDetail(String(params.id))),
  ),
  http.get(`${API}/admin/inventory/:id`, ({ params }) =>
    HttpResponse.json(makeInventoryItemDetail(String(params.id))),
  ),
  http.get(`${API}/admin/vendors/:id`, ({ params }) =>
    HttpResponse.json(makeVendorDetail(String(params.id))),
  ),
  http.get(`${API}/admin/marketing/:id`, ({ params }) =>
    HttpResponse.json(makeCampaignDetail(String(params.id))),
  ),
  http.get(`${API}/admin/compliance/:id`, ({ params }) =>
    HttpResponse.json(makeComplianceDocDetail(String(params.id))),
  ),
  http.get(`${API}/admin/redemptions/:id`, ({ params }) =>
    HttpResponse.json(makeRedemptionDetail(String(params.id))),
  ),

  // ERP — Shifts + Master data
  http.get(`${API}/admin/shifts/roster`, () => HttpResponse.json(makeShiftRoster())),
  http.get(`${API}/admin/shifts/swaps`, () =>
    HttpResponse.json({ swaps: makeSwapRequests() }),
  ),
  http.get(`${API}/admin/shifts/coverage`, () =>
    HttpResponse.json({ coverage: makeShiftCoverage() }),
  ),
  http.get(`${API}/admin/master-data`, () => HttpResponse.json(makeMasterData())),

  // Integrations — vendor surfaces (GlobalTix, ESB)
  http.get(`${API}/admin/integrations/globaltix`, () =>
    HttpResponse.json(makeGlobalTixIntegration()),
  ),
  http.get(`${API}/admin/integrations/esb`, () =>
    HttpResponse.json(makeEsbIntegration()),
  ),
  http.post(`${API}/admin/integrations/:vendor/test-connection`, async ({ params }) =>
    HttpResponse.json({ ok: true, vendor: params.vendor, roundTripMs: 312 }),
  ),
  http.post(`${API}/admin/integrations/:vendor/retry/:itemId`, async ({ params }) =>
    HttpResponse.json({ ok: true, vendor: params.vendor, itemId: params.itemId }),
  ),

  // ERP — CMS (membership app content)
  http.get(`${API}/admin/cms`, () => HttpResponse.json(makeCmsContent())),
  http.post(`${API}/admin/cms/:type/:id`, async ({ params }) =>
    HttpResponse.json({ ok: true, type: params.type, id: params.id }),
  ),
  http.delete(`${API}/admin/cms/:type/:id`, async ({ params }) =>
    HttpResponse.json({ ok: true, type: params.type, id: params.id }),
  ),
];
