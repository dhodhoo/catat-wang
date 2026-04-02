import { verifyEmailCode } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = verifyEmailSchema.parse(await request.json());
    await verifyEmailCode(body.email, body.otp);
    return ok({ status: "verified" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Verifikasi email gagal.");
  }
}
