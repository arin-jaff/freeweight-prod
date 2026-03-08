"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";
import { calculateTargetWeight } from "@/lib/utils";

interface SetData {
  exercise_id: number;
  set_number: number;
  weight_used: number;
  reps_completed: number;
  rpe?: number;
  notes?: string;
}

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = parseInt(params.id as string);
  const { user } = getAuthData();
  const queryClient = useQueryClient();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<Record<string, SetData>>({});
  const [completionNotes, setCompletionNotes] = useState("");
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  // Get workout details
  const { data: workout, isLoading } = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: () => athleteApi.getWorkout(workoutId),
  });

  // Get athlete's maxes for weight calculations
  const { data: maxes } = useQuery({
    queryKey: ["progress"],
    queryFn: () => athleteApi.getProgress(),
  });

  // Start workout mutation
  const startWorkoutMutation = useMutation({
    mutationFn: () => athleteApi.startWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    },
  });

  // Log set mutation
  const logSetMutation = useMutation({
    mutationFn: (data: SetData) => athleteApi.logSet(workoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    },
  });

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: (notes?: string) => athleteApi.completeWorkout(workoutId, notes),
    onSuccess: () => {
      router.push("/athlete/home");
    },
  });

  // Flag workout mutation
  const flagWorkoutMutation = useMutation({
    mutationFn: (reason: string) => athleteApi.flagWorkout(workoutId, reason),
    onSuccess: () => {
      setShowFlagModal(false);
      router.push("/athlete/home");
    },
  });

  const currentExercise = workout?.exercises?.[currentExerciseIndex];
  const totalExercises = workout?.exercises?.length || 0;
  const progressPercent = totalExercises > 0 ? ((currentExerciseIndex + 1) / totalExercises) * 100 : 0;

  const getTargetWeight = (exercise: typeof currentExercise) => {
    if (!exercise || !exercise.percentage_of_max || !exercise.target_exercise || !maxes) {
      return null;
    }
    const max = maxes.find((m) => m.exercise_name.toLowerCase() === exercise.target_exercise?.toLowerCase());
    if (!max) return null;
    return calculateTargetWeight(max.max_weight, exercise.percentage_of_max);
  };

  const handleLogSet = (setNumber: number, weight: number, reps: number, rpe?: number) => {
    if (!currentExercise) return;

    const key = `${currentExercise.id}-${setNumber}`;
    const setData: SetData = {
      exercise_id: currentExercise.id,
      set_number: setNumber,
      weight_used: weight,
      reps_completed: reps,
      rpe,
    };

    setSetLogs((prev) => ({ ...prev, [key]: setData }));
    logSetMutation.mutate(setData);
  };

  const handleCompleteWorkout = () => {
    completeWorkoutMutation.mutate(completionNotes || undefined);
  };

  const handleFlagWorkout = () => {
    if (flagReason.trim()) {
      flagWorkoutMutation.mutate(flagReason);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredUserType="athlete">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-secondary">Loading workout...</p>
        </div>
      </AuthGuard>
    );
  }

  if (!workout) {
    return (
      <AuthGuard requiredUserType="athlete">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-error mb-4">Workout not found</p>
            <button onClick={() => router.push("/athlete/home")} className="btn-primary">
              Back to Home
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredUserType="athlete">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="athlete" />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-text mb-2">{workout.name}</h1>
                <p className="text-secondary">
                  Exercise {currentExerciseIndex + 1} of {totalExercises}
                </p>
              </div>
              <button
                onClick={() => setShowFlagModal(true)}
                className="text-error hover:underline text-sm font-medium"
              >
                Flag Workout
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary/20 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {currentExercise ? (
            <div className="space-y-6">
              {/* Exercise Card */}
              <div className="card">
                <h2 className="text-2xl font-heading font-bold text-text mb-4">
                  {currentExercise.name}
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-secondary text-sm">Prescribed</p>
                    <p className="text-text font-semibold">
                      {currentExercise.sets} sets × {currentExercise.reps} reps
                    </p>
                  </div>
                  {currentExercise.percentage_of_max && (
                    <div>
                      <p className="text-secondary text-sm">Target Weight</p>
                      <p className="text-primary font-semibold text-lg">
                        {getTargetWeight(currentExercise) || "N/A"} lbs
                        <span className="text-sm text-secondary ml-2">
                          ({Math.round(currentExercise.percentage_of_max * 100)}%)
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {currentExercise.coach_notes && (
                  <div className="bg-background rounded-lg p-4 mb-4">
                    <p className="text-secondary text-sm mb-1">Coach Notes:</p>
                    <p className="text-text">{currentExercise.coach_notes}</p>
                  </div>
                )}
              </div>

              {/* Set Logging */}
              <div className="card">
                <h3 className="text-xl font-heading font-bold text-text mb-4">Log Sets</h3>

                <div className="space-y-3">
                  {Array.from({ length: currentExercise.sets }, (_, i) => {
                    const setNumber = i + 1;
                    const key = `${currentExercise.id}-${setNumber}`;
                    const logged = setLogs[key];

                    return (
                      <SetLogRow
                        key={setNumber}
                        setNumber={setNumber}
                        prescribedReps={currentExercise.reps}
                        targetWeight={getTargetWeight(currentExercise)}
                        logged={logged}
                        onLog={handleLogSet}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                {currentExerciseIndex > 0 && (
                  <button
                    onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                    className="btn-secondary flex-1"
                  >
                    ← Previous Exercise
                  </button>
                )}

                {currentExerciseIndex < totalExercises - 1 ? (
                  <button
                    onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                    className="btn-primary flex-1"
                  >
                    Next Exercise →
                  </button>
                ) : (
                  <button onClick={handleCompleteWorkout} className="btn-primary flex-1">
                    Complete Workout
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-secondary">No exercises in this workout</p>
            </div>
          )}
        </main>

        {/* Flag Modal */}
        {showFlagModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1F2937] rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-heading font-bold text-text mb-4">Flag Workout</h3>
              <p className="text-secondary text-sm mb-4">
                Let your coach know if something didn&apos;t feel right
              </p>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe what happened..."
                className="input-field mb-4 min-h-[100px]"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowFlagModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleFlagWorkout}
                  disabled={!flagReason.trim()}
                  className="btn-primary flex-1"
                >
                  Submit Flag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function SetLogRow({
  setNumber,
  prescribedReps,
  targetWeight,
  logged,
  onLog,
}: {
  setNumber: number;
  prescribedReps: number;
  targetWeight: number | null;
  logged?: SetData;
  onLog: (setNumber: number, weight: number, reps: number, rpe?: number) => void;
}) {
  const [weight, setWeight] = useState(targetWeight?.toString() || "");
  const [reps, setReps] = useState(prescribedReps.toString());
  const [rpe, setRpe] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const handleLog = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    const rpeNum = rpe ? parseInt(rpe) : undefined;

    if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
      setIsLogging(true);
      onLog(setNumber, w, r, rpeNum);
      setTimeout(() => setIsLogging(false), 500);
    }
  };

  if (logged) {
    return (
      <div className="bg-primary/10 border border-primary/40 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-primary font-semibold">Set {setNumber}</span>
            <span className="text-text ml-4">
              {logged.weight_used} lbs × {logged.reps_completed} reps
            </span>
            {logged.rpe && <span className="text-secondary text-sm ml-2">RPE: {logged.rpe}</span>}
          </div>
          <span className="text-primary font-semibold">Done</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-secondary/40 rounded-lg p-4">
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-1 text-secondary font-semibold text-sm">#{setNumber}</div>

        <div className="col-span-3">
          <label className="text-xs text-secondary block mb-1">Weight (lbs)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input-field py-2 text-sm"
            placeholder="0"
          />
        </div>

        <div className="col-span-3">
          <label className="text-xs text-secondary block mb-1">Reps</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="input-field py-2 text-sm"
            placeholder="0"
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-secondary block mb-1">RPE</label>
          <input
            type="number"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="input-field py-2 text-sm"
            placeholder="1-10"
          />
        </div>

        <div className="col-span-3">
          <button
            onClick={handleLog}
            disabled={isLogging}
            className="w-full bg-primary text-background font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {isLogging ? "Done" : "Log"}
          </button>
        </div>
      </div>
    </div>
  );
}
