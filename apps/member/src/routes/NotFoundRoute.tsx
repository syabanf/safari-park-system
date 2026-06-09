import { Link } from 'react-router-dom';

export function NotFoundRoute() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">This page does not exist.</p>
      <Link to="/home" className="text-brand-700 underline">
        Go home
      </Link>
    </div>
  );
}
