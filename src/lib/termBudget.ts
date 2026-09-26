export type TermBudgetCategory = "tuition" | "rent" | "supplies" | "dining_out" | "custom";

export interface TermBudgetItem {
  id: string;
  category: TermBudgetCategory;
  label: string;
  amount: number;
}

// Fixed line items every student has - a custom item can't collide with
// these since they're upserted by category, not inserted fresh each time.
export const PRESET_TERM_BUDGET_CATEGORIES: {
  category: Exclude<TermBudgetCategory, "custom">;
  label: string;
}[] = [
  { category: "tuition", label: "Tuition" },
  { category: "rent", label: "Rent" },
  { category: "supplies", label: "Supplies" },
  { category: "dining_out", label: "Dining Out" },
];

export function sumTermBudgetItems(items: TermBudgetItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}
