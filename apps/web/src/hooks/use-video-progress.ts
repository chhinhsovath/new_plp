import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface UseVideoProgressOptions {
  videoId: string;
  onComplete?: () => void;
}

export function useVideoProgress({ videoId, onComplete }: UseVideoProgressOptions) {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const updateProgress = useCallback(
    async (watchedSeconds: number, completed: boolean) => {
      if (updating) return;

      setUpdating(true);
      try {
        await api.post(`/videos/${videoId}/progress`, {
          watchedSeconds,
          completed,
        });

        if (completed && onComplete) {
          onComplete();
          toast({
            title: "Video Completed!",
            description: "Great job! You've finished watching this video.",
          });
        }
      } catch (error) {
        console.error("Error updating video progress:", error);
        // Silently fail - don't interrupt the viewing experience
      } finally {
        setUpdating(false);
      }
    },
    [videoId, updating, onComplete, toast]
  );

  return { updateProgress, updating };
}