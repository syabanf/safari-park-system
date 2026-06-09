import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AnalyticsRoute } from './features/analytics/AnalyticsRoute';
import { AnimalDetailRoute } from './features/animal-detail/AnimalDetailRoute';
import { AnimalsRoute } from './features/animals/AnimalsRoute';
import { AuditRoute } from './features/audit/AuditRoute';
import { LoginRoute } from './features/auth/LoginRoute';
import { RequireAuth } from './features/auth/RequireAuth';
import { BookingDetailRoute } from './features/booking-detail/BookingDetailRoute';
import { BookingsRoute } from './features/bookings/BookingsRoute';
import { CampaignDetailRoute } from './features/campaign-detail/CampaignDetailRoute';
import { CmsRoute } from './features/cms/CmsRoute';
import { ComplianceDetailRoute } from './features/compliance-detail/ComplianceDetailRoute';
import { ComplianceRoute } from './features/compliance/ComplianceRoute';
import { FinanceRoute } from './features/finance/FinanceRoute';
import { GapRegisterRoute } from './features/gap-register/GapRegisterRoute';
import { GateDetailRoute } from './features/gate-detail/GateDetailRoute';
import { GatesRoute } from './features/gates/GatesRoute';
import { InventoryDetailRoute } from './features/inventory-detail/InventoryDetailRoute';
import { InventoryRoute } from './features/inventory/InventoryRoute';
import { MaintenanceDetailRoute } from './features/maintenance/MaintenanceDetailRoute';
import { MaintenanceRoute } from './features/maintenance/MaintenanceRoute';
import { MarketingRoute } from './features/marketing/MarketingRoute';
import { MasterDataRoute } from './features/master-data/MasterDataRoute';
import { MemberDetailRoute } from './features/member-detail/MemberDetailRoute';
import { MembersRoute } from './features/members/MembersRoute';
import { OverviewRoute } from './features/overview/OverviewRoute';
import { PassDetailRoute } from './features/pass-detail/PassDetailRoute';
import { PassesRoute } from './features/passes/PassesRoute';
import { ReconciliationRoute } from './features/reconciliation/ReconciliationRoute';
import { RedemptionDetailRoute } from './features/redemption-detail/RedemptionDetailRoute';
import { RedemptionsRoute } from './features/redemptions/RedemptionsRoute';
import { AdminReportsRoute } from './features/reports/ReportsRoute';
import { SafetyDetailRoute } from './features/safety-detail/SafetyDetailRoute';
import { SafetyRoute } from './features/safety/SafetyRoute';
import { SettingsRoute } from './features/settings/SettingsRoute';
import { ShiftsRoute } from './features/shifts/ShiftsRoute';
import { SlaRoute } from './features/sla/SlaRoute';
import { StaffDetailRoute } from './features/staff-detail/StaffDetailRoute';
import { StaffRoute } from './features/staff/StaffRoute';
import { VendorDetailRoute } from './features/vendor-detail/VendorDetailRoute';
import { VendorsRoute } from './features/vendors/VendorsRoute';
import { NotFoundRoute } from './routes/NotFoundRoute';

const basename =
  import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/'
    ? import.meta.env.BASE_URL.replace(/\/$/, '')
    : undefined;

export const router = createBrowserRouter(
  [
  { path: '/login', element: <LoginRoute /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <OverviewRoute /> },
      { path: '/members', element: <MembersRoute /> },
      { path: '/members/:id', element: <MemberDetailRoute /> },
      { path: '/passes', element: <PassesRoute /> },
      { path: '/passes/:id', element: <PassDetailRoute /> },
      { path: '/redemptions', element: <RedemptionsRoute /> },
      { path: '/redemptions/:id', element: <RedemptionDetailRoute /> },
      { path: '/staff', element: <StaffRoute /> },
      { path: '/staff/:id', element: <StaffDetailRoute /> },
      { path: '/bookings', element: <BookingsRoute /> },
      { path: '/bookings/:id', element: <BookingDetailRoute /> },
      { path: '/gates', element: <GatesRoute /> },
      { path: '/gates/:id', element: <GateDetailRoute /> },
      { path: '/animals', element: <AnimalsRoute /> },
      { path: '/animals/:id', element: <AnimalDetailRoute /> },
      { path: '/safety', element: <SafetyRoute /> },
      { path: '/safety/:id', element: <SafetyDetailRoute /> },
      { path: '/compliance', element: <ComplianceRoute /> },
      { path: '/compliance/:id', element: <ComplianceDetailRoute /> },
      { path: '/sla', element: <SlaRoute /> },
      { path: '/maintenance', element: <MaintenanceRoute /> },
      { path: '/maintenance/:id', element: <MaintenanceDetailRoute /> },
      { path: '/reconciliation', element: <ReconciliationRoute /> },
      { path: '/audit', element: <AuditRoute /> },
      { path: '/gap-register', element: <GapRegisterRoute /> },
      { path: '/finance', element: <FinanceRoute /> },
      { path: '/inventory', element: <InventoryRoute /> },
      { path: '/inventory/:id', element: <InventoryDetailRoute /> },
      { path: '/vendors', element: <VendorsRoute /> },
      { path: '/vendors/:id', element: <VendorDetailRoute /> },
      { path: '/marketing', element: <MarketingRoute /> },
      { path: '/marketing/:id', element: <CampaignDetailRoute /> },
      { path: '/analytics', element: <AnalyticsRoute /> },
      { path: '/reports', element: <AdminReportsRoute /> },
      { path: '/shifts', element: <ShiftsRoute /> },
      { path: '/cms', element: <CmsRoute /> },
      { path: '/master-data', element: <MasterDataRoute /> },
      { path: '/settings', element: <SettingsRoute /> },
    ],
  },
    { path: '*', element: <NotFoundRoute /> },
  ],
  basename ? { basename } : undefined,
);
