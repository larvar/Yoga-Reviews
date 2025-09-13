import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import ClientInstructor from "./ClientInstructor";

type Review = {
  id: string;
  name: string | null;
  instructor: string | null;
  location: string | null;
  rating: number;
  comment: string | null;
  comments: string | null;
  photo_url: string | null;
  created_at: string;
  approved: boolean;
  hidden: boolean;
};

const norm = (s: string) => s.trim().toLowerCase();

export const dynamic = "force-dynamic";

export default async function InstructorProfilePage({
  params,
}: { params: { name: string } }) {
  const raw = params.name ?? "";
  const safeParam = decodeURIComponent(raw);
  if (!safeParam) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">No instructor selected</h1>
        <p className="mt-2">
          <Link href="/" className="text-blue-700 hover:underline">← Back to reviews</Link>
        </p>
      </div>
    );
  }

  const like = `%${safeParam}%`;
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .eq("hidden", false)
    .ilike("instructor", like)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">Instructor</h1>
        <p className="mt-3 text-red-700">Error: {error.message}</p>
      </div>
    );
  }

  const all = (data || []) as Review[];
  const exact = all.filter((r) => r.instructor && norm(r.instructor) === norm(safeParam));
  const reviews = exact.length ? exact : all;

  const displayName = reviews[0]?.instructor?.trim() || safeParam;
  const ratings = reviews.map((r) => r.rating).filter((n) => typeof n === "number");
  const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
  const count = reviews.length;
  const locations = Array.from(new Set(reviews.map((r) => r.location).filter(Boolean))) as string[];

  const heroCover = reviews.find((r) => r.photo_url)?.photo_url || "/hero.jpg";
  const avatar = reviews.find((r) => r.photo_url)?.photo_url || "/placeholder-avatar.png";

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* HERO */}
      <section className="relative h-[260px] md:h-[340px]">
        <Image
          src={heroCover}
          alt={`${displayName} cover`}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-5xl mx-auto h-full px-6 flex items-end pb-6">
          <div className="flex items-end gap-4">
            <Image
              src={avatar}
              alt={`${displayName} avatar`}
              width={96}
              height={96}
              className="rounded-full border-4 border-white shadow-md object-cover"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">{displayName}</h1>
              <p className="text-white/90">
                {avg !== null ? <>⭐ {avg} average</> : "No ratings yet"}
                {count ? <> • {count} review{count === 1 ? "" : "s"}</> : null}
                {locations.length ? <> • {locations.join(", ")}</> : null}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link href="/" className="text-sm text-blue-700 hover:underline">← Back to reviews</Link>
          <Link href="/instructors" className="text-sm text-blue-700 hover:underline">See all instructors</Link>
        </div>

        <ClientInstructor reviews={reviews} />
      </main>
    </div>
  );
}
