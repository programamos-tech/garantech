import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: 28, text: "text-base" },
  md: { img: 36, text: "text-xl" },
  lg: { img: 48, text: "text-2xl" },
};

export function Logo({
  variant = "dark",
  size = "md",
  showWordmark = true,
  className,
}: LogoProps) {
  const { img, text } = sizes[size];

  if (variant === "light") {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src="/logo.png"
          alt="GaranTech"
          width={img * 4}
          height={img}
          className="h-auto w-auto max-h-10 object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex shrink-0 items-center justify-center rounded-xl bg-brand font-bold text-white shadow-sm"
        style={{ width: img, height: img, fontSize: img * 0.35 }}
      >
        GT
      </div>
      {showWordmark && (
        <span
          className={cn(
            text,
            "font-bold tracking-tight text-brand uppercase"
          )}
        >
          GaranTech
        </span>
      )}
    </div>
  );
}
