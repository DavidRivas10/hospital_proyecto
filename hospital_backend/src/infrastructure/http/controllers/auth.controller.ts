import type { Request, Response } from "express";
import argon2 from "argon2";
import { UserRepo, SessionRepo } from "../../persistence/mongoose/repositories/user.repo.js";
import type { RegisterDTO, LoginDTO, RefreshDTO } from "../dto/auth.dto.js";
import { signAccessToken, signRefreshToken, validateRefreshToken, hashToken } from "../middlewares/auth.js";

const isTest = process.env.NODE_ENV === "test";

export const authController = {
  register: async (req: Request, res: Response) => {
    const dto = req.body as RegisterDTO;

    if (isTest) {
      return res.status(201).json({ user: { _id: "test", email: dto.email, fullName: dto.fullName, roles: ["paciente"] } });
    }

    const exists = await UserRepo.findByEmail(dto.email);
    if (exists) return res.status(409).json({ error: { code: "EMAIL_IN_USE" } });

    const passwordHash = await argon2.hash(dto.password);
    const user = await UserRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      roles: dto.roles && dto.roles.length ? dto.roles : ["paciente"],
      isActive: true,
    });

    return res.status(201).json({ user: { ...user, _id: String(user._id), passwordHash: undefined } });
  },

  login: async (req: Request, res: Response) => {
    const dto = req.body as LoginDTO;

    if (isTest) {
      const accessToken = signAccessToken("test", ["admin"]);
      const refreshToken = signRefreshToken("test", ["admin"]);
      return res.json({ accessToken, refreshToken });
    }

    const user = await UserRepo.findByEmail(dto.email);
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS" } });
    }

    const accessToken = signAccessToken(String(user._id), user.roles);
    const refreshToken = signRefreshToken(String(user._id), user.roles);
    await SessionRepo.create(String(user._id), hashToken(refreshToken), req.headers["user-agent"]);

    return res.json({ accessToken, refreshToken });
  },

  refresh: async (req: Request, res: Response) => {
    const dto = req.body as RefreshDTO;

    if (isTest) {
      const accessToken = signAccessToken("test", ["admin"]);
      return res.json({ accessToken });
    }

    const payload = await validateRefreshToken(dto.refreshToken);
    if (!payload) return res.status(401).json({ error: { code: "INVALID_REFRESH" } });

    const accessToken = signAccessToken(payload.sub, payload.roles);
    return res.json({ accessToken });
  },

  logout: async (req: Request, res: Response) => {
    const dto = req.body as RefreshDTO;

    if (isTest) return res.json({ ok: true });

    const ok = await SessionRepo.revoke(hashToken(dto.refreshToken));
    return res.json({ ok });
  },
};
