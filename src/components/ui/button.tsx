import { cn, cnVariants } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        cnVariants(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          {
            "bg-brand text-white shadow-sm hover:bg-brand-hover hover:shadow-md":
              variant === "primary",
            "bg-white text-brand border border-brand/15 hover:bg-brand-light hover:border-brand/25 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-600":
              variant === "secondary",
            "text-brand/70 hover:bg-brand-light hover:text-brand dark:text-indigo-300 dark:hover:bg-gray-800 dark:hover:text-indigo-200":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === "danger",
            "px-3.5 py-2 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
