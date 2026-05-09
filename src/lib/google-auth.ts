import { createRemoteJWKSet, jwtVerify } from "jose";

const googleJWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export interface GoogleClaims {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleClaims> {
  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string | undefined,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
  };
}
