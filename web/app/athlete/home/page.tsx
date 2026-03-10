"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
} from "date-fns";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi, Workout, Exercise } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";

export default function AthleteHomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = getAuthData();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch workouts for the visible calendar range
  const calendarStart = startOfWeek(startOfMonth(currentMonth));
  const calendarEnd = endOfWeek(endOfMonth(currentMonth));

  const { data: todayWorkout, isLoading: loadingToday } = useQuery({
    queryKey: ["todayWorkout"],
    queryFn: () => athleteApi.getTodayWorkout(),
  });

  const { data: calendarData } = useQuery({
    queryKey: ["calendar", format(calendarStart, "yyyy-MM-dd"), format(calendarEnd, "yyyy-MM-dd")],
    queryFn: () =>
      athleteApi.getCalendar(
        format(calendarStart, "yyyy-MM-dd"),
        format(calendarEnd, "yyyy-MM-dd")
      ),
    enabled: mounted,
  });

  // Build date -> workouts map
  const workoutsByDate = useMemo(() => {
    const map: Record<string, Workout[]> = {};
    const arr = Array.isArray(calendarData) ? calendarData : [];
    for (const w of arr) {
      const key = format(new Date(w.scheduled_date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(w);
    }
    return map;
  }, [calendarData]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handleStartWorkout = (workoutId: number) => {
    router.push(`/athlete/workout/${workoutId}`);
  };

  const handleDayClick = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const dayWorkouts = workoutsByDate[key];
    if (dayWorkouts && dayWorkouts.length > 0) {
      setSelectedWorkout(dayWorkouts[0]);
      setEditingWorkout(false);
    }
  };

  if (!mounted) {
    return (
      <AuthGuard requiredUserType="athlete">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-secondary">Loading...</p>
        </div>
      </AuthGuard>
    );
  }

  const today = new Date();

  return (
    <AuthGuard requiredUserType="athlete">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="athlete" />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Today's Workout Card */}
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-4">Today&apos;s Workout</h2>
            {loadingToday ? (
              <div className="card"><p className="text-secondary">Loading...</p></div>
            ) : todayWorkout ? (
              <div className="card hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-text mb-2">
                      {todayWorkout.name}
                    </h3>
                    <p className="text-secondary text-sm">
                      {todayWorkout.exercises?.length || 0} exercises
                    </p>
                  </div>
                  {todayWorkout.is_completed ? (
                    <span className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                      Completed
                    </span>
                  ) : (
                    <button onClick={() => handleStartWorkout(todayWorkout.id)} className="btn-primary">
                      Start Workout
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {todayWorkout.exercises?.slice(0, 3).map((exercise, idx) => (
                    <div key={exercise.id} className="flex justify-between items-center py-2 border-t border-secondary/20">
                      <span className="text-text">{idx + 1}. {exercise.name}</span>
                      <span className="text-secondary text-sm">
                        {exercise.sets} x {exercise.reps}
                        {exercise.percentage_of_max && ` @ ${Math.round(exercise.percentage_of_max * 100)}%`}
                      </span>
                    </div>
                  ))}
                  {(todayWorkout.exercises?.length || 0) > 3 && (
                    <p className="text-secondary text-sm pt-2">
                      + {(todayWorkout.exercises?.length || 0) - 3} more exercises
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <p className="text-secondary">No workout scheduled for today. Rest day!</p>
              </div>
            )}
          </section>

          {/* Monthly Calendar */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading font-bold text-text">Calendar</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-secondary hover:text-primary text-sm font-medium"
                >
                  &larr;
                </button>
                <span className="text-text font-medium min-w-[140px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-secondary hover:text-primary text-sm font-medium"
                >
                  &rarr;
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="text-xs text-secondary hover:text-primary border border-secondary/30 px-2 py-1 rounded"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-xs text-secondary text-center py-2 font-medium">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayWorkouts = workoutsByDate[key] || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isSameDay(day, today);
                const hasWorkout = dayWorkouts.length > 0;
                const isCompleted = hasWorkout && dayWorkouts[0].is_completed;

                return (
                  <button
                    key={key}
                    onClick={() => handleDayClick(day)}
                    className={`relative p-2 min-h-[72px] rounded-lg text-left transition-all ${
                      isCurrentMonth ? "" : "opacity-30"
                    } ${isDayToday ? "ring-2 ring-primary" : ""} ${
                      hasWorkout
                        ? "bg-[#1F2937] hover:bg-[#2a3544] cursor-pointer border border-secondary/20"
                        : "hover:bg-[#1F2937]/50 cursor-default"
                    }`}
                  >
                    <span className={`text-xs font-medium ${isDayToday ? "text-primary" : "text-text"}`}>
                      {format(day, "d")}
                    </span>
                    {hasWorkout && (
                      <div className="mt-1">
                        <div className="flex items-center gap-1">
                          {isCompleted ? (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          ) : (
                            <div className="w-2 h-2 rounded-full border border-primary flex-shrink-0" />
                          )}
                          <span className="text-xs text-primary truncate">
                            {dayWorkouts[0].name.length > 12
                              ? dayWorkouts[0].name.slice(0, 12) + "..."
                              : dayWorkouts[0].name}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        {/* Workout Detail / Edit Modal */}
        {selectedWorkout && (
          <WorkoutModal
            workout={selectedWorkout}
            editing={editingWorkout}
            onClose={() => { setSelectedWorkout(null); setEditingWorkout(false); }}
            onStartWorkout={handleStartWorkout}
            onEdit={() => setEditingWorkout(true)}
            onSave={async (data) => {
              await athleteApi.editWorkout(selectedWorkout.id, data);
              queryClient.invalidateQueries({ queryKey: ["calendar"] });
              queryClient.invalidateQueries({ queryKey: ["todayWorkout"] });
              const updated = await athleteApi.getWorkout(selectedWorkout.id);
              setSelectedWorkout(updated);
              setEditingWorkout(false);
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}


// ─── Workout Detail / Edit Modal ──────────────────────────────────────────────

interface WorkoutModalProps {
  workout: Workout;
  editing: boolean;
  onClose: () => void;
  onStartWorkout: (id: number) => void;
  onEdit: () => void;
  onSave: (data: {
    name?: string;
    exercises?: Array<{
      id?: number;
      name: string;
      sets: number;
      reps: number;
      percentage_of_max?: number;
      target_exercise?: string;
      coach_notes?: string;
      order: number;
    }>;
    modification_notes?: string;
  }) => Promise<void>;
}

function WorkoutModal({ workout, editing, onClose, onStartWorkout, onEdit, onSave }: WorkoutModalProps) {
  const [exercises, setExercises] = useState(
    workout.exercises?.map((e) => ({ ...e })) || []
  );
  const [modNotes, setModNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setExercises(workout.exercises?.map((e) => ({ ...e })) || []);
    setModNotes("");
  }, [workout]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        exercises: exercises.map((e, i) => ({
          id: e.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          percentage_of_max: e.percentage_of_max || undefined,
          target_exercise: e.target_exercise || undefined,
          coach_notes: e.coach_notes || undefined,
          order: i + 1,
        })),
        modification_notes: modNotes || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateExercise = (idx: number, field: string, value: any) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { id: 0, name: "", sets: 3, reps: 10, order: prev.length + 1 } as Exercise,
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-[#1F2937] rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-heading font-bold text-text mb-1">{workout.name}</h3>
            <p className="text-secondary text-sm">
              {format(new Date(workout.scheduled_date), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-text text-2xl leading-none">&times;</button>
        </div>

        {workout.is_completed && (
          <div className="bg-primary/10 border border-primary/40 rounded-lg p-3 mb-4">
            <span className="text-primary font-semibold">Completed</span>
          </div>
        )}

        {/* View Mode */}
        {!editing && (
          <>
            <div className="space-y-3">
              <h4 className="font-semibold text-text">Exercises</h4>
              {workout.exercises?.map((exercise, idx) => (
                <div key={exercise.id} className="bg-background rounded-lg p-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-text font-medium">{idx + 1}. {exercise.name}</span>
                    <span className="text-secondary text-sm">{exercise.sets} &times; {exercise.reps}</span>
                  </div>
                  {exercise.percentage_of_max && (
                    <p className="text-primary text-sm">
                      @ {Math.round(exercise.percentage_of_max * 100)}% of {exercise.target_exercise}
                    </p>
                  )}
                  {exercise.coach_notes && (
                    <p className="text-secondary text-sm italic mt-1">{exercise.coach_notes}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              {!workout.is_completed && (
                <button onClick={onEdit} className="btn-secondary flex-1">Edit Workout</button>
              )}
              {!workout.is_completed && (
                <button
                  onClick={() => { onClose(); onStartWorkout(workout.id); }}
                  className="btn-primary flex-1"
                >
                  Start Workout
                </button>
              )}
              {workout.is_completed && (
                <button onClick={onClose} className="btn-secondary flex-1">Close</button>
              )}
            </div>
          </>
        )}

        {/* Edit Mode */}
        {editing && (
          <>
            <div className="space-y-3 mb-4">
              <h4 className="font-semibold text-text">Edit Exercises</h4>
              {exercises.map((exercise, idx) => (
                <div key={idx} className="bg-background rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary text-sm w-6">{idx + 1}.</span>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(idx, "name", e.target.value)}
                      className="input-field py-2 text-sm flex-1"
                      placeholder="Exercise name"
                    />
                    <button onClick={() => removeExercise(idx)} className="text-error hover:text-error/80 text-sm px-2">
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 ml-8">
                    <div>
                      <label className="text-xs text-secondary">Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(idx, "sets", parseInt(e.target.value) || 1)}
                        className="input-field py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-secondary">Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(idx, "reps", parseInt(e.target.value) || 1)}
                        className="input-field py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addExercise}
                className="w-full border-2 border-dashed border-secondary/30 rounded-lg py-3 text-secondary hover:text-primary hover:border-primary/40 text-sm transition-colors"
              >
                + Add Exercise
              </button>
            </div>
            <div className="mb-4">
              <label className="text-sm text-secondary block mb-1">What did you change? (optional)</label>
              <input
                type="text"
                value={modNotes}
                onChange={(e) => setModNotes(e.target.value)}
                className="input-field py-2 text-sm"
                placeholder="e.g. Swapped bench for dumbbell press due to shoulder"
              />
              <p className="text-xs text-secondary mt-1">Your coach will see this note.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setExercises(workout.exercises?.map((e) => ({ ...e })) || []);
                  setModNotes("");
                  onClose();
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || exercises.length === 0}
                className="btn-primary flex-1"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
