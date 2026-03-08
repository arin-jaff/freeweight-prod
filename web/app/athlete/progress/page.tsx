"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default function AthleteProgressPage() {
  const { user } = getAuthData();
  const queryClient = useQueryClient();
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState("");

  const { data: maxes, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => athleteApi.getProgress(),
  });

  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: () => athleteApi.getHistory(),
  });

  const updateMaxMutation = useMutation({
    mutationFn: ({ exercise, weight }: { exercise: string; weight: number }) =>
      athleteApi.updateMax(exercise, weight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      setEditingExercise(null);
      setNewWeight("");
    },
  });

  const handleUpdateMax = (exercise: string) => {
    const weight = parseFloat(newWeight);
    if (!isNaN(weight) && weight > 0) {
      updateMaxMutation.mutate({ exercise, weight });
    }
  };

  // Calculate stats from history
  const stats = {
    totalWorkouts: history?.filter((w) => w.is_completed).length || 0,
    thisWeek: history?.filter((w) => {
      if (!w.completed_at) return false;
      const completedDate = new Date(w.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedDate >= weekAgo;
    }).length || 0,
    flagged: history?.filter((w) => w.is_flagged).length || 0,
  };

  return (
    <AuthGuard requiredUserType="athlete">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="athlete" />

        <main className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-heading font-bold text-text mb-8">Progress</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="text-secondary text-sm mb-2">Total Workouts</div>
              <div className="text-4xl font-heading font-bold text-primary">{stats.totalWorkouts}</div>
            </div>

            <div className="card">
              <div className="text-secondary text-sm mb-2">This Week</div>
              <div className="text-4xl font-heading font-bold text-text">{stats.thisWeek}</div>
            </div>

            <div className="card">
              <div className="text-secondary text-sm mb-2">Flagged</div>
              <div className="text-4xl font-heading font-bold text-error">{stats.flagged}</div>
            </div>
          </div>

          {/* Current Maxes */}
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-4">Current Maxes</h2>

            {isLoading ? (
              <div className="card">
                <p className="text-secondary">Loading...</p>
              </div>
            ) : maxes && maxes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maxes.map((max) => (
                  <div key={max.id} className="card">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-heading font-bold text-text capitalize">
                          {max.exercise_name}
                        </h3>
                        <p className="text-secondary text-sm">Updated {formatDate(max.updated_at || max.recorded_at)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingExercise(max.exercise_name);
                          setNewWeight(max.max_weight.toString());
                        }}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>

                    {editingExercise === max.exercise_name ? (
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="input-field"
                          placeholder="New max weight"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingExercise(null);
                              setNewWeight("");
                            }}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateMax(max.exercise_name)}
                            disabled={updateMaxMutation.isPending}
                            className="btn-primary flex-1"
                          >
                            {updateMaxMutation.isPending ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl font-heading font-bold text-primary">
                        {max.max_weight} <span className="text-2xl text-secondary">{max.unit}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <h3 className="text-xl font-heading font-bold text-text mb-2">No Maxes Recorded</h3>
                <p className="text-secondary">Add your strength maxes to get personalized training</p>
              </div>
            )}
          </section>

          {/* Workout History */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-text mb-4">Recent Workouts</h2>

            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 10).map((workout) => (
                  <div
                    key={workout.id}
                    className={`card ${workout.is_flagged ? "border-error/40" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text mb-1">{workout.workout_name}</h3>
                        <p className="text-secondary text-sm">
                          {workout.completed_at ? formatDate(workout.completed_at) : "Not completed"}
                        </p>
                        {workout.notes && (
                          <p className="text-text text-sm mt-2">{workout.notes}</p>
                        )}
                        {workout.is_flagged && workout.flag_reason && (
                          <p className="text-error text-sm mt-2">
                            <span className="font-medium">Flagged:</span> {workout.flag_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {workout.is_completed && (
                          <span className="text-primary text-sm font-medium">Completed</span>
                        )}
                        {workout.has_modifications && (
                          <span className="text-secondary text-xs">Modified</span>
                        )}
                        {workout.is_flagged && <span className="text-error text-sm font-medium">Flagged</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-secondary">No workout history yet</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
