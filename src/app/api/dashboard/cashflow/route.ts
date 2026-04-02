import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { getCashflowSeries } from "@/lib/transactions/queries";
import { fail, ok } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const series = await getCashflowSeries(accessToken, user.id);
    return ok({ data: series });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil cashflow.");
  }
}
