// src/auth/RequireRole.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {
  roles: string[];       // ej: ["admin"]
  children: ReactNode;
  fallbackPath?: string; // ej: "/unauthorized"
};

export default function RequireRole({ roles, children, fallbackPath = "/unauthorized" }: Props) {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];

  const allowed = roles.length === 0 || roles.some((r) => userRoles.includes(r));
  if (!allowed) return <Navigate to={fallbackPath} replace />;
  return <>{children}</>;
}
