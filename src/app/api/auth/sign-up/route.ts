import { signUpWithEmail } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = signUpSchema.parse(await request.json());
    const result = await signUpWithEmail(body);
    return ok(
      result.status === "verification_required"
        ? { status: "verification_required", verifyMethod: "code", email: body.email }
        : { status: "signed_in" }
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal melakukan registrasi.");
  }
}
