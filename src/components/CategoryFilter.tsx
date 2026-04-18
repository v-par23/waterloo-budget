"use client";

import { Category, categoryConfig } from "@/data/spots";

interface CategoryFilterProps {
  selected: Category | "all";
  onChange: (category: Category | "all") => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories = Object.entries(categoryConfig) as [
    Category,
    { label: string; emoji: string; color: string }
  ][];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === "all"
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            selected === key
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span>{config.emoji}</span>
          <span className="hidden sm:inline">{config.label}</span>
        </button>
      ))}
    </div>
  );
}
