import { signOut } from "@/lib/insforge/auth";
import { fail, ok } from "@/lib/utils/http";

export async function POST() {
  try {
    await signOut();
    return ok({ status: "ok" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Logout gagal.");
  }
}
