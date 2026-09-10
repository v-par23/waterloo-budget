"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { Expense, BudgetPeriod } from "@/lib/budget";

interface AddExpenseInput {
  amount: number;
  spotId?: string | null;
  note?: string;
  spentAt?: string;
}

interface BudgetContextType {
  expenses: Expense[];
  goals: Record<BudgetPeriod, number | null>;
  loading: boolean;
  addExpense: (input: AddExpenseInput) => Promise<{ error: string | null }>;
  deleteExpense: (id: string) => Promise<{ error: string | null }>;
  setGoal: (period: BudgetPeriod, amount: number) => Promise<{ error: string | null }>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Record<BudgetPeriod, number | null>>({ weekly: null, monthly: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setExpenses([]);
        setGoals({ weekly: null, monthly: null });
        setLoading(false);
        return;
      }

      const [expensesRes, goalsRes] = await Promise.all([
        supabase
          .from("expenses")
          .select("id, spot_id, amount, note, spent_at")
          .eq("user_id", user.id)
          .order("spent_at", { ascending: false }),
        supabase.from("budget_goals").select("period, amount").eq("user_id", user.id),
      ]);

      if (!expensesRes.error && expensesRes.data) {
        setExpenses(
          expensesRes.data.map((e) => ({
            id: e.id,
            spotId: e.spot_id,
            amount: Number(e.amount),
            note: e.note,
            spentAt: e.spent_at,
          }))
        );
      }

      if (!goalsRes.error && goalsRes.data) {
        const next: Record<BudgetPeriod, number | null> = { weekly: null, monthly: null };
        for (const g of goalsRes.data) {
          next[g.period as BudgetPeriod] = Number(g.amount);
        }
        setGoals(next);
      }

      setLoading(false);
    }

    load();
  }, [user, supabase]);

  const addExpense = useCallback(
    async (input: AddExpenseInput): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const spentAt = input.spentAt || new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: user.id,
          spot_id: input.spotId || null,
          amount: input.amount,
          note: input.note || null,
          spent_at: spentAt,
        })
        .select("id, spot_id, amount, note, spent_at")
        .single();

      if (!error && data) {
        const newExpense: Expense = {
          id: data.id,
          spotId: data.spot_id,
          amount: Number(data.amount),
          note: data.note,
          spentAt: data.spent_at,
        };
        setExpenses((prev) =>
          [newExpense, ...prev].sort((a, b) => (a.spentAt < b.spentAt ? 1 : -1))
        );
      }

      return { error: error?.message || null };
    },
    [user, supabase]
  );

  const deleteExpense = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);

      if (!error) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }

      return { error: error?.message || null };
    },
    [user, supabase]
  );

  const setGoal = useCallback(
    async (period: BudgetPeriod, amount: number): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const { error } = await supabase
        .from("budget_goals")
        .upsert({ user_id: user.id, period, amount }, { onConflict: "user_id,period" });

      if (!error) {
        setGoals((prev) => ({ ...prev, [period]: amount }));
      }

      return { error: error?.message || null };
    },
    [user, supabase]
  );

  return (
    <BudgetContext.Provider value={{ expenses, goals, loading, addExpense, deleteExpense, setGoal }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
