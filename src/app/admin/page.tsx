"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Review = {
  id: string;
  name: string | null;
  instructor: string | null;
  comment?: string | null;
  comments?: string | null;
  rating: number;
  location?: string | null;
  photo_url?: string | null;
  created_at: string;
  approved: boolean;
  hidden: boolean;
  flag_count: number;
  approved_at?: string | null;
};

type Tab = "pending" | "all" | "hidden";

export default function AdminPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState<Tab>("pending");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "rating" | "flags">("newest");

  const [token, setToken] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  // Load/save admin token to localStorage so you don’t retype it
  useEffect(() => {
    const saved = window.localStorage.getItem("admin_token") || "";
    setToken(saved);
  }, []);
  useEffect(() => {
    if (token) window.localStorage.setItem("admin_token", token);
  }, [token]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setRows(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  // Filters
  const filtered = useMemo(() => {
    let v = rows.slice();
    // tab filter
    if (tab === "pending") v = v.filter((r) => !r.approved && !r.hidden);
    if (tab === "hidden") v = v.filter((r) => r.hidden);
    // search
    const needle = q.trim().toLowerCase();
    if (needle) {
      v = v.filter((r) => {
        const text = `${r.instructor ?? ""} ${r.name ?? ""} ${r.location ?? ""} ${r.comment ?? r.comments ?? ""}`.toLowerCase();
        return text.includes(needle);
      });
    }
    // sort
    v.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "flags":
          return (b.flag_count ?? 0) - (a.flag_count ?? 0);
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return v;
  }, [rows, tab, q, sort]);

  const call = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("Action failed: " + (j.error || res.statusText));
      return false;
    }
    return true;
  };

  const approve = async (id: string, value: boolean) => {
    setSaving(id);
    const ok = await call("/api/moderate/approve", { id, approved: value });
    if (ok) await load();
    setSaving(null);
  };

  const toggleHide = async (id: string, hidden: boolean) => {
    setSaving(id);
    const ok = await call("/api/moderate/hide", { id, hidden });
    if (ok) await load();
    setSaving(null);
  };

  const approveAndNext = async (currentId: string) => {
    await approve(currentId, true);
    // move to the next pending automatically
    const next = filtered.find((r) => !r.approved && !r.hidden && r.id !== currentId);
    if (next) {
      // scroll into view to keep flow
      const el = document.getElementById(`card-${next.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const bulkApprovePending = async () => {
    if (!confirm("Approve ALL currently visible pending reviews?")) return;
    setBulkBusy(true);
    const targets = filtered.filter((r) => !r.approved && !r.hidden).map((r) => r.id);
    for (const id of targets) {
      const ok = await call("/api/moderate/approve", { id, approved: true });
      if (!ok) break;
    }
    await load();
    setBulkBusy(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      {/* Sticky admin bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border rounded-lg p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">Admin moderation</h1>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="password"
              placeholder="Admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="border rounded px-3 py-2 w-72"
            />
            <button
              onClick={load}
              className="px-3 py-2 rounded border"
              title="Reload"
            >
              Reload
            </button>
          </div>

          <div className="w-full flex flex-wrap items-center gap-2 mt-2">
            {/* Tabs */}
            <div className="flex gap-1">
              {(["pending", "all", "hidden"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    tab === t ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <input
              className="ml-auto border rounded px-3 py-2 w-72"
              placeholder="Search instructor, name, text…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rating">Rating (high→low)</option>
              <option value="flags">Flags (high→low)</option>
            </select>

            {tab === "pending" && (
              <button
                onClick={bulkApprovePending}
                disabled={bulkBusy || !token}
                className="px-3 py-2 rounded bg-green-600 text-white"
              >
                {bulkBusy ? "Approving…" : "Approve all (visible)"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center p-10 border rounded-lg bg-gray-50 shadow-sm">
          <p className="mb-1 font-medium">No reviews in this view.</p>
          <p className="text-sm text-gray-500">Try switching tabs or clearing the search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const text = r.comment ?? r.comments ?? "";
            return (
              <div
                id={`card-${r.id}`}
                key={r.id}
                className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {r.photo_url && (
                    <img
                      src={r.photo_url}
                      alt={r.instructor || "Instructor"}
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold truncate">{r.instructor || "(instructor)"}</div>
                      {r.location && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border">
                          {r.location}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-50">
                        ⭐ {r.rating}
                      </span>
                      {r.flag_count > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-50">
                          Flags: {r.flag_count}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${r.approved ? "bg-green-50" : "bg-amber-50"}`}>
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                      {r.hidden && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-red-50">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 truncate">
                      {r.name || "(no name)"} • {new Date(r.created_at).toLocaleString()}
                    </div>
                    {text && <p className="mt-2">{text}</p>}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {!r.approved && !r.hidden && (
                    <button
                      onClick={() => approveAndNext(r.id)}
                      disabled={saving === r.id || !token}
                      className="px-3 py-2 rounded bg-green-600 text-white"
                      title="Approve, then auto-scroll to next pending"
                    >
                      {saving === r.id ? "Working…" : "Approve & Next"}
                    </button>
                  )}
                  <button
                    onClick={() => approve(r.id, !r.approved)}
                    disabled={saving === r.id || !token}
                    className="px-3 py-2 rounded border"
                  >
                    {r.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => toggleHide(r.id, !r.hidden)}
                    disabled={saving === r.id || !token}
                    className="px-3 py-2 rounded border"
                  >
                    {r.hidden ? "Unhide" : "Hide"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
