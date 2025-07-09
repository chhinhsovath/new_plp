import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface ProgressData {
  overall: number;
  subjects: Array<{
    id: string;
    name: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
  recentActivity: Array<{
    date: string;
    exercises: number;
    minutes: number;
  }>;
  stats: {
    totalExercises: number;
    totalTimeSpent: number;
    averageScore: number;
    streak: number;
  };
}

export function useProgressData(userId?: string) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/progress${userId ? `?userId=${userId}` : ""}`);
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [userId]);

  return { data, loading, error };
}