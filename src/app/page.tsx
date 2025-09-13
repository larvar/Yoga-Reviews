
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-dots">
      {/* HERO */}
      <section
        className="relative"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.35)), url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow">
            LA Fitness Yoga Reviews
          </h1>
          <p className="mt-3 text-white/90 max-w-2xl">
            Find classes and instructors that match your vibe — by intensity, style, music, and more.
          </p>
        </div>
      </section>
      
import Link from "next/link";
// ...
<p className="mt-2">
  <Link href="/instructors" className="text-white/90 underline decoration-white/50 hover:decoration-white">
    Browse all instructors →
  </Link>
</p>
      

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 -mt-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <ReviewForm />
          </div>
          <div className="lg:col-span-1">
            {/* spacer on large screens so list aligns with form — remove if you prefer full width */}
          </div>
        </div>

        <div className="mt-6">
          <ReviewList />
        </div>
      </main>
    </div>
  );
}
