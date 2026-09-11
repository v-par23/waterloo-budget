"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface Team {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  member_count?: number;
  spot_count?: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeams() {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get teams where user is a member
      const { data: memberData, error } = await supabase
        .from("team_members")
        .select(`
          team_id,
          teams (
            id,
            name,
            description,
            invite_code,
            created_by
          )
        `)
        .eq("user_id", user.id);

      if (!error && memberData) {
        const teamsList = memberData
          .map((m) => {
            const teams = m.teams;
            return Array.isArray(teams) ? teams[0] : teams;
          })
          .filter(Boolean) as Team[];
        setTeams(teamsList);
      }
      setLoading(false);
    }

    fetchTeams();
  }, [user, supabase]);

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;

    setJoining(true);
    setJoinError(null);

    // Find team by invite code
    const { data: team, error: findError } = await supabase
      .from("teams")
      .select("id")
      .eq("invite_code", joinCode.trim().toUpperCase())
      .single();

    if (findError || !team) {
      setJoinError("Invalid invite code. Please check and try again.");
      setJoining(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      setJoinError("You're already a member of this team.");
      setJoining(false);
      return;
    }

    // Join team
    const { error: joinError } = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "member",
    });

    if (joinError) {
      setJoinError("Failed to join team. Please try again.");
      setJoining(false);
      return;
    }

    // Refresh teams list
    setShowJoinModal(false);
    setJoinCode("");
    window.location.reload();
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">My Teams</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">My Teams</h1>
        </div>
        <div className="receipt-card p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-ink/70 mb-4">Sign in to create and join teams</p>
          <Link href="/login" className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">My Teams</h1>
          <p className="text-sm sm:text-base text-ink/70">
            Create teams to share and save spots with friends
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoinModal(true)} className="receipt-btn w-auto px-3 sm:px-4">
            Join Team
          </button>
          <Link href="/teams/create" className="receipt-btn w-auto px-3 sm:px-4 !bg-ink !text-cream">
            Create Team
          </Link>
        </div>
      </div>

      <div className="receipt-divider" />

      {teams.length === 0 ? (
        <div className="receipt-card p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-ink/70 mb-4">You&apos;re not part of any teams yet</p>
          <p className="text-xs sm:text-sm text-ink/50 mb-4">
            Create a team to share favorite spots with friends, or join an existing team with an invite code
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button onClick={() => setShowJoinModal(true)} className="receipt-btn w-auto px-4">
              Join with Code
            </button>
            <Link href="/teams/create" className="receipt-btn w-auto px-4 !bg-ink !text-cream">
              Create Team
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="receipt-card p-4 sm:p-6 block hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
              <h3 className="font-bold text-ink text-base sm:text-lg">{team.name}</h3>
              {team.description && (
                <p className="text-xs sm:text-sm text-ink/60 mt-1 line-clamp-2">
                  {team.description}
                </p>
              )}
              <div className="mt-3 sm:mt-4 flex items-center gap-4 text-[11px] uppercase tracking-wide text-ink/40">
                <span>Code: {team.invite_code}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="receipt-card p-6 w-full max-w-md !shadow-[8px_8px_0_#1B1A17]">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Join a Team</h2>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              {joinError && (
                <div className="border border-dashed border-accent text-accent px-4 py-3 text-sm">
                  {joinError}
                </div>
              )}
              <div>
                <label htmlFor="inviteCode" className="block text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ENTER 6-CHARACTER CODE"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-transparent border-0 border-b-2 border-ink focus:outline-none uppercase tracking-widest text-center text-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode("");
                    setJoinError(null);
                  }}
                  className="receipt-btn flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={joining || joinCode.length < 6} className="receipt-btn flex-1 !bg-ink !text-cream disabled:opacity-50">
                  {joining ? "Joining..." : "Join Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
