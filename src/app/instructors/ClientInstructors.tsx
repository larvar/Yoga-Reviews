"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type InstructorCard = {
  name: string;
  avg: number | null;
  count: number;
  locs: string[];
  photo: string; // url or /placeholder-avatar.png
};

export default function ClientInstructors({
  initialList,
  locations,
}: {
  initialList: InstructorCard[];
  locations: string[];
}) {
  const [query, setQuery] = useState("");
  const [club, setClub] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialList
      .filter((i) => (q ? i.name.toLowerCase().includes(q) : true))
      .filter((i) => (club ? i.locs.includes(club) : true))
      .sort((a, b) => {
        const byCount = b.count - a.count;
        if (byCount !== 0) return byCount;
        const byAvg = (b.avg ?? 0) - (a.avg ?? 0);
        if (byAvg !== 0) return byAvg;
        return a.name.localeCompare(b.name);
      });
  }, [initialList, query, club]);

  return (
    <div>
      {/* Controls */}
      <div className="card p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Search by instructor name</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="e.g., MonetB, Alex, Priya…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by club/location</label>
            <select
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              value={club}
              onChange={(e) => setClub(e.target.value)}
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing <b>{filtered.length}</b> instructor{filtered.length === 1 ? "" : "s"}
          {club ? <> in <b>{club}</b></> : null}
          {query ? <> matching “<b>{query}</b>”</> : null}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card p-6">No instructors match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((i) => (
            <Link
              key={i.name}
              href={`/instructors/${encodeURIComponent(i.name)}`}
              className="card p-4 hover:no-underline"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={i.photo || "/placeholder-avatar.png"}
                  alt={i.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover border"
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{i.name}</div>
                  <div className="text-sm text-gray-600">
                    {i.avg !== null ? `⭐ ${i.avg}` : "No ratings yet"} • {i.count} review
                    {i.count === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              {i.locs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {i.locs.slice(0, 3).map((loc) => (
                    <span key={loc} className="badge">
                      {loc}
                    </span>
                  ))}
                  {i.locs.length > 3 && <span className="badge">+{i.locs.length - 3} more</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
