"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi } from "@/lib/api-endpoints";
import { getAuthData, authApi } from "@/lib/auth";

export default function AthleteProfilePage() {
  const { user } = getAuthData();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    sport: user?.sport || "",
    team: user?.team || "",
    training_goals: user?.training_goals || "",
  });

  const [showCoachChange, setShowCoachChange] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => athleteApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
      // Update localStorage
      if (user) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
  });

  const changeCoachMutation = useMutation({
    mutationFn: (code: string) => athleteApi.changeCoach(code),
    onSuccess: () => {
      setShowCoachChange(false);
      setInviteCode("");
      alert("Coach changed successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Failed to change coach. Please check the invite code.");
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleChangeCoach = () => {
    if (inviteCode.trim().length === 6) {
      changeCoachMutation.mutate(inviteCode.toUpperCase());
    } else {
      alert("Please enter a valid 6-character invite code");
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  return (
    <AuthGuard requiredUserType="athlete">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="athlete" />

        <main className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-heading font-bold text-text mb-8">Profile</h1>

          {/* User Info Card */}
          <div className="card mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text mb-2">{user?.name}</h2>
                <p className="text-secondary">{user?.email}</p>
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-secondary">
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Sport</label>
                  <input
                    type="text"
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="input-field"
                    placeholder="Football, Basketball, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Team</label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="input-field"
                    placeholder="Your team or organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Training Goals</label>
                  <textarea
                    value={formData.training_goals}
                    onChange={(e) => setFormData({ ...formData, training_goals: e.target.value })}
                    className="input-field min-h-[100px]"
                    placeholder="What are you working towards?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        sport: user?.sport || "",
                        team: user?.team || "",
                        training_goals: user?.training_goals || "",
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-6 border-t border-secondary/20 pt-4">
                {user?.sport && (
                  <div>
                    <p className="text-secondary text-sm">Sport</p>
                    <p className="text-text">{user.sport}</p>
                  </div>
                )}
                {user?.team && (
                  <div>
                    <p className="text-secondary text-sm">Team</p>
                    <p className="text-text">{user.team}</p>
                  </div>
                )}
                {user?.training_goals && (
                  <div>
                    <p className="text-secondary text-sm">Training Goals</p>
                    <p className="text-text">{user.training_goals}</p>
                  </div>
                )}
                {!user?.sport && !user?.team && !user?.training_goals && (
                  <p className="text-secondary text-sm italic">
                    No profile information yet. Click &quot;Edit Profile&quot; to add details.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Coach Section */}
          <div className="card mb-6">
            <h3 className="text-xl font-heading font-bold text-text mb-4">Coach</h3>

            {showCoachChange ? (
              <div className="space-y-4">
                <p className="text-secondary text-sm">
                  Enter your new coach&apos;s invite code. This will remove your current coach and their program
                  assignments.
                </p>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="input-field uppercase"
                  placeholder="ABC123"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCoachChange(false);
                      setInviteCode("");
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangeCoach}
                    disabled={changeCoachMutation.isPending || inviteCode.length !== 6}
                    className="btn-primary flex-1"
                  >
                    {changeCoachMutation.isPending ? "Changing..." : "Change Coach"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-secondary text-sm mb-4">
                  Your coach assigns programs and monitors your progress
                </p>
                <button onClick={() => setShowCoachChange(true)} className="btn-secondary">
                  Change Coach
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="card border-error/40">
            <h3 className="text-xl font-heading font-bold text-text mb-4">Account</h3>
            <button onClick={handleLogout} className="bg-error text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Log Out
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
