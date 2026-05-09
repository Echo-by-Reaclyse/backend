import { createRemoteJWKSet, jwtVerify } from "jose";
import { createHash } from "crypto";

const appleJWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

export interface AppleClaims {
  sub: string;
  email?: string;
}

export async function verifyAppleToken(
  idToken: string,
  nonce: string
): Promise<AppleClaims> {
  const audience = process.env.APPLE_APP_BUNDLE_ID ?? "com.reaclyse.echo";
  const nonceHash = createHash("sha256").update(nonce).digest("hex");

  const { payload } = await jwtVerify(idToken, appleJWKS, {
    issuer: "https://appleid.apple.com",
    audience,
  });

  if (payload.nonce !== nonceHash) throw new Error("Nonce mismatch");

  return {
    sub: payload.sub as string,
    email: payload.email as string | undefined,
  };
}
