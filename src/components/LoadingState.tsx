export function LoadingState() {
  return (
    <div className="glass-card grid min-h-72 place-items-center p-8 text-center text-slate-700 dark:text-slate-100">
      <div>
        <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/40 border-t-sky-400" />
        <p className="text-lg font-semibold">Fetching the latest weather</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Clouds, charts, and all the useful bits.</p>
      </div>
    </div>
  );
}
