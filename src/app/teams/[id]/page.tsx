"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { spots as allSpots } from "@/data/spots";
import { SpotCard } from "@/components/ui/SpotCard";

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Sign in to view teams</p>
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

  if (!team) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Team not found or you don&apos;t have access</p>
          <Link
            href="/teams"
            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/teams" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back to Teams
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="text-gray-600 mt-1">{team.description}</p>
            )}
          </div>
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-mono font-medium">{team.invite_code}</span>
            {copiedCode ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Members ({members.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => {
            const displayName = member.profiles?.name || member.profiles?.email || `User ${member.user_id.slice(0, 8)}`;
            return (
              <div
                key={member.id}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {displayName[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">
                  {displayName}
                </span>
                {member.role === "owner" && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Owner</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Spots */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Team Spots ({spotsInTeam.length})
          </h2>
          <button
            onClick={() => setShowAddSpotModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            Add Spot
          </button>
        </div>

        {spotsInTeam.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-4">No spots added yet</p>
            <button
              onClick={() => setShowAddSpotModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
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
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                  title="Remove from team"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add a Spot</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Search spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => onAdd(spot.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <span className="text-xl">{spot.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{spot.name}</div>
                <div className="text-sm text-gray-500">{spot.neighborhood}</div>
              </div>
              <span className="text-sm text-gray-400">{spot.price}</span>
            </button>
          ))}
          {filteredSpots.length === 0 && (
            <p className="text-center text-gray-500 py-8">No spots found</p>
          )}
        </div>
      </div>
    </div>
  );
}
