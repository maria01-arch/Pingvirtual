"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/marketing/showcase-1.jpg",
  "/marketing/showcase-2.jpg",
  "/marketing/showcase-3.jpg",
];

export default function LandingCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl shadow-2xl shadow-brand/20">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`PingVirtual showcase ${i + 1}`}
            className="w-full shrink-0 object-cover"
          />
        ))}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
