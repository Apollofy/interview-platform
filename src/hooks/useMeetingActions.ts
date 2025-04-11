import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";

const useMeetingActions = () => {
  const router = useRouter();
  const client = useStreamVideoClient();

  const createInstantMeeting = async () => {
    if (!client) {
      toast.error("Video service not initialized. Please wait a moment...");
      return;
    }

    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: "Instant Meeting",
          },
        },
      });

      toast.success("Meeting Created");
      router.push(`/meeting/${call.id}`);
    } catch (error) {
      toast.error("Failed to create meeting");
    }
  };

  const joinMeeting = async (callId: string) => {
    if (!client) {
      toast.error("Video service not initialized. Please wait a moment...");
      return;
    }
    
    try {
      const { calls } = await client.queryCalls({ 
        filter_conditions: { id: callId } 
      });
      
      if (calls.length === 0) {
        toast.error("Meeting not found. Please check the meeting ID.");
        return;
      }
      
      router.push(`/meeting/${callId}`);
    } catch (error) {
      toast.error("Failed to join meeting");
    }
  };

  return { createInstantMeeting, joinMeeting };
};

export default useMeetingActions;