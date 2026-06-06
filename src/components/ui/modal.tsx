"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 lg:left-64 flex items-end justify-center sm:items-center p-3 sm:p-4 pointer-events-none">
        <div
          className={`relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl shadow-brand/15 sm:rounded-2xl pointer-events-auto dark:border dark:border-gray-700 dark:shadow-black/50 ${
            wide ? "sm:max-w-2xl" : "sm:max-w-lg"
          }`}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-brand/8 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-bold text-brand dark:text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-brand/40 hover:bg-brand-light hover:text-brand transition-colors dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-4 py-4 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
