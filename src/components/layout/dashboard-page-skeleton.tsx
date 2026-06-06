export function DashboardPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-3 h-8 w-56 max-w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-100 dark:bg-gray-800/80" />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800/80" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
