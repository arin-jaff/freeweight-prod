"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { saveAuthData } from "@/lib/auth";

export default function AuthFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const user = JSON.parse(userParam);
        saveAuthData(token, user);

        // Clean the URL by removing token/user params and staying on the same path
        router.replace(pathname);
      } catch {
        // Invalid user JSON — ignore
      }
    }
  }, [searchParams, router, pathname]);

  return null;
}
