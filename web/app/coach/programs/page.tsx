"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import { programApi } from "@/lib/api-endpoints";
import { getAuthData } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default function CoachProgramsPage() {
  const { user } = getAuthData();
  const [showArchived, setShowArchived] = useState(false);

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs", showArchived],
    queryFn: () => (showArchived ? programApi.listArchived() : programApi.list()),
  });

  return (
    <AuthGuard requiredUserType="coach">
      <div className="min-h-screen bg-background">
        <NavBar userName={user?.name || ""} userType="coach" profilePhoto={user?.profile_photo_url} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text mb-2">Programs</h1>
              <p className="text-secondary">
                {programs?.length || 0} program{programs?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="btn-secondary"
              >
                {showArchived ? "Show Active" : "Show Archived"}
              </button>
              <Link href="/coach/programs/create" className="btn-primary">
                Create Program
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="card">
              <p className="text-secondary">Loading programs...</p>
            </div>
          ) : programs && programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div key={program.id} className="card hover:border-primary/40 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-heading font-bold text-text">
                      {program.name}
                    </h3>
                    {program.archived && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                        Archived
                      </span>
                    )}
                  </div>

                  {program.description && (
                    <p className="text-secondary text-sm mb-4 line-clamp-2">
                      {program.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-secondary">
                      <span className="font-medium">Workouts:</span>{" "}
                      {program.workouts?.length || 0}
                    </p>
                    <p className="text-secondary">
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(program.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/coach/programs/${program.id}`}
                      className="flex-1 btn-primary text-center text-sm"
                    >
                      View
                    </Link>
                    {!program.archived && (
                      <Link
                        href={`/coach/programs/${program.id}/edit`}
                        className="flex-1 btn-secondary text-center text-sm"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <h3 className="text-xl font-heading font-bold text-text mb-2">
                {showArchived ? "No Archived Programs" : "No Programs Yet"}
              </h3>
              <p className="text-secondary mb-6">
                {showArchived
                  ? "Archived programs will appear here"
                  : "Create your first training program to get started"}
              </p>
              {!showArchived && (
                <Link href="/coach/programs/create" className="btn-primary inline-block">
                  Create Program
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
