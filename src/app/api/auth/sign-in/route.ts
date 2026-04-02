import { signInWithEmail } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";
import { signInSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = signInSchema.parse(await request.json());
    await signInWithEmail(body.email, body.password);
    return ok({ status: "ok" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Login gagal.");
  }
}
