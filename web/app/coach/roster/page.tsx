"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import apiClient from "@/lib/api-client";
import { getAuthData } from "@/lib/auth";

interface Athlete {
  id: number;
  name: string;
  email: string;
  sport?: string;
  team?: string;
  groups: Array<{ id: number; name: string }>;
  subgroups: Array<{ id: number; name: string; training_focus?: string }>;
}

interface Group {
  id: number;
  name: string;
  sport?: string;
  member_count: number;
  subgroups: Array<{
    id: number;
    name: string;
    training_focus?: string;
    member_count: number;
  }>;
}

export default function CoachRosterPage() {
  const { user } = getAuthData();
  const queryClient = useQueryClient();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSport, setNewGroupSport] = useState("");
  const [selectedView, setSelectedView] = useState<"all" | "groups">("all");

  const { data: roster } = useQuery({
    queryKey: ["roster"],
    queryFn: async () => {
      const response = await apiClient.get<{ athletes: Athlete[] }>("/api/coaches/roster");
      return response.data.athletes;
    },
  });

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get<Group[]>("/api/coaches/groups");
      return response.data;
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; sport?: string }) => {
      const response = await apiClient.post("/api/coaches/groups", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowGroupModal(false);
      setNewGroupName("");
      setNewGroupSport("");
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroupMutation.mutate({
        name: newGroupName,
        sport: newGroupSport || undefined,
      });
    }
  };

  return (
    <AuthGuard requiredUserType="coach">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="coach" profilePhoto={user?.profile_photo_url} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text mb-2">Roster</h1>
              <p className="text-secondary">
                {roster?.length || 0} athlete{roster?.length !== 1 ? "s" : ""}
                {groups && groups.length > 0 && ` · ${groups.length} group${groups.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button onClick={() => setShowGroupModal(true)} className="btn-primary">
              Create Group
            </button>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setSelectedView("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "all"
                  ? "bg-primary text-background"
                  : "bg-secondary/20 text-secondary hover:text-text"
              }`}
            >
              All Athletes
            </button>
            <button
              onClick={() => setSelectedView("groups")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === "groups"
                  ? "bg-primary text-background"
                  : "bg-secondary/20 text-secondary hover:text-text"
              }`}
            >
              By Group
            </button>
          </div>

          {/* All Athletes View */}
          {selectedView === "all" && (
            <>
              {roster && roster.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roster.map((athlete) => (
                    <Link key={athlete.id} href={`/coach/athletes/${athlete.id}`} className="card block hover:border-primary/40 transition-colors">
                      <h3 className="text-xl font-heading font-bold text-text mb-2">
                        {athlete.name}
                      </h3>
                      <div className="space-y-1 text-sm mb-3">
                        <p className="text-secondary text-xs">{athlete.email}</p>
                        {athlete.sport && (
                          <p className="text-secondary">
                            <span className="font-medium">Sport:</span> {athlete.sport}
                          </p>
                        )}
                        {athlete.team && (
                          <p className="text-secondary">
                            <span className="font-medium">Team:</span> {athlete.team}
                          </p>
                        )}
                      </div>

                      {/* Groups */}
                      {athlete.groups && athlete.groups.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {athlete.groups.map((group) => (
                            <span
                              key={group.id}
                              className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium"
                            >
                              {group.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <h3 className="text-xl font-heading font-bold text-text mb-2">
                    No Athletes Yet
                  </h3>
                  <p className="text-secondary mb-6">
                    Share your invite code to add athletes to your roster
                  </p>
                </div>
              )}
            </>
          )}

          {/* Groups View */}
          {selectedView === "groups" && (
            <div className="space-y-6">
              {groups && groups.length > 0 ? (
                groups.map((group) => {
                  const groupAthletes = roster?.filter((a) =>
                    a.groups.some((g) => g.id === group.id)
                  );

                  return (
                    <div key={group.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-2xl font-heading font-bold text-text">
                            {group.name}
                          </h2>
                          {group.sport && (
                            <p className="text-secondary text-sm mt-1">{group.sport}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                          {group.member_count} members
                        </span>
                      </div>

                      {groupAthletes && groupAthletes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupAthletes.map((athlete) => (
                            <Link
                              key={athlete.id}
                              href={`/coach/athletes/${athlete.id}`}
                              className="bg-background rounded-lg p-4 border border-secondary/10 block hover:border-primary/40 transition-colors"
                            >
                              <h4 className="font-semibold text-text mb-1">{athlete.name}</h4>
                              <p className="text-xs text-secondary">{athlete.email}</p>
                              {athlete.team && (
                                <p className="text-xs text-secondary mt-1">{athlete.team}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-secondary text-sm">No athletes in this group yet</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="card text-center py-12">
                  <h3 className="text-xl font-heading font-bold text-text mb-2">
                    No Groups Yet
                  </h3>
                  <p className="text-secondary mb-6">
                    Create groups to organize your athletes by team or training focus
                  </p>
                  <button onClick={() => setShowGroupModal(true)} className="btn-primary">
                    Create Your First Group
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Create Group Modal */}
        {showGroupModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowGroupModal(false)}
          >
            <div
              className="bg-[#1F2937] rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-heading font-bold text-text mb-4">
                Create New Group
              </h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-text mb-2">
                    Group Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g., Rowing Team, Varsity Squad"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="groupSport" className="block text-sm font-medium text-text mb-2">
                    Sport (Optional)
                  </label>
                  <input
                    id="groupSport"
                    type="text"
                    className="input-field"
                    placeholder="e.g., Rowing, Football, Track & Field"
                    value={newGroupSport}
                    onChange={(e) => setNewGroupSport(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={createGroupMutation.isPending}
                  >
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
