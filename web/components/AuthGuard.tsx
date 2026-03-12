"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthData, User } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: "athlete" | "coach";
}

export default function AuthGuard({ children, requiredUserType }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const { token, user } = getAuthData();

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (requiredUserType && user.user_type !== requiredUserType) {
      // Redirect to correct dashboard
      if (user.user_type === "coach") {
        router.push("/coach/dashboard");
      } else {
        router.push("/athlete/home");
      }
      return;
    }

    setIsAuthorized(true);
  }, [router, requiredUserType]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
