import { createClient } from "@insforge/sdk";
import { env } from "@/lib/utils/env";

export function createInsforgeServerClient(accessToken?: string) {
  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.INSFORGE_ANON_KEY,
    isServerMode: true,
    edgeFunctionToken: accessToken
  });
}

export function createInsforgeAdminClient() {
  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.INSFORGE_SERVICE_KEY ?? env.INSFORGE_ANON_KEY,
    isServerMode: true
  });
}
