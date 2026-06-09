import { Navigate, createBrowserRouter, createHashRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AttendanceRoute } from './features/attendance/AttendanceRoute';
import { LoginRoute } from './features/auth/LoginRoute';
import { ManualEntryRoute } from './features/manual-entry/ManualEntryRoute';
import { OfflineQueueRoute } from './features/offline-queue/OfflineQueueRoute';
import { ProfileRoute } from './features/profile/ProfileRoute';
import { RecentScansRoute } from './features/recent-scans/RecentScansRoute';
import { ReportsRoute } from './features/reports/ReportsRoute';
import { ScanRoute } from './features/scan/ScanRoute';
import { VisitsRoute } from './features/visits/VisitsRoute';
import { NotFoundRoute } from './routes/NotFoundRoute';

const factory =
  import.meta.env.VITE_PLATFORM === 'capacitor' ? createHashRouter : createBrowserRouter;

export const router = factory([
  { path: '/', element: <Navigate to="/scan" replace /> },
  { path: '/login', element: <LoginRoute /> },
  {
    element: <AppShell />,
    children: [
      { path: '/scan', element: <ScanRoute /> },
      { path: '/manual', element: <ManualEntryRoute /> },
      { path: '/reports', element: <ReportsRoute /> },
      { path: '/attendance', element: <AttendanceRoute /> },
      { path: '/visits', element: <VisitsRoute /> },
      { path: '/profile', element: <ProfileRoute /> },
      { path: '/recent', element: <RecentScansRoute /> },
      { path: '/queue', element: <OfflineQueueRoute /> },
    ],
  },
  { path: '*', element: <NotFoundRoute /> },
]);
