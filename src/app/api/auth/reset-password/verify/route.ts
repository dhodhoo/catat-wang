import { exchangePasswordResetToken } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; code?: string };
    if (!body.email || !body.code) {
      return fail("Email dan kode reset wajib diisi.");
    }
    const token = await exchangePasswordResetToken(body.email, body.code);
    return ok({ status: "ok", token });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Kode reset tidak valid.");
  }
}
