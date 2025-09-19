// src/auth/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

export type AuthUser = { email: string; roles: string[] };
type Tokens = { accessToken: string; refreshToken: string };

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: AuthUser, tokens: Tokens) => void;
  logout: () => void;
};

// Creamos el contexto con valor inicial null
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAT] = useState<string | null>(null);
  const [refreshToken, setRT] = useState<string | null>(null);

  const login = (u: AuthUser, t: Tokens) => {
    setUser(u);
    setAT(t.accessToken);
    setRT(t.refreshToken);
  };

  const logout = () => {
    setUser(null);
    setAT(null);
    setRT(null);
  };

  // Tipamos exactamente el valor que espera el contexto
  const value: AuthState = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

// Hook para consumir el contexto
export function useAuthCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthCtx debe usarse dentro de <AuthProvider>");
  return ctx;
}
