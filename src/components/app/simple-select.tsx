"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption<T extends string> = { value: T; label: React.ReactNode };

/** Select de una opción con etiquetas (envoltorio de Base UI Select) */
export function SimpleSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
  className,
  size,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "default";
}) {
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
  return (
    <Select<T> value={value} onValueChange={(v) => v != null && onChange(v)} items={items}>
      <SelectTrigger size={size} className={cn("w-full bg-white", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
