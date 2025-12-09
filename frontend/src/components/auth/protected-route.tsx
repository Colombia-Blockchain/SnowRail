/**
 * Protected route component
 * Wraps routes that require authentication
 */

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function ProtectedRoute({
  children,
  isAuthenticated,
  isLoading,
}: ProtectedRouteProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-electric-blue">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
