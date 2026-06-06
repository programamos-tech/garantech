"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const WEEKDAYS = ["d", "l", "m", "m", "j", "v", "s"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(value: string): string {
  const date = parseIso(value);
  if (!date) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DatePickerProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function DatePicker({
  label,
  name,
  value,
  onChange,
  required,
  className,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const selectedDate = parseIso(value);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [viewYear, setViewYear] = useState(
    () => selectedDate?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => selectedDate?.getMonth() ?? today.getMonth()
  );

  useEffect(() => {
    if (!open) return;
    const date = parseIso(value);
    if (date) {
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    }
    setShowMonthPicker(false);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const startDate = new Date(viewYear, viewMonth, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + index
      );
      return {
        date,
        iso: toIso(date.getFullYear(), date.getMonth(), date.getDate()),
        inCurrentMonth: date.getMonth() === viewMonth,
      };
    });
  }, [viewYear, viewMonth]);

  function goToPreviousMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  function selectToday() {
    onChange(toIso(today.getFullYear(), today.getMonth(), today.getDate()));
    setOpen(false);
  }

  function clearDate() {
    onChange("");
    setOpen(false);
  }

  const inputId = name || label?.toLowerCase().replace(/\s/g, "-") || "date-picker";

  return (
    <div ref={rootRef} className={cn("relative space-y-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}

      <button
        id={inputId}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-left transition-all dark:border-gray-600 dark:bg-gray-900",
          open
            ? "border-brand ring-2 ring-brand/10 dark:border-indigo-400 dark:ring-indigo-400/20"
            : "hover:border-gray-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 dark:hover:border-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
        )}
      >
        <span className={value ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
          {value ? formatDisplay(value) : "Seleccionar fecha"}
        </span>
        <Calendar className="h-4 w-4 text-gray-400 shrink-0 dark:text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40">
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              onClick={() => setShowMonthPicker((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-brand transition-colors dark:text-gray-100 dark:hover:text-indigo-300"
            >
              {MONTHS[viewMonth]} de {viewYear}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  showMonthPicker && "rotate-180"
                )}
              />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
                title="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
                title="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showMonthPicker ? (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {MONTHS.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => {
                    setViewMonth(index);
                    setShowMonthPicker(false);
                  }}
                  className={cn(
                    "rounded-lg px-2 py-2 text-xs font-medium capitalize transition-colors",
                    index === viewMonth
                      ? "bg-brand text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  )}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="py-1 text-center text-xs font-medium text-gray-400 dark:text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map(({ date, iso, inCurrentMonth }) => {
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                  const isToday = isSameDay(date, today);

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => selectDate(iso)}
                      className={cn(
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors",
                        !inCurrentMonth && "text-gray-300 dark:text-gray-600",
                        inCurrentMonth && !isSelected && "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                        isToday && !isSelected && "ring-1 ring-gray-300 dark:ring-gray-600",
                        isSelected &&
                          "bg-brand text-white font-semibold ring-2 ring-amber-400/80"
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              onClick={clearDate}
              className="text-sm font-semibold text-brand hover:opacity-80 dark:text-indigo-300"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={selectToday}
              className="text-sm font-semibold text-brand hover:opacity-80 dark:text-indigo-300"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}
