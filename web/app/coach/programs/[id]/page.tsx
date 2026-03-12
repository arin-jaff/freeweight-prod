"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { programApi } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = getAuthData();
  const queryClient = useQueryClient();
  const programId = parseInt(params.id as string);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignAthleteId, setAssignAthleteId] = useState("");

  const { data: program, isLoading } = useQuery({
    queryKey: ["program", programId],
    queryFn: () => programApi.get(programId),
  });

  const archiveMutation = useMutation({
    mutationFn: () => programApi.archive(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program", programId] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      router.push("/coach/programs");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => programApi.restore(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program", programId] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });

  if (isLoading) {
    return (
      <AuthGuard requiredUserType="coach">
        <div className="min-h-screen bg-background">
          <NavBar userName={user?.name || ""} userType="coach" profilePhoto={user?.profile_photo_url} />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="card">
              <p className="text-secondary">Loading program...</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  if (!program) {
    return (
      <AuthGuard requiredUserType="coach">
        <div className="min-h-screen bg-background">
          <NavBar userName={user?.name || ""} userType="coach" profilePhoto={user?.profile_photo_url} />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="card text-center py-12">
              <h3 className="text-xl font-heading font-bold text-text mb-2">
                Program Not Found
              </h3>
              <p className="text-secondary mb-6">
                This program doesn't exist or you don't have access to it.
              </p>
              <Link href="/coach/programs" className="btn-primary inline-block">
                Back to Programs
              </Link>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Sort workouts by day offset
  const sortedWorkouts = [...(program.workouts || [])].sort(
    (a, b) => (a.day_offset || 0) - (b.day_offset || 0)
  );

  return (
    <AuthGuard requiredUserType="coach">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="coach" />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/coach/programs"
                className="text-primary hover:underline text-sm"
              >
                ← Back to Programs
              </Link>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-heading font-bold text-text">
                    {program.name}
                  </h1>
                  {program.archived && (
                    <span className="text-sm bg-secondary/20 text-secondary px-3 py-1 rounded">
                      Archived
                    </span>
                  )}
                </div>
                {program.description && (
                  <p className="text-secondary mb-2">{program.description}</p>
                )}
                <p className="text-secondary text-sm">
                  Created {formatDate(program.created_at)} • {sortedWorkouts.length}{" "}
                  workout{sortedWorkouts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex gap-3">
                {program.archived ? (
                  <button
                    onClick={() => restoreMutation.mutate()}
                    className="btn-secondary"
                    disabled={restoreMutation.isPending}
                  >
                    {restoreMutation.isPending ? "Restoring..." : "Restore"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="btn-primary"
                    >
                      Assign to Athletes
                    </button>
                    <Link
                      href={`/coach/programs/${programId}/edit`}
                      className="btn-secondary"
                    >
                      Edit Program
                    </Link>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to archive this program? Athletes will no longer have access to it."
                          )
                        ) {
                          archiveMutation.mutate();
                        }
                      }}
                      className="btn-secondary text-error"
                      disabled={archiveMutation.isPending}
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Workouts List */}
          {sortedWorkouts.length > 0 ? (
            <div className="space-y-4">
              {sortedWorkouts.map((workout) => (
                <div key={workout.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          Day {(workout.day_offset || 0) + 1}
                        </span>
                        <h3 className="text-xl font-heading font-bold text-text">
                          {workout.name}
                        </h3>
                      </div>
                      <p className="text-secondary text-sm">
                        {workout.exercises?.length || 0} exercise
                        {workout.exercises?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Exercises */}
                  {workout.exercises && workout.exercises.length > 0 ? (
                    <div className="space-y-2">
                      {workout.exercises
                        .sort((a, b) => a.order - b.order)
                        .map((exercise, idx) => (
                          <div
                            key={exercise.id}
                            className="bg-background rounded-lg p-4 border border-secondary/10"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-secondary text-sm font-medium mt-1">
                                {idx + 1}.
                              </span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-text mb-1">
                                  {exercise.name}
                                </h4>
                                <div className="flex gap-4 text-sm text-secondary">
                                  <span>
                                    {exercise.sets} × {exercise.reps} reps
                                  </span>
                                  {exercise.percentage_of_max && (
                                    <span>
                                      @ {exercise.percentage_of_max}%
                                      {exercise.target_exercise &&
                                        ` of ${exercise.target_exercise}`}
                                    </span>
                                  )}
                                </div>
                                {exercise.coach_notes && (
                                  <p className="text-sm text-secondary mt-2 italic">
                                    Note: {exercise.coach_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-secondary text-sm">No exercises added yet</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <h3 className="text-xl font-heading font-bold text-text mb-2">
                No Workouts Yet
              </h3>
              <p className="text-secondary mb-6">
                Add workouts to this program to get started
              </p>
              {!program.archived && (
                <Link
                  href={`/coach/programs/${programId}/edit`}
                  className="btn-primary inline-block"
                >
                  Add Workouts
                </Link>
              )}
            </div>
          )}
        </main>

        {/* Assign Modal - Placeholder */}
        {showAssignModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAssignModal(false)}
          >
            <div
              className="bg-[#1F2937] rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-heading font-bold text-text mb-4">
                Assign Program
              </h2>
              <p className="text-secondary text-sm mb-4">
                This feature is coming soon. You'll be able to assign programs to
                individual athletes or groups.
              </p>
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn-primary w-full"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
