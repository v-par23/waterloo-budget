"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { spots as allSpots } from "@/data/spots";
import { SpotCard } from "@/components/ui/SpotCard";
import { TeamExpenses } from "@/components/features/TeamExpenses";

interface Team {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profiles?: {
    name: string | null;
    email: string;
  };
}

interface TeamSpot {
  id: string;
  spot_id: string;
  added_by: string;
  note: string | null;
  created_at: string;
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamSpots, setTeamSpots] = useState<TeamSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeamData() {
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

      if (teamError || !teamData) {
        setLoading(false);
        return;
      }

      setTeam(teamData);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("id, user_id, role, joined_at")
        .eq("team_id", id);

      console.log("Members query result:", { membersData, membersError });

      if (membersData && membersData.length > 0) {
        // Fetch profiles for each member
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);

        console.log("Profiles data:", { profilesData, profilesError, userIds });

        // Combine members with their profiles
        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profiles: profilesData?.find(p => p.id === member.user_id) || null
        }));

        console.log("Members with profiles:", membersWithProfiles);

        setMembers(membersWithProfiles as TeamMember[]);
      }

      // Fetch team spots
      const { data: spotsData } = await supabase
        .from("team_spots")
        .select("*")
        .eq("team_id", id)
        .order("created_at", { ascending: false });

      if (spotsData) {
        setTeamSpots(spotsData);
      }

      setLoading(false);
    }

    fetchTeamData();
  }, [user, id, supabase]);

  const spotsInTeam = useMemo(() => {
    const spotIds = new Set(teamSpots.map((ts) => ts.spot_id));
    return allSpots.filter((spot) => spotIds.has(spot.id));
  }, [teamSpots]);

  const copyInviteCode = async () => {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard failed - code is already visible, user can select it manually
    }
  };

  const handleAddSpot = async (spotId: string) => {
    if (!user || !team) return;

    const { error } = await supabase.from("team_spots").insert({
      team_id: team.id,
      spot_id: spotId,
      added_by: user.id,
    });

    if (!error) {
      setTeamSpots((prev) => [
        { id: crypto.randomUUID(), spot_id: spotId, added_by: user.id, note: null, created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setShowAddSpotModal(false);
  };

  const handleRemoveSpot = async (spotId: string) => {
    if (!team) return;

    const { error } = await supabase
      .from("team_spots")
      .delete()
      .eq("team_id", team.id)
      .eq("spot_id", spotId);

    if (!error) {
      setTeamSpots((prev) => prev.filter((ts) => ts.spot_id !== spotId));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="receipt-card p-8 text-center">
          <p className="text-ink/70 mb-4">Sign in to view teams</p>
          <Link href="/login" className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <div className="receipt-card p-8 text-center">
          <p className="text-ink/70 mb-4">Team not found or you don&apos;t have access</p>
          <Link href="/teams" className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
            Back to Teams
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
        <div className="flex items-start justify-between mt-2 gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">{team.name}</h1>
            {team.description && (
              <p className="text-ink/70 mt-1">{team.description}</p>
            )}
          </div>
          <button onClick={copyInviteCode} className="receipt-btn w-auto px-4 flex-shrink-0">
            <span className="tracking-widest">{team.invite_code}</span>
            {copiedCode ? (
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="receipt-divider" />

      {/* Members */}
      <div className="receipt-card p-6">
        <h2 className="font-bold uppercase tracking-wide text-ink mb-4">
          Members ({members.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => {
            const displayName = member.profiles?.name || member.profiles?.email || `User ${member.user_id.slice(0, 8)}`;
            return (
              <div key={member.id} className="flex items-center gap-2 border border-dashed border-ink/40 px-3 py-2">
                <div className="w-8 h-8 border-1.5 border-ink flex items-center justify-center text-sm font-bold text-ink" style={{ borderWidth: "1.5px", borderStyle: "solid" }}>
                  {displayName[0].toUpperCase()}
                </div>
                <span className="text-sm text-ink">
                  {displayName}
                </span>
                {member.role === "owner" && (
                  <span className="text-[9px] font-bold uppercase tracking-wide bg-ink text-cream px-2 py-0.5">Owner</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Expenses */}
      <TeamExpenses teamId={team.id} teamName={team.name} members={members} />

      {/* Team Spots */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold uppercase tracking-wide text-ink">
            Team Spots ({spotsInTeam.length})
          </h2>
          <button onClick={() => setShowAddSpotModal(true)} className="receipt-btn w-auto px-4 !bg-ink !text-cream">
            Add Spot
          </button>
        </div>

        {spotsInTeam.length === 0 ? (
          <div className="receipt-card p-8 text-center">
            <p className="text-ink/70 mb-4">No spots added yet</p>
            <button onClick={() => setShowAddSpotModal(true)} className="receipt-btn inline-flex w-auto px-4 !bg-ink !text-cream">
              Add First Spot
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spotsInTeam.map((spot) => (
              <div key={spot.id} className="relative group">
                <SpotCard spot={spot} showSaveButton={false} />
                <button
                  onClick={() => handleRemoveSpot(spot.id)}
                  className="absolute -top-3 left-4 receipt-tag !bg-cream opacity-0 group-hover:opacity-100 hover:!text-accent transition-opacity z-10"
                  title="Remove from team"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Spot Modal */}
      {showAddSpotModal && (
        <AddSpotModal
          onClose={() => setShowAddSpotModal(false)}
          onAdd={handleAddSpot}
          existingSpotIds={new Set(teamSpots.map((ts) => ts.spot_id))}
        />
      )}
    </div>
  );
}

function AddSpotModal({
  onClose,
  onAdd,
  existingSpotIds,
}: {
  onClose: () => void;
  onAdd: (spotId: string) => void;
  existingSpotIds: Set<string>;
}) {
  const [search, setSearch] = useState("");

  const filteredSpots = useMemo(() => {
    const available = allSpots.filter((s) => !existingSpotIds.has(s.id));
    if (!search) return available.slice(0, 20);
    const query = search.toLowerCase();
    return available
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.neighborhood.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [search, existingSpotIds]);

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
      <div className="receipt-card w-full max-w-lg max-h-[80vh] flex flex-col !shadow-[8px_8px_0_#1B1A17]">
        <div className="p-4 border-b-2 border-ink">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide">Add a Spot</h2>
            <button onClick={onClose} className="p-1 hover:text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="SEARCH SPOTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-1 py-2 bg-transparent border-0 border-b-2 border-ink text-sm uppercase tracking-wide placeholder:text-ink/50 focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => onAdd(spot.id)}
              className="w-full text-left p-3 border border-dashed border-ink/0 hover:border-ink/30 flex items-center gap-3 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink truncate">{spot.name}</div>
                <div className="text-sm text-ink/50">{spot.neighborhood}</div>
              </div>
              <span className="text-sm font-bold text-accent">{spot.price}</span>
            </button>
          ))}
          {filteredSpots.length === 0 && (
            <p className="text-center text-ink/50 py-8">No spots found</p>
          )}
        </div>
      </div>
    </div>
  );
}
