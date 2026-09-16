import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Globe2,
  Wallet,
  Star,
  Mail,
} from "lucide-react";
import LandingCarousel from "./landing-carousel";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Numbers",
    text: "Get a working number in under a minute, any time of day.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Delivery",
    text: "Automatic backup provider keeps numbers coming even when one runs low.",
  },
  {
    icon: Globe2,
    title: "Thousands of Services",
    text: "WhatsApp, Telegram, Facebook, and hundreds more, across dozens of countries.",
  },
  {
    icon: Wallet,
    title: "Pay As You Go",
    text: "Top up your wallet and only pay for the numbers you actually use.",
  },
];

// Placeholder testimonials - swap these for real customer reviews once
// you have some. Publishing these as genuine reviews would be misleading.
const TESTIMONIALS = [
  {
    name: "Amara O.",
    role: "Social media manager",
    quote:
      "I manage a dozen client accounts and PingVirtual has made verification painless. Numbers arrive fast and the pricing is fair.",
  },
  {
    name: "Daniel K.",
    role: "Indie developer",
    quote:
      "Testing OTP flows used to eat up my afternoon. Now I grab a number, get the code, and move on with my day.",
  },
  {
    name: "Priya S.",
    role: "E-commerce seller",
    quote:
      "Simple wallet system, clear pricing in P, and support actually responds. Exactly what I needed.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
            <span>Ping<span className="text-brand">Virtual</span></span>
          </span>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 sm:flex">
            <a href="#features">Features</a>
            <a href="#reviews">Reviews</a>
            <a href="#about">About</a>
            <Link href="/dashboard/faq">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-brand to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light to-white px-6 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 sm:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Get verified.<br />
              <span className="text-brand">Get noticed.</span><br />
              Grow faster.
            </h1>
            <p className="mt-5 max-w-md text-lg font-medium text-slate-700">
              PingVirtual gives you instant virtual phone numbers to receive
              SMS verification codes for WhatsApp, Telegram, Facebook, and
              hundreds of other platforms - quickly, securely, and reliably.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-brand to-violet-600 px-6 py-3.5 font-semibold text-white shadow-md shadow-brand/30"
              >
                Get Verified Now
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 px-6 py-3.5 font-semibold text-slate-800"
              >
                Log In
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <ShieldCheck size={16} className="text-brand" />
              Secure, fast, and reliable virtual numbers
            </p>
          </div>

          <LandingCarousel />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Everything you need to get verified
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-medium text-slate-700">
          Built for individuals, developers, and businesses who need
          verification numbers without the hassle of a second SIM card.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <f.icon size={22} />
              </div>
              <h3 className="font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm font-medium text-slate-700">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Trusted by creators, developers, and brands
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-800">
                  "{t.quote}"
                </p>
                <p className="mt-4 text-sm font-bold text-slate-900">
                  {t.name}
                </p>
                <p className="text-xs font-medium text-slate-600">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">About PingVirtual</h2>
        <p className="mx-auto mt-5 max-w-2xl font-medium leading-relaxed text-slate-700">
          PingVirtual is a virtual phone number service built for anyone who
          needs to verify an account without exposing a personal phone
          number. We give individuals, developers, and businesses instant
          access to real, working numbers across hundreds of services and
          dozens of countries - backed by multiple number providers so
          you're never left waiting.
        </p>
        <p className="mx-auto mt-4 max-w-2xl font-medium leading-relaxed text-slate-700">
          PingVirtual is a product of{" "}
          <span className="font-bold text-slate-900">Xchordlabs LLC</span>.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <span className="flex items-center justify-center gap-2 font-extrabold text-slate-900 sm:justify-start">
              <img src="/icon-192.png" alt="" className="h-6 w-6 rounded-md" />
              PingVirtual
            </span>
            <p className="mt-1 text-xs font-medium text-slate-600">
              A product of Xchordlabs LLC
            </p>
          </div>
          <a
            href="mailto:support@xchord.space"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
          >
            <Mail size={15} />
            support@xchord.space
          </a>
        </div>
        <p className="mt-6 text-center text-xs font-medium text-slate-500">
          © {new Date().getFullYear()} Xchordlabs LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
