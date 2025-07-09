"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExerciseRenderer, Exercise } from "@/components/exercises/ExerciseRenderer";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExercisePageProps {
  params: {
    exerciseId: string;
  };
}

export default function ExercisePage({ params }: ExercisePageProps) {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedExercises, setRelatedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    fetchExercise();
  }, [params.exerciseId]);

  const fetchExercise = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch from the API
      // For now, using mock data
      const mockExercise: Exercise = {
        id: params.exerciseId,
        type: "MULTIPLE_CHOICE",
        title: "Basic Addition",
        titleKh: "ការបូកមូលដ្ឋាន",
        instructions: "Choose the correct answer to the math problem below.",
        difficulty: "EASY",
        points: 10,
        content: {
          question: "What is 5 + 3?",
          questionKh: "តើ ៥ + ៣ = ?",
          options: [
            { id: "1", text: "6", textKh: "៦" },
            { id: "2", text: "7", textKh: "៧" },
            { id: "3", text: "8", textKh: "៨" },
            { id: "4", text: "9", textKh: "៩" },
          ],
          hint: "Count on your fingers if you need to!",
        },
        solution: {
          correct: "3",
          explanation: "5 + 3 equals 8. You can think of it as starting with 5 and counting up 3 more: 6, 7, 8.",
        },
      };

      setExercise(mockExercise);

      // Mock related exercises
      setRelatedExercises([
        { ...mockExercise, id: "2", title: "Basic Subtraction" },
        { ...mockExercise, id: "3", title: "Basic Multiplication" },
      ]);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (score: number, isCorrect: boolean) => {
    console.log("Exercise completed:", { score, isCorrect });
    
    // In a real app, we'd save the result and potentially navigate to the next exercise
    // For now, just show a success message
    if (isCorrect) {
      setTimeout(() => {
        // Navigate to next exercise or back to lesson
        router.push("/dashboard");
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!exercise) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/subjects">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </Link>
      </div>

      {/* Exercise */}
      <ExerciseRenderer
        exercise={exercise}
        onComplete={handleComplete}
        practiceMode={false}
      />

      {/* Related Exercises */}
      {relatedExercises.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Related Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedExercises.map((related) => (
              <Link
                key={related.id}
                href={`/exercises/${related.id}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium">{related.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {related.type.replace(/_/g, " ").toLowerCase()}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    {related.difficulty}
                  </span>
                  <span className="text-sm font-medium">
                    {related.points} pts
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}