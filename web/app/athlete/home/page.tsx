"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi, Workout } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";

export default function AthleteHomePage() {
  const router = useRouter();
  const { user } = getAuthData();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<Workout[] | null>(null);

  // Initialize on client side only
  useEffect(() => {
    setSelectedDate(new Date());
    setMounted(true);
  }, []);

  // Get today's workout
  const { data: todayWorkout, isLoading: loadingToday } = useQuery({
    queryKey: ["todayWorkout"],
    queryFn: () => athleteApi.getTodayWorkout(),
  });

  // Get calendar workouts
  const weekStart = selectedDate ? startOfWeek(selectedDate) : null;
  const { data: calendarWorkouts } = useQuery({
    queryKey: ["calendar", weekStart],
    queryFn: () => {
      if (!weekStart) return Promise.resolve([]);
      return athleteApi.getCalendar(
        format(weekStart, "yyyy-MM-dd"),
        format(addDays(weekStart, 6), "yyyy-MM-dd")
      );
    },
    enabled: !!weekStart && mounted,
  });

  const handleStartWorkout = (workoutId: number) => {
    router.push(`/athlete/workout/${workoutId}`);
  };

  const handleDayClick = (workouts: Workout[]) => {
    if (workouts.length > 0) {
      setSelectedDayWorkouts(workouts);
    }
  };

  const closeModal = () => {
    setSelectedDayWorkouts(null);
  };

  if (!mounted || !selectedDate) {
    return (
      <AuthGuard requiredUserType="athlete">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-secondary">Loading...</p>
        </div>
      </AuthGuard>
    );
  }

  const weekStart2 = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart2, i));

  return (
    <AuthGuard requiredUserType="athlete">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="athlete" />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Today's Workout Card */}
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-4">Today&apos;s Workout</h2>

            {loadingToday ? (
              <div className="card">
                <p className="text-secondary">Loading...</p>
              </div>
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

                {/* Exercise Preview */}
                <div className="space-y-2">
                  {todayWorkout.exercises?.slice(0, 3).map((exercise, idx) => (
                    <div key={exercise.id} className="flex justify-between items-center py-2 border-t border-secondary/20">
                      <span className="text-text">
                        {idx + 1}. {exercise.name}
                      </span>
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

          {/* Weekly Calendar */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-text mb-4">This Week</h2>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const workoutsArray = Array.isArray(calendarWorkouts) ? calendarWorkouts : [];
                const dayWorkouts = workoutsArray.filter(
                  (w) => format(new Date(w.scheduled_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                );
                const today = new Date();
                const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                const hasWorkout = dayWorkouts.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(dayWorkouts)}
                    className={`card p-3 text-center transition-all ${
                      isToday ? "border-primary" : ""
                    } ${hasWorkout ? "cursor-pointer hover:border-primary/60 hover:scale-105" : "cursor-default"}`}
                  >
                    <div className="text-xs text-secondary mb-1">{format(day, "EEE")}</div>
                    <div className={`text-lg font-bold ${isToday ? "text-primary" : "text-text"}`}>
                      {format(day, "d")}
                    </div>
                    {hasWorkout ? (
                      <div className="mt-2 flex flex-col items-center gap-1">
                        {dayWorkouts[0].is_completed ? (
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        ) : (
                          <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
                        )}
                        <span className="text-xs text-primary">{dayWorkouts[0].name.split(' - ')[0]}</span>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Week Navigation */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className="text-secondary hover:text-primary text-sm font-medium"
              >
                ← Previous Week
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-secondary hover:text-primary text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className="text-secondary hover:text-primary text-sm font-medium"
              >
                Next Week →
              </button>
            </div>
          </section>
        </main>

        {/* Workout Detail Modal */}
        {selectedDayWorkouts && selectedDayWorkouts.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
            <div className="bg-[#1F2937] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-text mb-2">
                    {selectedDayWorkouts[0].name}
                  </h3>
                  <p className="text-secondary text-sm">
                    {format(new Date(selectedDayWorkouts[0].scheduled_date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <button onClick={closeModal} className="text-secondary hover:text-text text-2xl">
                  ×
                </button>
              </div>

              {selectedDayWorkouts[0].is_completed && (
                <div className="bg-primary/10 border border-primary/40 rounded-lg p-3 mb-4">
                  <span className="text-primary font-semibold">Completed</span>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-text">Exercises</h4>
                {selectedDayWorkouts[0].exercises?.map((exercise, idx) => (
                  <div key={exercise.id} className="bg-background rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-text font-medium">
                        {idx + 1}. {exercise.name}
                      </span>
                      <span className="text-secondary text-sm">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                    {exercise.percentage_of_max && (
                      <p className="text-primary text-sm mb-1">
                        @ {Math.round(exercise.percentage_of_max * 100)}% of {exercise.target_exercise}
                      </p>
                    )}
                    {exercise.coach_notes && (
                      <p className="text-secondary text-sm italic">{exercise.coach_notes}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={closeModal} className="btn-secondary flex-1">
                  Close
                </button>
                {!selectedDayWorkouts[0].is_completed && (
                  <button
                    onClick={() => {
                      closeModal();
                      handleStartWorkout(selectedDayWorkouts[0].id);
                    }}
                    className="btn-primary flex-1"
                  >
                    Start Workout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
