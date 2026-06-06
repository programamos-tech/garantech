import { cn } from "@/lib/utils";

/** Tablas solo en desktop (≥1024px). Tablet y móvil usan tarjetas. */
export function ResponsiveTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hidden lg:block overflow-x-auto", className)}>{children}</div>
  );
}

export function ResponsiveCardList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "lg:hidden divide-y divide-gray-100 dark:divide-gray-800",
        className
      )}
    >
      {children}
    </ul>
  );
}

export function ResponsiveCardItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "w-full text-left px-4 py-4 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/60 active:bg-gray-100 dark:active:bg-gray-800",
    className
  );

  if (onClick) {
    return (
      <li>
        <button type="button" onClick={onClick} className={classes}>
          {children}
        </button>
      </li>
    );
  }

  return <li className={classes}>{children}</li>;
}

export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FilterSearch({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full min-w-0 sm:flex-1 sm:min-w-[10rem]", className)}>
      {children}
    </div>
  );
}

export function FilterGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-row flex-wrap items-end gap-3 w-full sm:w-auto shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeaderContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full sm:flex-1", className)}>{children}</div>
  );
}

export function PageActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto shrink-0 [&>*]:w-full sm:[&>*]:w-auto">
      {children}
    </div>
  );
}

export function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5 min-w-0 w-[calc(50%-0.375rem)] sm:w-32 lg:w-36 xl:w-40", className)}>
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {children}
    </div>
  );
}

export function FormPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function FormLayoutGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full max-w-none grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_min(280px,38%)] lg:grid-cols-[minmax(0,1fr)_min(320px,34%)] xl:grid-cols-[minmax(0,1fr)_400px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FormMainColumn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0 w-full space-y-4", className)}>{children}</div>;
}

export function FormSidebarColumn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 w-full space-y-4 md:sticky md:top-20", className)}>
      {children}
    </div>
  );
}
