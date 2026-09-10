"use client";

import { Suspense, useMemo, useState, FormEvent, MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useBudget } from "@/components/BudgetProvider";
import { spots } from "@/data/spots";
import {
  BudgetPeriod,
  periodStart,
  sumExpensesSince,
  budgetStatusColor,
} from "@/lib/budget";

const PERIOD_LABEL: Record<BudgetPeriod, string> = {
  weekly: "This week",
  monthly: "This month",
};

function BudgetProgressCard({ period }: { period: BudgetPeriod }) {
  const { expenses, goals, setGoal } = useBudget();
  const [editing, setEditing] = useState(false);
  const [draftAmount, setDraftAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const goal = goals[period];
  const spent = useMemo(() => sumExpensesSince(expenses, periodStart(period)), [expenses, period]);
  const pct = goal ? Math.min(100, (spent / goal) * 100) : 0;

  const handleSaveGoal = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(draftAmount);
    if (!Number.isFinite(amount) || amount < 0) return;

    setSaving(true);
    await setGoal(period, amount);
    setSaving(false);
    setEditing(false);
    setDraftAmount("");
  };

  const header = (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-900">{PERIOD_LABEL[period]}</h3>
      {goal != null && !editing && (
        <button
          onClick={() => {
            setDraftAmount(String(goal));
            setEditing(true);
          }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Edit goal
        </button>
      )}
    </div>
  );

  if (editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {header}
        <form onSubmit={handleSaveGoal} className="flex items-center gap-2">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            autoFocus
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            placeholder="0.00"
            className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  if (goal == null) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {header}
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-[#1D9E75] font-medium hover:underline"
        >
          + Set a {period} budget
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      {header}
      <p className="text-2xl font-bold text-gray-900">
        ${spent.toFixed(2)}
        <span className="text-sm font-normal text-gray-400"> / ${goal.toFixed(2)}</span>
      </p>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${budgetStatusColor(spent, goal)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {goal > 0 && spent > goal && (
        <p className="mt-1.5 text-xs text-red-500">${(spent - goal).toFixed(2)} over budget</p>
      )}
    </div>
  );
}

function LogSpendForm() {
  const searchParams = useSearchParams();
  const { addExpense } = useBudget();
  // Prefilled from a spot card's "Log spend" link (?spotId=...&amount=...), if present.
  const [amount, setAmount] = useState(() => searchParams.get("amount") ?? "");
  const [spotQuery, setSpotQuery] = useState(() => {
    const spotId = searchParams.get("spotId");
    return spotId ? spots.find((s) => s.id === spotId)?.name ?? "" : "";
  });
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedSpot = useMemo(
    () => spots.find((s) => s.name.toLowerCase() === spotQuery.trim().toLowerCase()),
    [spotQuery]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError("Enter a valid amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await addExpense({
      amount: parsedAmount,
      spotId: matchedSpot?.id ?? null,
      note: note.trim() || undefined,
      spentAt: date,
    });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setAmount("");
      setSpotQuery("");
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-3">
      <h3 className="font-semibold text-gray-900">Log a spend</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Spot (optional)</label>
        <input
          type="text"
          list="budget-spot-options"
          value={spotQuery}
          onChange={(e) => setSpotQuery(e.target.value)}
          placeholder="Search a spot..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <datalist id="budget-spot-options">
          {spots.map((s) => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. dinner with friends"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {submitting ? "Logging..." : "Log spend"}
      </button>
    </form>
  );
}

function ExpenseList() {
  const { expenses, deleteExpense } = useBudget();

  const spotById = useMemo(() => new Map(spots.map((s) => [s.id, s])), []);

  const handleDelete = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    deleteExpense(id);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500">
        No spending logged yet. Add your first entry above.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {expenses.map((expense) => {
        const spot = expense.spotId ? spotById.get(expense.spotId) : undefined;
        return (
          <div key={expense.id} className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {spot?.name ?? expense.note ?? "Spend"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {new Date(`${expense.spentAt}T00:00:00`).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  {spot && expense.note ? ` · ${expense.note}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
              <button
                onClick={(e) => handleDelete(e, expense.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BudgetPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading } = useBudget();

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Sign in to track your spending against a budget
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <BudgetProgressCard period="weekly" />
        <BudgetProgressCard period="monthly" />
      </div>
      <LogSpendForm />
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Recent spending</h2>
        <ExpenseList />
      </div>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Tracker</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Log what you actually spend and see it against your weekly and monthly budget.
        </p>
      </div>
      <Suspense fallback={<div className="py-12 text-center text-sm text-gray-400">Loading…</div>}>
        <BudgetPageContent />
      </Suspense>
    </div>
  );
}
