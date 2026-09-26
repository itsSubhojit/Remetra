import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary animate-pulse shadow-[0_0_25px_rgba(99,102,241,0.3)]">
            <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
          </div>
          <p className="text-body-md text-on-surface-variant font-medium">Validating Remetra Vault Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};
