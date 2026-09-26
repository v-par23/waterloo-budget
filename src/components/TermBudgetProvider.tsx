"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { TermBudgetItem, TermBudgetCategory } from "@/lib/termBudget";
import { PRESET_TERM_BUDGET_CATEGORIES } from "@/lib/termBudget";

interface TermBudgetContextType {
  items: TermBudgetItem[];
  loading: boolean;
  addCustomItem: (label: string, amount: number) => Promise<{ error: string | null }>;
  updateItem: (id: string, changes: { label?: string; amount?: number }) => Promise<{ error: string | null }>;
  removeItem: (id: string) => Promise<{ error: string | null }>;
}

const TermBudgetContext = createContext<TermBudgetContextType | null>(null);

function seededKey(userId: string) {
  return `term-budget-seeded:${userId}`;
}

export function TermBudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TermBudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("term_budget_items")
        .select("id, category, label, amount")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error || !data) {
        setLoading(false);
        return;
      }

      let rows = data;

      // First-ever visit: seed the example categories once so there's
      // something to start from. Presets are otherwise ordinary rows -
      // editable and removable exactly like a custom item - so this only
      // needs to run when nothing exists yet, guarded by a local flag to
      // avoid re-seeding after someone deletes everything on purpose.
      let alreadySeeded = true;
      try {
        alreadySeeded = localStorage.getItem(seededKey(user.id)) === "1";
      } catch {
        // Private browsing / storage disabled - just skip seeding rather
        // than risk reseeding every load.
        alreadySeeded = true;
      }

      if (rows.length === 0 && !alreadySeeded) {
        const { data: seeded } = await supabase
          .from("term_budget_items")
          .insert(
            PRESET_TERM_BUDGET_CATEGORIES.map((preset) => ({
              user_id: user.id,
              category: preset.category,
              label: preset.label,
              amount: 0,
            }))
          )
          .select("id, category, label, amount");

        if (seeded) rows = seeded;
        try {
          localStorage.setItem(seededKey(user.id), "1");
        } catch {
          // Ignore - worst case, presets get seeded again next load.
        }
      }

      setItems(
        rows.map((i) => ({
          id: i.id,
          category: i.category as TermBudgetCategory,
          label: i.label,
          amount: Number(i.amount),
        }))
      );
      setLoading(false);
    }

    load();
  }, [user, supabase]);

  const addCustomItem = useCallback(
    async (label: string, amount: number): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const { data, error } = await supabase
        .from("term_budget_items")
        .insert({ user_id: user.id, category: "custom", label, amount })
        .select("id, category, label, amount")
        .single();

      if (!error && data) {
        const newItem: TermBudgetItem = {
          id: data.id,
          category: data.category,
          label: data.label,
          amount: Number(data.amount),
        };
        setItems((prev) => [...prev, newItem]);
      }

      return { error: error?.message || null };
    },
    [user, supabase]
  );

  const updateItem = useCallback(
    async (id: string, changes: { label?: string; amount?: number }): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const { error } = await supabase
        .from("term_budget_items")
        .update(changes)
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
      }

      return { error: error?.message || null };
    },
    [user, supabase]
  );

  const removeItem = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!user) return { error: "Not logged in" };

      const { error } = await supabase.from("term_budget_items").delete().eq("id", id).eq("user_id", user.id);

      if (!error) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }

      return { error: error?.message || null };
    },
    [user, supabase]
  );

  return (
    <TermBudgetContext.Provider value={{ items, loading, addCustomItem, updateItem, removeItem }}>
      {children}
    </TermBudgetContext.Provider>
  );
}

export function useTermBudget() {
  const context = useContext(TermBudgetContext);
  if (!context) {
    throw new Error("useTermBudget must be used within a TermBudgetProvider");
  }
  return context;
}
