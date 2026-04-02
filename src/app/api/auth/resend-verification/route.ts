import { resendVerificationEmail } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";
import { resendVerificationSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = resendVerificationSchema.parse(await request.json());
    await resendVerificationEmail(body.email);
    return ok({ status: "ok" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengirim ulang kode verifikasi.");
  }
}
