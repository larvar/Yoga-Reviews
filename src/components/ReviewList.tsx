"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
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

type SortKey = "newest" | "oldest" | "rating_desc" | "rating_asc" | "instructor_asc";

export default function ReviewList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    fetchReviews(sort);
  }, [sort]);

  async function fetchReviews(s: SortKey) {
    setLoading(true);
    let query = supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .eq("hidden", false);

    // Server-side ordering for reliability/perf
    switch (s) {
      case "instructor_asc":
        // Trim/normalize happens on insert; this will sort A→Z.
        // nullsFirst:false pushes empty instructor rows to bottom.
        query = query.order("instructor", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "rating_desc":
        query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "rating_asc":
        query = query.order("rating", { ascending: true }).order("created_at", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  }

  if (loading) return <p>Loading reviews…</p>;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">Recent Reviews</h2>
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
            <option value="instructor_asc">Instructor (A–Z)</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-6">No reviews yet.</div>
      ) : (
        reviews.map((r) => {
          const text = r.comment ?? r.comments ?? "";
          const inst = (r.instructor ?? "").trim();
          const slug = encodeURIComponent(inst);
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
                    <p className="font-semibold truncate">{r.name || "(no name)"}</p>
                    {r.location && <span className="badge">{r.location}</span>}
                  </div>

                  <p className="text-sm text-gray-600">
                    Instructor:{" "}
                    {inst ? (
                      <Link
                        href={`/instructors/${slug}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {inst}
                      </Link>
                    ) : (
                      <span className="font-medium">(none)</span>
                    )}
                  </p>

                  <p className="text-sm text-gray-600">⭐ {r.rating}</p>
                </div>
              </div>

              {text && <p className="mt-2 italic">"{text}"</p>}

              <p className="text-xs text-gray-500 mt-1">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
