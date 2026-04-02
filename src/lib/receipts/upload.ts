import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge/server";

export async function uploadReceiptBlob(
  accessToken: string,
  userId: string,
  fileName: string,
  blob: Blob
) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const storageKey = `${userId}/${Date.now()}-${fileName}`;
  const { data, error } = await client.storage.from("receipts").upload(storageKey, blob);

  if (error || !data) {
    throw new Error(error?.message ?? "Gagal upload receipt.");
  }

  return {
    bucket: "receipts",
    key: data.key,
    url: data.url
  };
}
