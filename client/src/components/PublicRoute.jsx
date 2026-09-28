import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  // Wait until authentication has been checked
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />

          <p className="text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Already authenticated → don't show login/register
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
