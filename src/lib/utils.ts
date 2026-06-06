type ClassValue = string | boolean | undefined | null;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export function cnVariants(
  base: string,
  variants: Record<string, boolean>
): string {
  const active = Object.entries(variants)
    .filter(([, active]) => active)
    .map(([className]) => className);
  return cn(base, ...active);
}
