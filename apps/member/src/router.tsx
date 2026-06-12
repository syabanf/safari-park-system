import { Navigate, createBrowserRouter, createHashRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LoginRoute } from './features/auth/LoginRoute';
import { RequireAuth } from './features/auth/RequireAuth';
import { DiscoverRoute } from './features/discover/DiscoverRoute';
import { EnrolmentRoute } from './features/enrolment/EnrolmentRoute';
import { EventDetailRoute } from './features/event-detail/EventDetailRoute';
import { EventsRoute } from './features/events/EventsRoute';
import { MapRoute } from './features/map/MapRoute';
import { NotificationsRoute } from './features/notifications/NotificationsRoute';
import { HomeRoute } from './features/pass/HomeRoute';
import { PerksRoute } from './features/perks/PerksRoute';
import { ProfileRoute } from './features/profile/ProfileRoute';
import { PromotionsRoute } from './features/promotions/PromotionsRoute';
import { QrRoute } from './features/qr/QrRoute';
import { RenewalRoute } from './features/renewal/RenewalRoute';
import { NotFoundRoute } from './routes/NotFoundRoute';

const factory =
  import.meta.env.VITE_PLATFORM === 'capacitor' ? createHashRouter : createBrowserRouter;

// In a single-root deploy each app lives under /<app>/. Strip the trailing
// slash from Vite's BASE_URL so react-router treats it as a basename.
const basename =
  import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/'
    ? import.meta.env.BASE_URL.replace(/\/$/, '')
    : undefined;

export const router = factory(
  [
  { path: '/', element: <Navigate to="/home" replace /> },
  { path: '/login', element: <LoginRoute /> },
  { path: '/enrol', element: <EnrolmentRoute /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { path: '/home', element: <HomeRoute /> },
      { path: '/qr', element: <QrRoute /> },
      { path: '/discover', element: <DiscoverRoute /> },
      { path: '/events', element: <EventsRoute /> },
      { path: '/events/:id', element: <EventDetailRoute /> },
      { path: '/perks', element: <PerksRoute /> },
      { path: '/promotions', element: <PromotionsRoute /> },
      { path: '/map', element: <MapRoute /> },
      { path: '/notifications', element: <NotificationsRoute /> },
      { path: '/profile', element: <ProfileRoute /> },
      { path: '/renewal', element: <RenewalRoute /> },
    ],
  },
    { path: '*', element: <NotFoundRoute /> },
  ],
  basename ? { basename } : undefined,
);
