"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { coachApi } from "@/lib/api-endpoints";
import { getAuthData, saveAuthData, authApi } from "@/lib/auth";

export default function CoachProfilePage() {
  const { user, token } = getAuthData();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    sport: user?.sport || "",
    team: user?.team || "",
    coaching_credentials: user?.coaching_credentials || "",
    bio: user?.bio || "",
  });

  const [photoUploading, setPhotoUploading] = useState(false);

  // Get dashboard data for stats
  const { data: dashboard } = useQuery({
    queryKey: ["coachDashboard"],
    queryFn: () => coachApi.getDashboard(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await authApi.updateMe(data);
      return response;
    },
    onSuccess: async () => {
      setIsEditing(false);
      // Refresh user data from server
      const updatedUser = await authApi.getMe();
      if (token) {
        saveAuthData(token, updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Update local user data with new photo
      const updatedUser = await authApi.getMe();
      if (token) {
        saveAuthData(token, updatedUser);
      }
      // Force re-render
      window.location.reload();
    } catch (err: any) {
      alert("Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  const copyInviteCode = () => {
    if (user?.invite_code) {
      navigator.clipboard.writeText(user.invite_code);
      alert("Invite code copied to clipboard!");
    }
  };

  return (
    <AuthGuard requiredUserType="coach">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="coach" profilePhoto={user?.profile_photo_url} />

        <main className="max-w-4xl mx-auto px-4 py-8">

          {/* ── Profile Header ── */}
          <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Photo */}
              <div className="relative group">
                {user?.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover border-3 border-primary/40"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-3 border-primary/40">
                    {(user?.name || "C").charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-white text-xs font-medium">
                    {photoUploading ? "..." : "Change"}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-text">{user?.name}</h1>
                    <p className="text-secondary text-sm mt-0.5">{user?.email}</p>
                    {(user?.sport || user?.team) && (
                      <p className="text-secondary text-sm mt-1">
                        {user?.sport}{user?.sport && user?.team ? " — " : ""}{user?.team}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Quick stats row */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-secondary/15">
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Athletes</p>
                    <p className="text-text font-medium">{dashboard?.total_athletes || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Completed Today</p>
                    <p className="text-text font-medium">{dashboard?.completed_today || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Flagged</p>
                    <p className="text-text font-medium">{dashboard?.flagged_workouts || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Edit Form ── */}
          {isEditing && (
            <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-6 mb-6">
              <h2 className="text-xl font-heading font-bold text-text mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-text mb-2">Team / Organization</label>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      className="input-field"
                      placeholder="Your team or organization"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Coaching Credentials</label>
                  <textarea
                    value={formData.coaching_credentials}
                    onChange={(e) => setFormData({ ...formData, coaching_credentials: e.target.value })}
                    className="input-field min-h-[80px]"
                    placeholder="CSCS, USATF Level 1, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input-field min-h-[100px]"
                    placeholder="Tell athletes about your coaching philosophy and experience..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        sport: user?.sport || "",
                        team: user?.team || "",
                        coaching_credentials: user?.coaching_credentials || "",
                        bio: user?.bio || "",
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
            </div>
          )}

          {/* ── Bio ── */}
          {!isEditing && user?.bio && (
            <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-6 mb-6">
              <h2 className="text-xl font-heading font-bold text-text mb-3">About</h2>
              <p className="text-secondary whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {/* ── Credentials ── */}
          {!isEditing && user?.coaching_credentials && (
            <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-6 mb-6">
              <h2 className="text-xl font-heading font-bold text-text mb-3">Credentials</h2>
              <p className="text-secondary whitespace-pre-wrap">{user.coaching_credentials}</p>
            </div>
          )}

          {/* ── Invite Code ── */}
          <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-6 mb-6">
            <h2 className="text-xl font-heading font-bold text-text mb-4">Invite Code</h2>
            <p className="text-secondary text-sm mb-4">
              Share this code with athletes to add them to your roster.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-background border-2 border-primary rounded-lg px-6 py-4">
                <div className="text-3xl font-heading font-bold text-primary tracking-wider text-center">
                  {user?.invite_code || "------"}
                </div>
              </div>
              <button
                onClick={copyInviteCode}
                className="btn-secondary whitespace-nowrap"
                disabled={!user?.invite_code}
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* ── Account ── */}
          <div className="bg-[#1F2937] rounded-xl border border-error/20 p-6">
            <h2 className="text-xl font-heading font-bold text-text mb-4">Account</h2>
            <button onClick={handleLogout} className="bg-error text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm">
              Log Out
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
