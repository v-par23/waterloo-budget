"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function CreateTeamPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setLoading(true);
    setError(null);

    const inviteCode = generateInviteCode();

    // Create team
    const { data: team, error: createError } = await supabase
      .from("teams")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError || !team) {
      console.error("Team creation error:", createError);
      setError(createError?.message || "Failed to create team. Please try again.");
      setLoading(false);
      return;
    }

    // Add creator as owner
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      console.error("Team member error:", memberError);
      // Rollback team creation
      await supabase.from("teams").delete().eq("id", team.id);
      setError(memberError?.message || "Failed to create team. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/teams/${team.id}`);
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Create a Team</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Create a Team</h1>
        <div className="receipt-card p-8 text-center">
          <p className="text-ink/70 mb-4">Sign in to create a team</p>
          <Link href="/login" className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/teams" className="text-[11px] font-bold uppercase tracking-wide text-ink/50 hover:text-ink">
          ← Back to Teams
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-ink mt-2">Create a Team</h1>
        <p className="text-ink/70 mt-1">
          Create a team to share and save spots with friends
        </p>
      </div>

      <div className="receipt-divider" />

      <form onSubmit={handleSubmit} className="receipt-card p-6 space-y-5 max-w-xl">
        {error && (
          <div className="border border-dashed border-accent text-accent px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">
            Team Name <span className="text-accent">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., UW Coffee Crew"
            className="w-full px-1 py-2 bg-transparent border-0 border-b-2 border-ink text-sm focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this team about?"
            className="w-full px-3 py-2 border border-ink/40 focus:outline-none focus:border-ink resize-none bg-transparent text-sm"
          />
        </div>

        <button type="submit" disabled={loading || !name.trim()} className="receipt-btn !bg-ink !text-cream disabled:opacity-50">
          {loading ? "Creating..." : "Create Team"}
        </button>
      </form>
    </div>
  );
}
