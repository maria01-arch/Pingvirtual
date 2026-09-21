function Bar({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`animate-pulse rounded-full bg-slate-200/70 ${w} ${h}`} />;
}

export default function ServicesLoading() {
  return (
    <div>
      <div className="mb-5 h-40 animate-pulse rounded-2xl bg-gradient-to-br from-slate-200/70 to-slate-200/40" />
      <div className="mb-5 h-12 animate-pulse rounded-2xl bg-slate-200/70" />

      <div className="mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-slate-200/70" />
        ))}
      </div>

      <div className="space-y-7">
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s}>
            <div className="mb-2 flex items-center justify-between px-1">
              <Bar w="w-32" h="h-4" />
              <Bar w="w-12" h="h-3" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i !== 0 ? "border-t border-slate-100" : ""}`}
                >
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-slate-200/70" />
                  <Bar w="w-2/3" h="h-4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
