// src/hooks/useAuth.ts
import { useAuthCtx, type AuthUser } from "../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useAuth() {
  const ctx = useAuthCtx();

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;

      const tokens = (await res.json()) as { accessToken: string; refreshToken: string };
      // Puedes luego consultar /v1/auth/me para roles reales
      const user: AuthUser = { email, roles: ["admin"] };
      ctx.login(user, tokens);
      return true;
    } catch {
      return false;
    }
  }

  return {
    user: ctx.user,
    accessToken: ctx.accessToken,
    refreshToken: ctx.refreshToken,
    login,
    logout: ctx.logout,
  };
}

