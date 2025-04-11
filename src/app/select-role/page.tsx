"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserIcon, Users, BriefcaseIcon } from "lucide-react";
import toast from "react-hot-toast";
import LoaderUI from "@/components/LoaderUI";

export default function SelectRolePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateRole = useMutation(api.users.updateUserRole);
  const createUserWithRole = useMutation(api.users.createUserWithRole);
  
  // Get user info to check if they already have a role
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Debug logging
  useEffect(() => {
    if (isLoaded && user) {
      console.log("User authenticated:", user.id);
      console.log("User data from Convex:", userData);
    }
  }, [isLoaded, user, userData]);

  // If user already has a role, redirect to home
  useEffect(() => {
    if (userData?.role && isLoaded) {
      console.log("User already has role:", userData.role);
      const welcomeToastShown = sessionStorage.getItem(`welcome_toast_${user?.id}`);
      if (!welcomeToastShown) {
        toast.success(`Welcome! You're logged in as ${userData.role}`);
        sessionStorage.setItem(`welcome_toast_${user?.id}`, 'true');
      }
      router.push("/");
    }
  }, [userData?.role, isLoaded, router, user?.id]);

  // Prevent scrolling
  useEffect(() => {
    // Add overflow-hidden to body
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleRoleSelect = async (role: "candidate" | "interviewer") => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      console.log("Setting user role to:", role);
      
      // If the user exists in the database, update their role
      if (userData) {
        await updateRole({
          clerkId: user.id,
          role,
        });
      } else {
        // If the user doesn't exist, create them with a role
        await createUserWithRole({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          image: user.imageUrl,
          role,
        });
      }
      
      // Store that we've shown the role selection success toast
      sessionStorage.setItem(`role_selected_toast_${user.id}`, 'true');
      router.push("/");
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth or user data
  if (!isLoaded || isSubmitting) {
    return (
      <LoaderUI />
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-muted/50 to-background">
      <Card className="w-[90%] max-w-sm shadow-lg">
        <CardHeader className="space-y-2 pt-4 px-4">
          <div className="flex justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-lg font-bold text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center text-xs">
            Choose how you want to use the platform
          </CardDescription>
          {user && (
            <p className="text-xs text-muted-foreground text-center">
              Hello, {user.firstName || user.username || "there"}!
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 group hover:border-primary relative"
              onClick={() => handleRoleSelect("candidate")}
            >
              <div className="flex flex-col items-center gap-1 w-full">
                <UserIcon className="h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Candidate</div>
                  <div className="text-xs text-muted-foreground">
                    Looking for interview opportunities
                  </div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 group hover:border-primary relative"
              onClick={() => handleRoleSelect("interviewer")}
            >
              <div className="flex flex-col items-center gap-1 w-full">
                <BriefcaseIcon className="h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Interviewer</div>
                  <div className="text-xs text-muted-foreground">
                    Conducting interviews
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 