import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">404</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm text-slate-500">The route you requested does not exist.</p>
      <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Go to dashboard
      </Link>
    </div>
  </div>
);