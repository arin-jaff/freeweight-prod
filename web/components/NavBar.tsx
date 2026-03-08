"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";

interface NavBarProps {
  userName: string;
  userType: "athlete" | "coach";
}

export default function NavBar({ userName, userType }: NavBarProps) {
  const router = useRouter();

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  const baseUrl = userType === "coach" ? "/coach" : "/athlete";

  return (
    <nav className="bg-[#1F2937] border-b border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={`${baseUrl}/dashboard`} className="flex items-center">
              <h1 className="text-2xl font-heading font-bold text-primary">FreeWeight</h1>
            </Link>

            <div className="hidden md:flex space-x-4">
              {userType === "coach" ? (
                <>
                  <Link
                    href="/coach/dashboard"
                    className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/coach/roster"
                    className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Roster
                  </Link>
                  <Link
                    href="/coach/programs"
                    className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Programs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/athlete/home"
                    className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/athlete/progress"
                    className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Progress
                  </Link>
                  <Link
                    href="/athlete/profile"
                    className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-text text-sm">{userName}</span>
            <button
              onClick={handleLogout}
              className="text-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
