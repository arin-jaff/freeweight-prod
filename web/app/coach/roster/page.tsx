"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { coachApi } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";

export default function CoachRosterPage() {
  const { user } = getAuthData();

  const { data: roster, isLoading } = useQuery({
    queryKey: ["roster"],
    queryFn: () => coachApi.getRoster(),
  });

  return (
    <AuthGuard requiredUserType="coach">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="coach" />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text mb-2">Roster</h1>
              <p className="text-secondary">
                {roster?.length || 0} athlete{roster?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button className="btn-primary">Manage Groups</button>
          </div>

          {isLoading ? (
            <div className="card">
              <p className="text-secondary">Loading roster...</p>
            </div>
          ) : roster && roster.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roster.map((athlete) => (
                <Link
                  key={athlete.id}
                  href={`/coach/athletes/${athlete.id}`}
                  className="card hover:border-primary/40 transition-colors"
                >
                  <h3 className="text-xl font-heading font-bold text-text mb-2">
                    {athlete.name}
                  </h3>
                  <div className="space-y-1 text-sm mb-4">
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

                  {/* Maxes Preview */}
                  {athlete.maxes && athlete.maxes.length > 0 && (
                    <div className="border-t border-secondary/20 pt-3">
                      <p className="text-xs text-secondary mb-2 uppercase font-medium">
                        Current Maxes
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {athlete.maxes.slice(0, 4).map((max) => (
                          <div key={max.id} className="text-xs">
                            <span className="text-secondary capitalize">{max.exercise_name}:</span>{" "}
                            <span className="text-text font-semibold">
                              {max.max_weight} {max.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-primary text-sm font-medium">
                    View Details →
                  </div>
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
              <Link href="/coach/dashboard" className="btn-primary inline-block">
                Go to Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
