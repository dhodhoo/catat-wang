import { resetPassword } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; newPassword?: string };
    if (!body.token || !body.newPassword) {
      return fail("Token dan password baru wajib diisi.");
    }
    await resetPassword(body.token, body.newPassword);
    return ok({ status: "ok" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Reset password gagal.");
  }
}
