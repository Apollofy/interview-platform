"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "react-hot-toast";

export default function Home() {
  const { isInterviewer, isLoading, isCandidate, hasRole } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">("start");
  const streamClient = useStreamVideoClient();

  // Redirect to role selection if user has no role
  useEffect(() => {
    if (!isLoading && !hasRole) {
      console.log("No role detected in Home page, redirecting to role selection");
      router.push("/select-role");
    }
  }, [isLoading, hasRole, router]);

  const handleQuickAction = (title: string) => {
    if (!streamClient) {
      toast.error("Video service is initializing. Please try again in a moment.");
      return;
    }
    
    switch(title){
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  // Show loading while checking role or redirecting
  if (isLoading || !hasRole) return <LoaderUI />;
  
  return (
    <div className="container max-w-7xl mx-auto p-6">
       <div className="rounded-lg bg-card p-6 border shadow-sm mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-200 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-2">
          {isInterviewer
            ? "Manage your interviews and review candidates effectively"
            : "Access your upcoming interviews and preparations"}
        </p>
      </div>

      {isInterviewer?(
        <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_ACTIONS.map((action)=>(
            <ActionCard
            key={action.title}
            action={action}
            onClick={()=>handleQuickAction(action.title)}
            />
          ))}
        </div>
        <MeetingModal
        isOpen={showModal}
        onClose={()=>setShowModal(false)}
        title={modalType==="start"?"Start Meeting":"Join Meeting"}
        isJoinMeeting={modalType==="join"}
        />

        </>
      ):(
        <>
        <div>
          candidate page
        </div>
        </>
      )}
    </div>
  );
}
