"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// If you don't have ToastProvider, comment the next line; fallback toast -> alert().
import { useToast } from "@/components/ToastProvider";

type ClubRow = { location: string | null };

// A light, human-friendly seed list you can tweak anytime
const SEED_OC_CLUBS = [
  "Any LA Fitness (general)",
  "Aliso Viejo",
  "Anaheim",
  "Anaheim Hills",
  "Brea",
  "Buena Park",
  "Costa Mesa",
  "Fountain Valley",
  "Fullerton",
  "Garden Grove",
  "Huntington Beach",
  "Irvine – Barranca",
  "Irvine – Culver",
  "Irvine – Irvine Blvd",
  "Irvine – Michelson",
  "Irvine – Spectrum",
  "Irvine – Walnut",
  "Laguna Hills",
  "Laguna Niguel",
  "Lake Forest",
  "Mission Viejo",
  "Newport Beach",
  "Orange",
  "Placentia",
  "San Clemente",
  "San Juan Capistrano",
  "Santa Ana",
  "Tustin",
  "Westminster",
  "Yorba Linda",
];

export default function ReviewForm() {
  const toast =
    typeof useToast === "function"
      ? useToast()
      : ((msg: string) => alert(msg)) as (m: string) => void;

  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // clubs
  const [clubsFromDb, setClubsFromDb] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [otherClub, setOtherClub] = useState<string>("");

  // Load distinct clubs from Supabase (reviews.location)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("location")
        .not("location", "is", null);
      if (error) {
        console.error(error);
        return;
      }
      const uniqDb = Array.from(
        new Set((data as ClubRow[]).map((r) => (r.location || "").trim()).filter(Boolean))
      );
      if (!cancelled) setClubsFromDb(uniqDb);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge SEED_OC_CLUBS with DB list, de-dupe, sort
  const clubs = useMemo(() => {
    const set = new Set<string>();
    for (const c of SEED_OC_CLUBS) if (c.trim()) set.add(c.trim());
    for (const c of clubsFromDb) if (c.trim()) set.add(c.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clubsFromDb]);

  // If user chooses Other…, we’ll use their custom input
  const effectiveLocation = useMemo(() => {
    if (selectedClub === "Other…") {
      return (otherClub || "").trim() || null;
    }
    return (selectedClub || "").trim() || null;
  }, [selectedClub, otherClub]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanInstructor = (instructor || "").trim();
    if (!cleanInstructor) {
      toast("Please enter the instructor’s name.");
      return;
    }
    if (selectedClub === "Other…" && !effectiveLocation) {
      toast("Please type the club name for ‘Other…’");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Optional photo upload
      let photoUrl: string | null = null;
      if (photoFile) {
        const path = `pending/${Date.now()}-${photoFile.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from("instructor-photos")
          .upload(path, photoFile, {
            upsert: true,
            contentType: photoFile.type || "image/*",
          });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("instructor-photos").getPublicUrl(path);
        photoUrl = data?.publicUrl ?? null;
      }

      // 2) Insert review (trim important fields)
      const cleanName = (name || "").trim();
      const cleanComment = (comment || "").trim();

      const { error } = await supabase.from("reviews").insert([
        {
          name: cleanName || null,
          instructor: cleanInstructor || null,
          location: effectiveLocation, // dropdown or custom
          rating,
          comment: cleanComment || null,
          photo_url: photoUrl,
          approved: false, // will show after approval in /admin
          hidden: false,
        },
      ]);
      if (error) throw error;

      // 3) Reset form
      setName("");
      setInstructor("");
      setSelectedClub("");
      setOtherClub("");
      setRating(5);
      setComment("");
      setPhotoFile(null);

      toast("✅ Review submitted! Pending approval.");
    } catch (err: any) {
      console.error(err);
      toast("❌ Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-600/90 text-white grid place-items-center font-semibold shadow">
          🧘
        </div>
        <div>
          <h2 className="text-lg font-semibold">Leave a Review</h2>
          <p className="text-sm text-gray-500">
            Share intensity, vibe, music, humor, poses — help others find their fit.
          </p>
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your name</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="Optional"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instructor</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="e.g., MonetB, Alex, Priya…"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            required
          />
        </div>

        {/* Club dropdown + "Other…" */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Club / Location</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            <option value="">Select a club…</option>
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Other…">Other…</option>
          </select>

          {selectedClub === "Other…" && (
            <input
              className="mt-2 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Type the club name (e.g., Foothill Ranch)"
              value={otherClub}
              onChange={(e) => setOtherClub(e.target.value)}
            />
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "star" : "stars"}
              </option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Comment</label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="Tell us about intensity, style, sequencing, music, humor, etc."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Photo upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Instructor photo (optional)
          </label>
          <input
            className="mt-1"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-gray-500 mt-1">
            JPEG/PNG. Only upload images you have permission to share.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
