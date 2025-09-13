import { createClient } from "@supabase/supabase-js";

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

if (!rawUrl) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL is empty/missing");
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(rawUrl)) {
  throw new Error(`ENV NEXT_PUBLIC_SUPABASE_URL looks wrong: "${rawUrl}" (expected https://<project-ref>.supabase.co)`);
}
if (!rawKey) throw new Error("ENV NEXT_PUBLIC_SUPABASE_ANON_KEY is empty/missing");

export const supabase = createClient(rawUrl, rawKey);
