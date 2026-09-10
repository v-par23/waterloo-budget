"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { spots as allSpots } from "@/data/spots";

interface Member {
  user_id: string;
  profiles?: {
    name: string | null;
    email: string;
  };
}

interface Expense {
  id: string;
  spot_id: string | null;
  description: string;
  amount: number;
  paid_by: string;
  created_at: string;
}

interface Split {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  settled: boolean;
}

interface TeamExpensesProps {
  teamId: string;
  teamName: string;
  members: Member[];
}

function displayName(member: Member | undefined, fallbackId: string): string {
  return member?.profiles?.name || member?.profiles?.email || `User ${fallbackId.slice(0, 8)}`;
}

// Builds a mailto: reminder — this only opens the sender's own email client with a
// pre-filled message. It never moves money itself; real e-Transfers can only be sent
// from within someone's own banking app, and Interac has no public API for that.
function buildReminderMailto(
  toEmail: string,
  payerEmail: string,
  payerName: string,
  amount: number,
  description: string,
  teamName: string
): string {
  const subject = `You owe $${amount.toFixed(2)} for ${description}`;
  const body = [
    `Hey!`,
    ``,
    `Just a reminder — you owe $${amount.toFixed(2)} for "${description}" from our ${teamName} group on WaterlooBudget.`,
    ``,
    `You can e-Transfer it to ${payerEmail}.`,
    ``,
    `Thanks!`,
    `${payerName}`,
  ].join("\n");
  return `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function TeamExpenses({ teamId, teamName, members }: TeamExpensesProps) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const memberByUserId = useMemo(() => new Map(members.map((m) => [m.user_id, m])), [members]);

  useEffect(() => {
    async function fetchExpenses() {
      const { data: expensesData } = await supabase
        .from("team_expenses")
        .select("id, spot_id, description, amount, paid_by, created_at")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (expensesData) {
        setExpenses(expensesData);

        const expenseIds = expensesData.map((e) => e.id);
        if (expenseIds.length > 0) {
          const { data: splitsData } = await supabase
            .from("team_expense_splits")
            .select("id, expense_id, user_id, amount, settled")
            .in("expense_id", expenseIds);

          if (splitsData) setSplits(splitsData);
        }
      }
      setLoading(false);
    }

    fetchExpenses();
  }, [teamId, supabase]);

  const handleAddExpense = (expense: Expense, newSplits: Split[]) => {
    setExpenses((prev) => [expense, ...prev]);
    setSplits((prev) => [...prev, ...newSplits]);
    setShowModal(false);
  };

  const markSettled = async (splitId: string) => {
    const { error } = await supabase
      .from("team_expense_splits")
      .update({ settled: true, settled_at: new Date().toISOString() })
      .eq("id", splitId);

    if (!error) {
      setSplits((prev) => prev.map((s) => (s.id === splitId ? { ...s, settled: true } : s)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Group Expenses</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Split a bill
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">No expenses split yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Split your first bill
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const expenseSplits = splits.filter((s) => s.expense_id === expense.id);
            const spot = expense.spot_id ? allSpots.find((s) => s.id === expense.spot_id) : undefined;
            const payer = memberByUserId.get(expense.paid_by);
            const isPayer = user?.id === expense.paid_by;

            return (
              <div key={expense.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {spot && <span className="text-lg">{spot.emoji}</span>}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                      <p className="text-xs text-gray-400">
                        Paid by {displayName(payer, expense.paid_by)} ·{" "}
                        {new Date(expense.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    ${expense.amount.toFixed(2)}
                  </span>
                </div>

                {expenseSplits.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {expenseSplits.map((split) => {
                      const participant = memberByUserId.get(split.user_id);
                      const isSelf = user?.id === split.user_id;
                      const reminderHref =
                        payer && payer.profiles?.email
                          ? buildReminderMailto(
                              participant?.profiles?.email || "",
                              payer.profiles.email,
                              displayName(payer, expense.paid_by),
                              split.amount,
                              expense.description,
                              teamName
                            )
                          : undefined;

                      return (
                        <div key={split.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-600 truncate">
                            {displayName(participant, split.user_id)}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-gray-900 font-medium">${split.amount.toFixed(2)}</span>
                            {split.settled ? (
                              <span className="text-xs text-emerald-600">✓ Settled</span>
                            ) : isSelf ? (
                              <button
                                onClick={() => markSettled(split.id)}
                                className="text-xs text-[#1D9E75] hover:underline"
                              >
                                Mark as paid
                              </button>
                            ) : isPayer ? (
                              <>
                                {reminderHref && (
                                  <a
                                    href={reminderHref}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Remind
                                  </a>
                                )}
                                <button
                                  onClick={() => markSettled(split.id)}
                                  className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                  Mark received
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Unpaid</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && user && (
        <SplitBillModal
          teamId={teamId}
          currentUserId={user.id}
          members={members}
          onClose={() => setShowModal(false)}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
}

function SplitBillModal({
  teamId,
  currentUserId,
  members,
  onClose,
  onAdd,
}: {
  teamId: string;
  currentUserId: string;
  members: Member[];
  onClose: () => void;
  onAdd: (expense: Expense, splits: Split[]) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [description, setDescription] = useState("");
  const [spotQuery, setSpotQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [participantIds, setParticipantIds] = useState<Set<string>>(
    () => new Set(members.map((m) => m.user_id))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedSpot = useMemo(
    () => allSpots.find((s) => s.name.toLowerCase() === spotQuery.trim().toLowerCase()),
    [spotQuery]
  );

  const toggleParticipant = (userId: string) => {
    setParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError("Enter what this expense was for.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (participantIds.size === 0) {
      setError("Select at least one participant.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data: expenseData, error: expenseError } = await supabase
      .from("team_expenses")
      .insert({
        team_id: teamId,
        spot_id: matchedSpot?.id ?? null,
        description: description.trim(),
        amount: parsedAmount,
        paid_by: currentUserId,
      })
      .select("id, spot_id, description, amount, paid_by, created_at")
      .single();

    if (expenseError || !expenseData) {
      setError(expenseError?.message || "Failed to create expense.");
      setSubmitting(false);
      return;
    }

    const shareAmount = Math.round((parsedAmount / participantIds.size) * 100) / 100;
    const owingParticipants = [...participantIds].filter((id) => id !== currentUserId);

    let newSplits: Split[] = [];
    if (owingParticipants.length > 0) {
      const { data: splitsData, error: splitsError } = await supabase
        .from("team_expense_splits")
        .insert(
          owingParticipants.map((userId) => ({
            expense_id: expenseData.id,
            user_id: userId,
            amount: shareAmount,
          }))
        )
        .select("id, expense_id, user_id, amount, settled");

      if (splitsError) {
        setError(splitsError.message);
        setSubmitting(false);
        return;
      }
      newSplits = splitsData || [];
    }

    setSubmitting(false);
    onAdd(expenseData, newSplits);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Split a bill</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What was it for?</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner at Lazeez Shawarma"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link a spot (optional)</label>
          <input
            type="text"
            list="team-expense-spot-options"
            value={spotQuery}
            onChange={(e) => setSpotQuery(e.target.value)}
            placeholder="Search a spot..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <datalist id="team-expense-spot-options">
            {allSpots.map((s) => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Split between</label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {members.map((member) => (
              <label key={member.user_id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={participantIds.has(member.user_id)}
                  onChange={() => toggleParticipant(member.user_id)}
                  className="rounded border-gray-300"
                />
                {displayName(member, member.user_id)}
                {member.user_id === currentUserId && (
                  <span className="text-xs text-gray-400">(you)</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Split it"}
          </button>
        </div>
      </form>
    </div>
  );
}
