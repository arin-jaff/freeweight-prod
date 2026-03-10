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
  differenceInDays,
} from "date-fns";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi, Workout, Exercise, ProgressData } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";

interface CalendarExercise {
  name: string;
  sets: number;
  reps: number;
}

interface CalendarWorkout {
  id: number;
  name: string;
  scheduled_date: string;
  is_completed: boolean;
  is_flagged: boolean;
  exercises: CalendarExercise[];
}

const STRENGTH_LEVELS = [
  { key: "beginner", label: "Beginner", min: 0 },
  { key: "intermediate", label: "Intermediate", min: 1 },
  { key: "advanced", label: "Advanced", min: 2 },
  { key: "elite", label: "Elite", min: 3 },
  { key: "pro", label: "Pro", min: 4 },
];

const LIFT_LABELS: Record<string, string> = {
  squat: "Squat",
  bench: "Bench",
  deadlift: "Deadlift",
  clean: "Clean",
};

function getStrengthLevelIndex(level?: string): number {
  if (!level) return 0;
  const map: Record<string, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    elite: 3,
    pro: 4,
  };
  return map[level.toLowerCase()] ?? 0;
}

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

  const { data: progressData } = useQuery({
    queryKey: ["progress"],
    queryFn: () => athleteApi.getProgress(),
    enabled: mounted,
  });

  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: () => athleteApi.getHistory(),
    enabled: mounted,
  });

  // Build date -> workouts map
  const workoutsByDate = useMemo(() => {
    const map: Record<string, CalendarWorkout[]> = {};
    const arr = Array.isArray(calendarData) ? calendarData : [];
    for (const w of arr) {
      const key = format(new Date(w.scheduled_date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(w as unknown as CalendarWorkout);
    }
    return map;
  }, [calendarData]);

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

  // Upcoming workouts (next 7 days)
  const upcomingWorkouts = useMemo(() => {
    const arr = Array.isArray(calendarData) ? calendarData : [];
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return (arr as unknown as CalendarWorkout[])
      .filter((w) => {
        const d = new Date(w.scheduled_date);
        return d >= now && d <= weekFromNow && !w.is_completed;
      })
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 5);
  }, [calendarData]);

  // Workout stats
  const stats = useMemo(() => {
    const completed = history?.filter((w) => w.is_completed) || [];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = completed.filter((w) => w.completed_at && new Date(w.completed_at) >= weekAgo);

    // Current streak
    let streak = 0;
    const allArr = Array.isArray(calendarData) ? calendarData : [];
    const sortedCompleted = (allArr as unknown as CalendarWorkout[])
      .filter((w) => w.is_completed)
      .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());

    if (sortedCompleted.length > 0) {
      let checkDate = new Date();
      for (const w of sortedCompleted) {
        const wDate = format(new Date(w.scheduled_date), "yyyy-MM-dd");
        const checkStr = format(checkDate, "yyyy-MM-dd");
        if (wDate === checkStr || wDate === format(addDays(checkDate, -1), "yyyy-MM-dd")) {
          streak++;
          checkDate = new Date(w.scheduled_date);
        } else {
          break;
        }
      }
    }

    return {
      totalCompleted: completed.length,
      thisWeek: thisWeek.length,
      streak,
    };
  }, [history, calendarData]);

  // Best lifts from progress data
  const bestLifts = useMemo(() => {
    if (!progressData) return [];
    return progressData
      .filter((p) => p.current_max && p.current_max > 0)
      .map((p) => ({
        name: LIFT_LABELS[p.exercise_name] || p.exercise_name,
        key: p.exercise_name,
        weight: p.current_max!,
        goal: p.goal,
      }));
  }, [progressData]);

  // Goals with progress
  const activeGoals = useMemo(() => {
    if (!progressData) return [];
    return progressData
      .filter((p) => p.goal)
      .map((p) => {
        const start = p.goal!.starting_weight;
        const target = p.goal!.target_weight;
        const current = p.current_max || start;
        const total = target - start;
        const gained = current - start;
        const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((gained / total) * 100))) : 0;
        const daysLeft = differenceInDays(new Date(p.goal!.target_date), new Date());
        return {
          exercise: LIFT_LABELS[p.exercise_name] || p.exercise_name,
          current,
          target,
          pct,
          daysLeft,
        };
      });
  }, [progressData]);

  const handleStartWorkout = (workoutId: number) => {
    router.push(`/athlete/workout/${workoutId}`);
  };

  const handleDayClick = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const dayWorkouts = workoutsByDate[key];
    if (dayWorkouts && dayWorkouts.length > 0) {
      athleteApi.getWorkout(dayWorkouts[0].id).then((w) => {
        setSelectedWorkout(w);
        setEditingWorkout(false);
      });
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
  const strengthIdx = getStrengthLevelIndex(user?.experience_level);
  const totalSets = (exercises: CalendarExercise[]) =>
    exercises.reduce((sum, ex) => sum + ex.sets, 0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AuthGuard requiredUserType="athlete">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="athlete" profilePhoto={user?.profile_photo_url} />

        <main className="max-w-6xl mx-auto px-4 py-8">

          {/* ── Welcome Header ── */}
          <section className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/40">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-heading font-bold text-text">
                  {greeting()}, {user?.name?.split(" ")[0] || "Athlete"}
                </h1>
                <p className="text-secondary mt-1">
                  {user?.sport && user?.team
                    ? `${user.sport} \u2014 ${user.team}`
                    : user?.sport || user?.team || "Ready to train"}
                </p>
              </div>
            </div>
          </section>

          {/* ── Top Metrics Row ── */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1F2937] rounded-xl p-4 border border-secondary/15">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">This Week</p>
              <p className="text-3xl font-heading font-bold text-primary">{stats.thisWeek}</p>
              <p className="text-secondary text-xs mt-1">workouts</p>
            </div>
            <div className="bg-[#1F2937] rounded-xl p-4 border border-secondary/15">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Streak</p>
              <p className="text-3xl font-heading font-bold text-text">{stats.streak}</p>
              <p className="text-secondary text-xs mt-1">days</p>
            </div>
            <div className="bg-[#1F2937] rounded-xl p-4 border border-secondary/15">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-heading font-bold text-text">{stats.totalCompleted}</p>
              <p className="text-secondary text-xs mt-1">completed</p>
            </div>
            <div className="bg-[#1F2937] rounded-xl p-4 border border-secondary/15">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Upcoming</p>
              <p className="text-3xl font-heading font-bold text-text">{upcomingWorkouts.length}</p>
              <p className="text-secondary text-xs mt-1">next 7 days</p>
            </div>
          </section>

          {/* ── Two Column: Left (Today + Upcoming) / Right (Strength Level + Best Lifts + Goals) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Left Column — Today + Upcoming */}
            <div className="lg:col-span-2 space-y-6">

              {/* Today's Workout */}
              <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-5">
                <h2 className="text-lg font-heading font-bold text-text mb-3">Today</h2>
                {loadingToday ? (
                  <p className="text-secondary text-sm">Loading...</p>
                ) : todayWorkout ? (
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-heading font-bold text-text">{todayWorkout.name}</h3>
                        <p className="text-secondary text-sm mt-0.5">
                          {todayWorkout.exercises?.length || 0} exercises &middot; {todayWorkout.exercises?.reduce((s, e) => s + e.sets, 0) || 0} total sets
                        </p>
                      </div>
                      {todayWorkout.is_completed ? (
                        <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                          Completed
                        </span>
                      ) : (
                        <button onClick={() => handleStartWorkout(todayWorkout.id)} className="btn-primary text-sm px-5 py-2">
                          Start Workout
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {todayWorkout.exercises?.slice(0, 4).map((exercise, idx) => (
                        <div key={exercise.id} className="flex justify-between items-center py-1.5 border-t border-secondary/10">
                          <span className="text-text text-sm">{idx + 1}. {exercise.name}</span>
                          <span className="text-secondary text-xs">
                            {exercise.sets} &times; {exercise.reps}
                            {exercise.percentage_of_max && ` @ ${Math.round(exercise.percentage_of_max * 100)}%`}
                          </span>
                        </div>
                      ))}
                      {(todayWorkout.exercises?.length || 0) > 4 && (
                        <p className="text-secondary text-xs pt-1">+ {(todayWorkout.exercises?.length || 0) - 4} more</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-secondary">No workout scheduled today. Rest day!</p>
                  </div>
                )}
              </div>

              {/* Upcoming Workouts */}
              {upcomingWorkouts.length > 0 && (
                <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-5">
                  <h2 className="text-lg font-heading font-bold text-text mb-3">Upcoming</h2>
                  <div className="space-y-2">
                    {upcomingWorkouts.map((w) => {
                      const d = new Date(w.scheduled_date);
                      const isToday = isSameDay(d, today);
                      const isTomorrow = isSameDay(d, addDays(today, 1));
                      const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : format(d, "EEE, MMM d");
                      return (
                        <button
                          key={w.id}
                          onClick={() => {
                            athleteApi.getWorkout(w.id).then((full) => {
                              setSelectedWorkout(full);
                              setEditingWorkout(false);
                            });
                          }}
                          className="w-full flex items-center justify-between bg-background rounded-lg px-4 py-3 hover:bg-[#243044] transition-colors text-left"
                        >
                          <div>
                            <p className="text-text font-medium text-sm">{w.name}</p>
                            <p className="text-secondary text-xs mt-0.5">
                              {w.exercises.length} exercises &middot; {totalSets(w.exercises)} sets
                            </p>
                          </div>
                          <span className="text-secondary text-xs whitespace-nowrap ml-3">{dayLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column — Strength Level + Best Lifts + Goals */}
            <div className="space-y-6">

              {/* Strength Level */}
              <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-5">
                <h2 className="text-lg font-heading font-bold text-text mb-3">Strength Level</h2>
                <div className="flex items-center gap-1 mb-2">
                  {STRENGTH_LEVELS.map((lvl, i) => (
                    <div
                      key={lvl.key}
                      className={`h-2 flex-1 rounded-full ${
                        i <= strengthIdx ? "bg-primary" : "bg-secondary/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-secondary">
                  {STRENGTH_LEVELS.map((lvl, i) => (
                    <span key={lvl.key} className={i === strengthIdx ? "text-primary font-semibold" : ""}>
                      {lvl.label}
                    </span>
                  ))}
                </div>
                <p className="text-center mt-3">
                  <span className="text-primary font-heading font-bold text-lg capitalize">
                    {user?.experience_level || "Beginner"}
                  </span>
                </p>
              </div>

              {/* Best Lifts */}
              {bestLifts.length > 0 && (
                <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-5">
                  <h2 className="text-lg font-heading font-bold text-text mb-3">Best Lifts</h2>
                  <div className="space-y-3">
                    {bestLifts.map((lift) => (
                      <div key={lift.key} className="flex justify-between items-center">
                        <span className="text-text text-sm capitalize">{lift.name}</span>
                        <span className="text-primary font-heading font-bold text-lg">{lift.weight}<span className="text-secondary text-xs ml-1">lbs</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {activeGoals.length > 0 && (
                <div className="bg-[#1F2937] rounded-xl border border-secondary/15 p-5">
                  <h2 className="text-lg font-heading font-bold text-text mb-3">Goals</h2>
                  <div className="space-y-4">
                    {activeGoals.map((g) => (
                      <div key={g.exercise}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-text text-sm">{g.exercise}</span>
                          <span className="text-xs text-secondary">
                            {g.daysLeft > 0 ? `${g.daysLeft}d left` : "Past due"}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary/20 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${g.pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-secondary">
                          <span>{g.current} lbs</span>
                          <span className="text-primary font-medium">{g.pct}%</span>
                          <span>{g.target} lbs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Monthly Calendar ── */}
          <section className="bg-[#1a2332] rounded-xl border border-secondary/20 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-bold text-text">Calendar</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-secondary hover:text-primary text-lg font-medium px-2"
                >
                  &larr;
                </button>
                <span className="text-text font-medium min-w-[140px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-secondary hover:text-primary text-lg font-medium px-2"
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

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-xs text-secondary text-center py-2 font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayWorkouts = workoutsByDate[key] || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isSameDay(day, today);
                const hasWorkout = dayWorkouts.length > 0;

                return (
                  <button
                    key={key}
                    onClick={() => hasWorkout ? handleDayClick(day) : undefined}
                    className={`relative p-1.5 aspect-square rounded-md text-left transition-all flex flex-col ${
                      isCurrentMonth ? "" : "opacity-30"
                    } ${isDayToday ? "ring-2 ring-primary" : ""} ${
                      hasWorkout
                        ? "bg-[#243044] hover:bg-[#2d3b52] cursor-pointer border border-secondary/25"
                        : "bg-[#1e2b3a] hover:bg-[#243044]/60 cursor-default"
                    }`}
                  >
                    <span className={`text-xs font-medium mb-1 ${isDayToday ? "text-primary" : "text-text"}`}>
                      {format(day, "d")}
                    </span>

                    {hasWorkout && (
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        {dayWorkouts.map((w) => (
                          <div
                            key={w.id}
                            className={`rounded px-1.5 py-1 text-[10px] leading-tight truncate ${
                              w.is_completed
                                ? "bg-primary/20 text-primary border-l-2 border-primary"
                                : "bg-primary/10 text-primary/80 border-l-2 border-primary/50"
                            }`}
                          >
                            <div className="font-medium truncate">{w.name}</div>
                            <div className="text-[9px] opacity-70 mt-0.5">
                              {totalSets(w.exercises)} sets &middot; {w.exercises.length} ex
                            </div>
                          </div>
                        ))}
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-[#1F2937] rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
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
