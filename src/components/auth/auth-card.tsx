import Link from "next/link";
import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: { text: string; linkText: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-950",
        className
      )}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      {children}

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {footer.text}{" "}
        <Link href={footer.href} className="link-brand">
          {footer.linkText}
        </Link>
      </p>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
    >
      {message}
    </p>
  );
}
