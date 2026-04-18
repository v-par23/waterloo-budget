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
          .map((m: any) => m.teams)
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
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">👥 My Teams</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">👥 My Teams</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Sign in to create and join teams</p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">👥 My Teams</h1>
          <p className="text-gray-600">
            Create teams to share and save spots with friends
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Join Team
          </button>
          <Link
            href="/teams/create"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Team
          </Link>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">You&apos;re not part of any teams yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Create a team to share favorite spots with friends, or join an existing team with an invite code
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Join with Code
            </button>
            <Link
              href="/teams/create"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Team
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
              {team.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {team.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>Code: {team.invite_code}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Join a Team</h2>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              {joinError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {joinError}
                </div>
              )}
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 uppercase tracking-widest text-center text-lg font-mono"
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
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining || joinCode.length < 6}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
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
