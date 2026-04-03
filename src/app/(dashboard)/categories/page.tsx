import { CategoriesManager } from "@/components/categories/categories-manager";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { listCategories } from "@/lib/categories/service";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";

export default async function CategoriesPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const categories = await listCategories(accessToken, user.id);

  return (
    <DashboardShell title="Manajemen Kategori" subtitle="Kelola kategori default dan custom untuk pemasukan maupun pengeluaran.">
      <CategoriesManager initialCategories={categories as any[]} />
    </DashboardShell>
  );
}
