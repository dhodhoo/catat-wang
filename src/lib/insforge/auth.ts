import { redirect } from "next/navigation";
import { clearAuthCookies, getAccessTokenFromCookies, getRefreshTokenFromCookies, setAuthCookies } from "@/lib/insforge/cookies";
import { ensureUserBootstrap } from "@/lib/insforge/bootstrap";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { env } from "@/lib/utils/env";

function getUserName(user: { profile?: { name?: string | null } | null }) {
  return user.profile?.name ?? null;
}

export async function signUpWithEmail(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.signUp({
    name: input.fullName,
    email: input.email,
    password: input.password,
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/sign-in`
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.accessToken && data.refreshToken) {
    if (!data.user) {
      throw new Error("Data user tidak tersedia setelah registrasi.");
    }
    await setAuthCookies(data.accessToken, data.refreshToken);
    await ensureUserBootstrap(data.accessToken, {
      id: data.user.id,
      name: getUserName(data.user),
      email: data.user.email
    });
    return { status: "signed_in" as const };
  }

  return { status: "verification_required" as const, verifyMethod: "code" as const };
}

export async function verifyEmailCode(email: string, otp: string) {
  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.verifyEmail({ email, otp });

  if (error || !data?.accessToken || !data.refreshToken) {
    throw new Error(error?.message ?? "Verifikasi email gagal.");
  }
  if (!data.user) {
    throw new Error("Data user tidak tersedia setelah verifikasi email.");
  }

  await setAuthCookies(data.accessToken, data.refreshToken);
  await ensureUserBootstrap(data.accessToken, {
    id: data.user.id,
    name: getUserName(data.user),
    email: data.user.email
  });
  return data;
}

export async function resendVerificationEmail(email: string) {
  const client = createInsforgeServerClient();
  const { error } = await client.auth.resendVerificationEmail({
    email,
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/sign-in`
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInWithEmail(email: string, password: string) {
  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data?.accessToken || !data.refreshToken) {
    throw new Error(error?.message ?? "Login gagal.");
  }
  if (!data.user) {
    throw new Error("Data user tidak tersedia setelah login.");
  }

  await setAuthCookies(data.accessToken, data.refreshToken);
  await ensureUserBootstrap(data.accessToken, {
    id: data.user.id,
    name: getUserName(data.user),
    email: data.user.email
  });
  return data;
}

export async function signOut() {
  const accessToken = await getAccessTokenFromCookies();
  const client = createInsforgeServerClient(accessToken);
  await client.auth.signOut();
  await clearAuthCookies();
}

export async function sendPasswordReset(email: string) {
  const client = createInsforgeServerClient();
  const { error } = await client.auth.sendResetPasswordEmail({
    email,
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function exchangePasswordResetToken(email: string, code: string) {
  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.exchangeResetPasswordToken({ email, code });

  if (error || !data?.token) {
    throw new Error(error?.message ?? "Kode reset password tidak valid.");
  }

  return data.token;
}

export async function resetPassword(token: string, newPassword: string) {
  const client = createInsforgeServerClient();
  const { error } = await client.auth.resetPassword({
    otp: token,
    newPassword
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return null;
  }

  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.auth.getCurrentUser();

  if (error || !data?.user) {
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      return null;
    }

    const refreshed = await createInsforgeServerClient().auth.refreshSession({ refreshToken });
    if (refreshed.error || !refreshed.data?.accessToken || !refreshed.data.refreshToken) {
      return null;
    }

    await setAuthCookies(refreshed.data.accessToken, refreshed.data.refreshToken);
    const retryClient = createInsforgeServerClient(refreshed.data.accessToken);
    const retried = await retryClient.auth.getCurrentUser();
    return retried.data?.user ?? null;
  }

  return data.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function requireCurrentUserApi() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
