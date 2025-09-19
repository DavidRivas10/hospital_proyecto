import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { SessionRepo } from "../../persistence/mongoose/repositories/user.repo.js";

export type JwtPayload = { sub: string; roles: string[] };

export function signAccessToken(sub: string, roles: string[]): string {
  return jwt.sign({ sub, roles } as JwtPayload, env.JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(sub: string, roles: string[]): string {
  return jwt.sign({ sub, roles } as JwtPayload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED" } });
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as any).auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: { code: "UNAUTHORIZED" } });
  }
}

export function requireRoles(...required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).auth as JwtPayload | undefined;
    if (!payload) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED" } });
    }
    // ✅ OR: basta con tener uno de los roles requeridos
    const ok =
      required.length === 0 ||
      required.some((role) => payload.roles && payload.roles.includes(role));

    if (!ok) {
      return res.status(403).json({ error: { code: "FORBIDDEN" } });
    }
    next();
  };
}


export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function validateRefreshToken(refreshToken: string): Promise<JwtPayload | null> {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    const valid = await SessionRepo.isValid(hashToken(refreshToken));
    return valid ? payload : null;
  } catch {
    return null;
  }
}
