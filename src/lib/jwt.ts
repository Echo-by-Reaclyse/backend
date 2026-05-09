import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("Missing JWT_SECRET");

const key = new TextEncoder().encode(secret);
const ACCESS_TTL_SECONDS = 3600; // 1 hour
const REFRESH_TTL_DAYS = 30;

export interface TokenPayload {
  sub: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  provider: string;
}

export async function signAccessToken(
  payload: TokenPayload
): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;
  const token = await new SignJWT({
    email: payload.email ?? null,
    displayName: payload.displayName ?? null,
    photoURL: payload.photoURL ?? null,
    provider: payload.provider,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);
  return { token, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, key);
  return {
    sub: payload.sub as string,
    email: (payload.email as string) ?? null,
    displayName: (payload.displayName as string) ?? null,
    photoURL: (payload.photoURL as string) ?? null,
    provider: payload.provider as string,
  };
}

export function generateRefreshToken(): string {
  return randomBytes(40).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TTL_DAYS);
  return d;
}
