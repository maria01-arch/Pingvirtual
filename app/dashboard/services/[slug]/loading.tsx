export default function CountryListLoading() {
  return (
    <div>
      <div className="mb-4 h-4 w-32 animate-pulse rounded-full bg-slate-200/70" />
      <div className="mb-5 flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200/70" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3.5 ${i !== 0 ? "border-t border-slate-100" : ""}`}
          >
            <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200/70" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-slate-200/70" />
              <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-slate-200/50" />
            </div>
            <div className="h-6 w-12 animate-pulse rounded-full bg-slate-200/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
