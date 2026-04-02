import { sendPasswordReset } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    if (!body.email) {
      return fail("Email wajib diisi.");
    }
    await sendPasswordReset(body.email);
    return ok({ status: "ok" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengirim reset password.");
  }
}
