"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/auth";

interface NavBarProps {
  userName: string;
  userType: "athlete" | "coach";
  profilePhoto?: string;
}

export default function NavBar({ userName, userType, profilePhoto }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  const baseUrl = userType === "coach" ? "/coach" : "/athlete";

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#1F2937] border-b border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={`${baseUrl}/home`} className="flex items-center">
              <h1 className="text-2xl font-heading font-bold text-primary">FreeWeight</h1>
            </Link>

            <div className="hidden md:flex space-x-1">
              {userType === "coach" ? (
                <>
                  <NavLink href="/coach/dashboard" label="Dashboard" active={isActive("/coach/dashboard")} />
                  <NavLink href="/coach/roster" label="Roster" active={isActive("/coach/roster")} />
                  <NavLink href="/coach/programs" label="Programs" active={isActive("/coach/programs")} />
                </>
              ) : (
                <>
                  <NavLink href="/athlete/home" label="Home" active={isActive("/athlete/home")} />
                  <NavLink href="/athlete/progress" label="Progress" active={isActive("/athlete/progress")} />
                  <NavLink href="/athlete/profile" label="Profile" active={isActive("/athlete/profile")} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link href={`${baseUrl}/profile`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-secondary/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold border border-secondary/30">
                  {(userName || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-text text-sm hidden sm:block">{userName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-secondary hover:text-primary text-sm font-medium transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "text-primary bg-primary/10"
          : "text-text hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
