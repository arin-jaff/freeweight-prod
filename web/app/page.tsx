"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthData } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const { token, user } = getAuthData();

    if (token && user) {
      // Redirect to appropriate dashboard based on user type
      if (user.user_type === "coach") {
        router.push("/coach/dashboard");
      } else {
        router.push("/athlete/home");
      }
    } else {
      // Redirect to login if not authenticated
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">FreeWeight</h1>
        <p className="text-secondary">Loading...</p>
      </div>
    </div>
  );
}
