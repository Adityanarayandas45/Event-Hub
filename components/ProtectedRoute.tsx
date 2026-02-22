"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "organizer" | "attendee";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: Role;
}) {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userStr) as { role: Role };


    if (requiredRole && user.role !== requiredRole) {

      if (user.role === "organizer") {
        router.replace("/organizer");
      } else {
        router.replace("/attendee");
      }
      return;
    }

    
    // if (requiredRole) {
    //   if (user.role === "attendee") {
    //     router.replace("/attendee");
    //   } else if (user.role === "organizer") {
    //     router.replace("/organizer");
    //   }
    // }
  }, [router, requiredRole]);

  return <>{children}</>;
}
