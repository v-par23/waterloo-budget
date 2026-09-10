export interface Expense {
  id: string;
  spotId: string | null;
  amount: number;
  note: string | null;
  spentAt: string; // YYYY-MM-DD
}

export type BudgetPeriod = "weekly" | "monthly";

// Monday-start week, matching how most students think about a "week."
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isOnOrAfter(spentAt: string, start: Date): boolean {
  const d = new Date(`${spentAt}T00:00:00`);
  return d >= start;
}

export function sumExpensesSince(expenses: Expense[], start: Date): number {
  return expenses
    .filter((e) => isOnOrAfter(e.spentAt, start))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function periodStart(period: BudgetPeriod, now: Date = new Date()): Date {
  return period === "weekly" ? startOfWeek(now) : startOfMonth(now);
}

// Progress-bar color: green while comfortably under budget, amber approaching
// it, red once it's exceeded.
export function budgetStatusColor(spent: number, goal: number | null): string {
  if (!goal || goal <= 0) return "bg-gray-300";
  const ratio = spent / goal;
  if (ratio >= 1) return "bg-red-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-emerald-500";
}
