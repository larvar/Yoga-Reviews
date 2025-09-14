import { supabase } from "@/lib/supabaseClient";
import { supabase } from "../../lib/supabaseClient";

type Row = {
  instructor: string | null;
  location: string | null;
  rating: number | null;
  photo_url: string | null;
  approved: boolean;
  hidden: boolean;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function InstructorsIndex() {
  // Pull all approved/visible reviews; we’ll aggregate in memory
  const { data, error } = await supabase
    .from("reviews")
    .select("instructor,location,rating,photo_url,approved,hidden,created_at")
    .eq("approved", true)
    .eq("hidden", false);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">Instructors</h1>
        <p className="mt-3 text-red-700">Error: {error.message}</p>
      </div>
    );
  }

  const rows = (data || []) as Row[];

  // Aggregate by instructor
  const byInstructor = new Map<
    string,
    { count: number; sum: number; locations: Set<string>; latestPhoto?: { url: string; created_at: string } }
  >();

  const allLocations = new Set<string>();

  for (const r of rows) {
    const name = (r.instructor ?? "").trim();
    if (!name) continue;

    if (!byInstructor.has(name)) {
      byInstructor.set(name, { count: 0, sum: 0, locations: new Set() });
    }
    const agg = byInstructor.get(name)!;
    agg.count += 1;
    agg.sum += r.rating || 0;

    if (r.location) {
      agg.locations.add(r.location);
      allLocations.add(r.location);
    }
    if (r.photo_url) {
      const prev = agg.latestPhoto;
      if (!prev || new Date(r.created_at) > new Date(prev.created_at)) {
        agg.latestPhoto = { url: r.photo_url, created_at: r.created_at };
      }
    }
  }

  const list = Array.from(byInstructor.entries()).map(([name, v]) => ({
    name,
    avg: v.count ? Math.round((v.sum / v.count) * 10) / 10 : null,
    count: v.count,
    locs: Array.from(v.locations),
    photo: v.latestPhoto?.url ?? "/placeholder-avatar.png",
  }));

  const locations = Array.from(allLocations).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Instructors</h1>
          <p className="text-gray-600 mt-1">Browse instructors with average rating and clubs. Use search and filters.</p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-14">
        <ClientInstructors initialList={list} locations={locations} />
      </main>
    </div>
  );
}
