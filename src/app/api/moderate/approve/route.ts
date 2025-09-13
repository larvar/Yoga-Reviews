import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN!;

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, approved, moderator_note } = await req.json();
  if (!id || typeof approved !== "boolean") {
    return NextResponse.json({ error: "id and approved required" }, { status: 400 });
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { error } = await supabase
    .from("reviews")
    .update({ approved, approved_at: approved ? new Date().toISOString() : null, moderator_note })
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
