import {
  FormLayoutGrid,
  FormMainColumn,
  FormSidebarColumn,
} from "@/components/ui/responsive-list";

export function WarrantyFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <FormLayoutGrid>
        <FormMainColumn className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-4 h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800/80" />
            </div>
          ))}
        </FormMainColumn>
        <FormSidebarColumn>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-gray-100 dark:bg-gray-800/80" />
              ))}
            </div>
            <div className="mt-5 h-11 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </FormSidebarColumn>
      </FormLayoutGrid>
    </div>
  );
}
