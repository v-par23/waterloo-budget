"use client";

import { Category, categoryConfig } from "@/data/spots";

interface CategoryFilterProps {
  selected: Category | "all";
  onChange: (category: Category | "all") => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories = Object.entries(categoryConfig) as [
    Category,
    { label: string; emoji: string; color: string; iconBg: string }
  ][];

  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        onClick={() => onChange("all")}
        className="receipt-chip"
        data-active={selected === "all"}
      >
        ALL
      </button>
      {categories.map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="receipt-chip"
          data-active={selected === key}
        >
          {config.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
