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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === "all"
            ? "bg-[#1D9E75] text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === key
              ? "bg-[#1D9E75] text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {config.label}
        </button>
      ))}
    </div>
  );
}
