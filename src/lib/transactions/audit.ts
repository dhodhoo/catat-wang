import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge/server";

export async function writeTransactionAudit(accessToken: string, payload: Record<string, unknown>) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const { error } = await client.database.from("transaction_audits").insert([payload]);

  if (error) {
    throw new Error(error.message);
  }
}
