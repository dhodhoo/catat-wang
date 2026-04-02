import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { getDashboardSummary } from "@/lib/transactions/queries";
import { fail, ok } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const summary = await getDashboardSummary(accessToken, user.id);
    return ok(summary);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil ringkasan dashboard.");
  }
}
