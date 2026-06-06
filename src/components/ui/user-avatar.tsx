"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { cn } from "@/lib/utils";

/** Fondos en paleta GaranTech */
const BRAND_BG = ["212355", "2d3068", "373a7a"] as const;

interface UserAvatarProps {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ seed, name, size = 36, className }: UserAvatarProps) {
  const dataUri = useMemo(
    () =>
      createAvatar(lorelei, {
        seed,
        size,
        backgroundColor: [...BRAND_BG],
        backgroundType: ["solid"],
        radius: 50,
      }).toDataUri(),
    [seed, size]
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUri}
      alt={`Avatar de ${name}`}
      width={size}
      height={size}
      className={cn(
        "rounded-full shrink-0 ring-2 ring-white shadow-sm shadow-brand/10 object-cover",
        className
      )}
    />
  );
}
