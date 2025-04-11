"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import StreamClientProvider from "@/components/providers/StreamClientProvider";
import LoaderUI from "@/components/LoaderUI";

export default function AuthCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  
  // Only run query if user ID exists
  const userData = useQuery(
    api.users.getUserByClerkId, 
    user?.id ? { clerkId: user.id } : { clerkId: "" }
  );

  // Always log user data for debugging
  useEffect(() => {
    if (isUserLoaded && user) {
      console.log("Auth check - User ID:", user.id);
      console.log("Auth check - Convex user data:", userData);
    }
  }, [isUserLoaded, user, userData]);
  
  useEffect(() => {
    // Only redirect if we have a user and userData has been fetched (not undefined)
    if (isUserLoaded && user && userData !== undefined) {
      // If user exists but has no role, redirect to role selection
      if (!userData?.role) {
        console.log("No role detected, redirecting to role selection");
        router.push("/select-role");
      } else {
        console.log("User has role:", userData.role);
      }
    }
  }, [isUserLoaded, user, userData, router]);
  
  // Show loading state during auth checks
  if (!isUserLoaded || !user || userData === undefined || !userData?.role) {
    return <LoaderUI />;
  }
  
  // User has role, show content
  return <StreamClientProvider>{children}</StreamClientProvider>;
} 