import { createClient } from "@insforge/sdk";
import { env } from "@/lib/utils/env";

export function createInsforgeBrowserClient() {
  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.INSFORGE_ANON_KEY
  });
}
