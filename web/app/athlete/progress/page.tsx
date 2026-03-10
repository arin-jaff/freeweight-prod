"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { athleteApi, ProgressData } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

const LIFT_LABELS: Record<string, string> = {
  squat: "Back Squat",
  bench: "Bench Press",
  deadlift: "Deadlift",
  clean: "Power Clean",
};

export default function AthleteProgressPage() {
  const { user } = getAuthData();
  const queryClient = useQueryClient();
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState("");

  const { data: progressData, isLoading } = useQuery({
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

          {/* Strength Progress Charts */}
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-4">Strength Progress</h2>

            {isLoading ? (
              <div className="card"><p className="text-secondary">Loading...</p></div>
            ) : progressData && progressData.length > 0 ? (
              <div className="space-y-6">
                {progressData.map((item) => (
                  <StrengthChart
                    key={item.exercise_name}
                    data={item}
                    onEdit={(exercise) => {
                      setEditingExercise(exercise);
                      setNewWeight(item.current_max?.toString() || "");
                    }}
                    editingExercise={editingExercise}
                    newWeight={newWeight}
                    onNewWeightChange={setNewWeight}
                    onSave={handleUpdateMax}
                    onCancelEdit={() => { setEditingExercise(null); setNewWeight(""); }}
                    saving={updateMaxMutation.isPending}
                  />
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


// ─── Strength Progress Chart ────────────────────────────────────────────────

interface StrengthChartProps {
  data: ProgressData;
  onEdit: (exercise: string) => void;
  editingExercise: string | null;
  newWeight: string;
  onNewWeightChange: (val: string) => void;
  onSave: (exercise: string) => void;
  onCancelEdit: () => void;
  saving: boolean;
}

function StrengthChart({
  data,
  onEdit,
  editingExercise,
  newWeight,
  onNewWeightChange,
  onSave,
  onCancelEdit,
  saving,
}: StrengthChartProps) {
  const label = LIFT_LABELS[data.exercise_name] || data.exercise_name;
  const hasGoal = !!data.goal;
  const hasData = data.data.length > 0;

  // Chart dimensions
  const chartWidth = 500;
  const chartHeight = 160;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 30;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const chartData = useMemo(() => {
    if (!hasGoal && !hasData) return null;

    const now = new Date();

    // Collect all data points
    const actualPoints = data.data.map((d) => ({
      date: new Date(d.date),
      weight: d.max_weight,
    }));

    // Determine date range
    let minDate = now;
    let maxDate = now;

    if (actualPoints.length > 0) {
      minDate = new Date(Math.min(...actualPoints.map((p) => p.date.getTime())));
      maxDate = new Date(Math.max(...actualPoints.map((p) => p.date.getTime()), now.getTime()));
    }

    if (hasGoal) {
      const goalDate = new Date(data.goal!.target_date);
      if (goalDate > maxDate) maxDate = goalDate;
      const goalCreated = new Date(data.goal!.created_at);
      if (goalCreated < minDate) minDate = goalCreated;
    }

    // Add buffer days
    const range = maxDate.getTime() - minDate.getTime();
    const buffer = Math.max(range * 0.05, 86400000 * 7); // at least 7 days buffer
    minDate = new Date(minDate.getTime() - buffer);
    maxDate = new Date(maxDate.getTime() + buffer);

    // Weight range
    let minWeight = data.current_max || 0;
    let maxWeight = data.current_max || 0;

    for (const p of actualPoints) {
      if (p.weight < minWeight) minWeight = p.weight;
      if (p.weight > maxWeight) maxWeight = p.weight;
    }
    if (hasGoal) {
      if (data.goal!.starting_weight < minWeight) minWeight = data.goal!.starting_weight;
      if (data.goal!.target_weight > maxWeight) maxWeight = data.goal!.target_weight;
    }

    const weightBuffer = Math.max((maxWeight - minWeight) * 0.15, 20);
    minWeight = Math.max(0, minWeight - weightBuffer);
    maxWeight = maxWeight + weightBuffer;

    // Scale functions
    const dateRange = maxDate.getTime() - minDate.getTime();
    const weightRange = maxWeight - minWeight || 1;

    const scaleX = (d: Date) => padLeft + ((d.getTime() - minDate.getTime()) / dateRange) * plotW;
    const scaleY = (w: number) => padTop + plotH - ((w - minWeight) / weightRange) * plotH;

    // Build actual line path
    let actualPath = "";
    const sortedActual = [...actualPoints].sort((a, b) => a.date.getTime() - b.date.getTime());
    if (sortedActual.length > 0) {
      actualPath = sortedActual
        .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.date)} ${scaleY(p.weight)}`)
        .join(" ");
    }

    // Build projected line (dotted) from latest actual point (or goal start) to goal target
    let projectedPath = "";
    if (hasGoal) {
      const goalDate = new Date(data.goal!.target_date);
      const startWeight = data.current_max || data.goal!.starting_weight;
      const startDate = sortedActual.length > 0 ? sortedActual[sortedActual.length - 1].date : now;
      projectedPath = `M ${scaleX(startDate)} ${scaleY(startWeight)} L ${scaleX(goalDate)} ${scaleY(data.goal!.target_weight)}`;
    }

    // Y-axis ticks (4 ticks)
    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const w = minWeight + (weightRange * i) / 4;
      return { weight: Math.round(w), y: scaleY(w) };
    });

    // Today marker
    const todayX = scaleX(now);

    // Goal marker
    const goalMarker = hasGoal
      ? {
          x: scaleX(new Date(data.goal!.target_date)),
          y: scaleY(data.goal!.target_weight),
          weight: data.goal!.target_weight,
        }
      : null;

    // Actual point circles
    const circles = sortedActual.map((p) => ({
      cx: scaleX(p.date),
      cy: scaleY(p.weight),
      weight: p.weight,
      date: p.date,
    }));

    // Progress percentage
    let progressPct: number | null = null;
    if (hasGoal && data.current_max) {
      const start = data.goal!.starting_weight;
      const target = data.goal!.target_weight;
      const gained = data.current_max - start;
      const total = target - start;
      if (total > 0) {
        progressPct = Math.min(100, Math.max(0, Math.round((gained / total) * 100)));
      }
    }

    return {
      actualPath,
      projectedPath,
      yTicks,
      todayX,
      goalMarker,
      circles,
      progressPct,
      minDate,
      maxDate,
    };
  }, [data, hasGoal, hasData]);

  const isEditing = editingExercise === data.exercise_name;

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-heading font-bold text-text capitalize">{label}</h3>
          <div className="flex items-center gap-4 mt-1">
            {data.current_max && (
              <span className="text-secondary text-sm">
                Current: <span className="text-primary font-semibold">{data.current_max} lbs</span>
              </span>
            )}
            {hasGoal && (
              <span className="text-secondary text-sm">
                Goal: <span className="text-text font-semibold">{data.goal!.target_weight} lbs</span>
                <span className="text-secondary"> by {new Date(data.goal!.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onEdit(data.exercise_name)}
          className="text-primary hover:underline text-sm font-medium"
        >
          Update Max
        </button>
      </div>

      {/* Edit inline */}
      {isEditing && (
        <div className="mb-4 p-3 bg-background rounded-lg space-y-3">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => onNewWeightChange(e.target.value)}
            className="input-field"
            placeholder="New max weight (lbs)"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={onCancelEdit} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => onSave(data.exercise_name)}
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Progress bar (if goal exists) */}
      {hasGoal && chartData?.progressPct !== null && chartData?.progressPct !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-secondary mb-1">
            <span>{data.goal!.starting_weight} lbs</span>
            <span className="text-primary font-medium">{chartData.progressPct}%</span>
            <span>{data.goal!.target_weight} lbs</span>
          </div>
          <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${chartData.progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* SVG Chart */}
      {chartData && (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full max-w-[500px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {chartData.yTicks.map((tick) => (
              <g key={tick.weight}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={chartWidth - padRight}
                  y2={tick.y}
                  stroke="#5A6572"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
                <text
                  x={padLeft - 8}
                  y={tick.y + 3}
                  textAnchor="end"
                  fill="#5A6572"
                  fontSize="9"
                >
                  {tick.weight}
                </text>
              </g>
            ))}

            {/* Today vertical line */}
            <line
              x1={chartData.todayX}
              y1={padTop}
              x2={chartData.todayX}
              y2={chartHeight - padBottom}
              stroke="#5A6572"
              strokeWidth="0.5"
              strokeDasharray="3 3"
              opacity="0.5"
            />
            <text
              x={chartData.todayX}
              y={chartHeight - padBottom + 15}
              textAnchor="middle"
              fill="#5A6572"
              fontSize="8"
            >
              Today
            </text>

            {/* Projected line (dotted) */}
            {chartData.projectedPath && (
              <path
                d={chartData.projectedPath}
                stroke="#B4F000"
                strokeWidth="2"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.5"
              />
            )}

            {/* Actual line (solid) */}
            {chartData.actualPath && (
              <path
                d={chartData.actualPath}
                stroke="#B4F000"
                strokeWidth="2.5"
                fill="none"
                strokeLinejoin="round"
              />
            )}

            {/* Actual data points */}
            {chartData.circles.map((c, i) => (
              <g key={i}>
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r="4"
                  fill="#B4F000"
                  stroke="#14181C"
                  strokeWidth="1.5"
                />
                <text
                  x={c.cx}
                  y={c.cy - 8}
                  textAnchor="middle"
                  fill="#E6EDF3"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {c.weight}
                </text>
              </g>
            ))}

            {/* Goal marker (star/diamond) */}
            {chartData.goalMarker && (
              <g>
                <polygon
                  points={`${chartData.goalMarker.x},${chartData.goalMarker.y - 6} ${chartData.goalMarker.x + 5},${chartData.goalMarker.y} ${chartData.goalMarker.x},${chartData.goalMarker.y + 6} ${chartData.goalMarker.x - 5},${chartData.goalMarker.y}`}
                  fill="none"
                  stroke="#B4F000"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                <text
                  x={chartData.goalMarker.x}
                  y={chartData.goalMarker.y - 10}
                  textAnchor="middle"
                  fill="#B4F000"
                  fontSize="8"
                  fontWeight="bold"
                  opacity="0.8"
                >
                  {chartData.goalMarker.weight}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Legend */}
      {(hasGoal || hasData) && (
        <div className="flex items-center gap-4 mt-3 text-xs text-secondary">
          {hasData && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-primary rounded" />
              <span>Actual</span>
            </div>
          )}
          {hasGoal && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 border-t border-dashed border-primary opacity-50" />
              <span>Projected</span>
            </div>
          )}
        </div>
      )}

      {/* No data state */}
      {!hasData && !hasGoal && (
        <div className="text-center py-6">
          <p className="text-secondary text-sm">No data yet. Update your max to start tracking.</p>
        </div>
      )}
    </div>
  );
}
