import { NextResponse } from "next/server";
import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { createInsforgeAdminClient } from "@/lib/insforge/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireCurrentUserApi();

    const { id } = await params;
    const client = createInsforgeAdminClient();
    const existing = await client.database
      .from("monthly_reports")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing.error) {
      throw existing.error;
    }

    if (!existing.data) {
      return NextResponse.json({ message: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const { error } = await client.database
      .from("monthly_reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = error?.message ?? "Gagal menghapus laporan.";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
