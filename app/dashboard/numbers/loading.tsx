export default function NumbersLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200/70" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200/70" />
          </div>
          <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-slate-200/50" />
        </div>
      ))}
    </div>
  );
}
