"use client";

import { useEffect, useState } from "react";
import { Sparkles, Search, ShieldCheck } from "lucide-react";

const SLIDES = [
  {
    icon: Sparkles,
    title: "Get premium numbers at very low prices",
    subtitle: "with PingVirtual",
    gradient: "from-brand to-violet-600",
  },
  {
    icon: Search,
    title: "Can't find a number?",
    subtitle: "Search above to browse thousands of available services",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Using a VPN?",
    subtitle: "Match your VPN location to the number's country for best results",
    gradient: "from-purple-500 to-fuchsia-600",
  },
];

export default function ServicesCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-5 overflow-hidden rounded-2xl shadow-sm">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => {
          const Icon = slide.icon;
          return (
            <div
              key={i}
              className={`flex w-full shrink-0 items-center gap-3 bg-gradient-to-br p-5 text-white ${slide.gradient}`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{slide.title}</p>
                <p className="mt-0.5 text-sm text-white/90">{slide.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-1.5 bg-slate-900/5 py-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-brand" : "w-1.5 bg-slate-300"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
