"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

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

type SortKey = "newest" | "oldest" | "rating_desc" | "rating_asc" | "location_az";

export default function ClientInstructor({ reviews }: { reviews: Review[] }) {
  const [sort, setSort] = useState<SortKey>("newest");

  const sorted = useMemo(() => {
    const copy = [...reviews];
    const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

    switch (sort) {
      case "newest":
        copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "rating_desc":
        copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "rating_asc":
        copy.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
        break;
      case "location_az":
        copy.sort((a, b) => {
          const al = norm(a.location);
          const bl = norm(b.location);
          if (!al && !bl) return 0;
          if (!al) return 1;
          if (!bl) return -1;
          return al.localeCompare(bl);
        });
        break;
      default:
        break;
    }
    return copy;
  }, [reviews, sort]);

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <h2 className="text-xl font-bold">Reviews</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">Sort by</label>
          <select
            id="sort"
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating_desc">Highest rating</option>
            <option value="rating_asc">Lowest rating</option>
            <option value="location_az">Location (A–Z)</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-6">No approved reviews for this instructor yet.</div>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => {
            const text = r.comment ?? r.comments ?? "";
            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={r.photo_url || "/placeholder-avatar.png"}
                    alt={r.instructor || "Instructor"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{r.name || "(no name)"}</p>
                      {r.location && <span className="badge">{r.location}</span>}
                    </div>
                    <p className="text-sm text-gray-600">⭐ {r.rating}</p>
                  </div>
                </div>

                {text && <p className="mt-2 italic">"{text}"</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
