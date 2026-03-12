"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { coachApi, AthleteStatus } from "@/lib/api-endpoints";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-green-400", bg: "bg-green-400/15" },
  idle: { label: "Idle", color: "text-yellow-400", bg: "bg-yellow-400/15" },
  flagged: { label: "Flagged", color: "text-red-400", bg: "bg-red-400/15" },
  new: { label: "New", color: "text-blue-400", bg: "bg-blue-400/15" },
};

function AthleteCard({ athlete }: { athlete: AthleteStatus }) {
  const config = STATUS_CONFIG[athlete.status] || STATUS_CONFIG.new;

  return (
    <Link
      href={`/coach/athletes/${athlete.id}`}
      className="block p-3 rounded-xl bg-surface border border-white/5 hover:border-primary/30 transition-all hover:bg-surface/80"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
          {athlete.profile_photo_url ? (
            <img
              src={athlete.profile_photo_url}
              alt={athlete.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-secondary">
              {athlete.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-text text-sm truncate">
              {athlete.name}
            </span>
            <span
              className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${config.color} ${config.bg}`}
            >
              {config.label}
            </span>
          </div>

          {/* Last workout */}
          {athlete.last_workout_name ? (
            <p className="text-xs text-secondary truncate">
              {athlete.last_workout_name}
              {athlete.last_workout_date && (
                <span className="text-white/30">
                  {" "}
                  &middot;{" "}
                  {formatDistanceToNow(new Date(athlete.last_workout_date), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-white/30 italic">No workouts yet</p>
          )}

          {/* Workouts this week */}
          <p className="text-[11px] text-white/40 mt-0.5">
            {athlete.workouts_this_week} workout{athlete.workouts_this_week !== 1 ? "s" : ""} this week
            {athlete.sport && (
              <span> &middot; {athlete.sport}</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function AthleteStatusPanel() {
  const { data: athletes, isLoading } = useQuery({
    queryKey: ["athleteStatuses"],
    queryFn: () => coachApi.getAthleteStatuses(),
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-text">Athletes</h2>
        {athletes && (
          <span className="text-xs text-secondary">{athletes.length} total</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[72px] rounded-xl bg-surface/50 animate-pulse"
              />
            ))}
          </div>
        ) : athletes && athletes.length > 0 ? (
          athletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-1">No athletes yet</p>
            <p className="text-white/30 text-xs">
              Share your invite code to add athletes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
