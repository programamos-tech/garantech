"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function DashboardNavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setVisible(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 450);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden md:left-64 print:hidden"
    >
      <div className="h-full w-1/3 animate-[dashboard-nav-progress_0.45s_ease-out_forwards] bg-brand dark:bg-indigo-400" />
    </div>
  );
}
