import { cookies } from "next/headers";

export const ACCESS_COOKIE = "insforge_access_token";
export const REFRESH_COOKIE = "insforge_refresh_token";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, { ...authCookieOptions, maxAge: 60 * 15 });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessTokenFromCookies() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshTokenFromCookies() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
