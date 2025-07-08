"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ExerciseWrapper, 
  Exercise, 
  ExerciseResult, 
  ExerciseType,
  exerciseComponents 
} from "@/components/exercises";
import { 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  Trophy,
  Star,
  Target
} from "lucide-react";

// Mock exercises for demonstration - in real app, fetch from API
const mockExercises: Exercise[] = [
  {
    id: "ex1",
    type: ExerciseType.MULTIPLE_CHOICE,
    title: "Question 1",
    instructions: "What is 5 + 3?",
    points: 10,
    difficulty: "EASY",
    content: {
      question: "What is 5 + 3?",
      options: ["6", "7", "8", "9"],
    },
    solution: {
      correctAnswer: 2,
    },
  } as any,
  {
    id: "ex2",
    type: ExerciseType.TRUE_FALSE,
    title: "Question 2",
    instructions: "Is this statement true or false?",
    points: 5,
    difficulty: "EASY",
    content: {
      statement: "5 + 5 = 10",
    },
    solution: {
      isTrue: true,
    },
  } as any,
  {
    id: "ex3",
    type: ExerciseType.FILL_IN_GAPS,
    title: "Question 3",
    instructions: "Fill in the missing number",
    points: 15,
    difficulty: "MEDIUM",
    content: {
      text: "The sum of 7 and ___ equals 12.",
      gaps: [{ id: "gap1", position: 17 }],
    },
    solution: {
      answers: { gap1: "5" },
    },
  } as any,
];

export default function LearnLessonPage() {
  const params = useParams();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [results, setResults] = useState<Record<string, ExerciseResult>>({});
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const ExerciseComponent = currentExercise ? exerciseComponents[currentExercise.type] : null;

  const handleExerciseComplete = async (result: ExerciseResult) => {
    const exerciseId = currentExercise.id;
    setResults(prev => ({ ...prev, [exerciseId]: result }));

    // Save progress to API
    try {
      await fetch("/api/exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          lessonId: params.lessonId,
          subjectId: params.subjectId,
          answer: result,
          timeSpent: 0, // Would track actual time
        }),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // All exercises completed
      setLessonCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    const totalPoints = exercises.reduce((sum, ex) => sum + ex.points, 0);
    const earnedPoints = Object.entries(results).reduce((sum, [exerciseId, result]) => {
      if (result.correct) {
        const exercise = exercises.find(ex => ex.id === exerciseId);
        return sum + (exercise?.points || 0);
      }
      return sum;
    }, 0);
    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    return { earnedPoints, totalPoints, percentage };
  };

  if (lessonCompleted) {
    const { earnedPoints, totalPoints, percentage } = calculateScore();
    const isPerfect = percentage === 100;

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              {isPerfect ? (
                <div className="relative">
                  <Trophy className="w-24 h-24 text-yellow-500" />
                  <div className="absolute -top-2 -right-2">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              ) : percentage >= 80 ? (
                <CheckCircle className="w-24 h-24 text-green-500" />
              ) : (
                <Target className="w-24 h-24 text-blue-500" />
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {isPerfect ? "Perfect Score!" : percentage >= 80 ? "Great Job!" : "Good Effort!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-5xl font-bold text-primary mb-2">{percentage}%</p>
              <p className="text-xl text-gray-600">
                You earned {earnedPoints} out of {totalPoints} points
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(results).filter(r => r.correct).length}
                </p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(results).filter(r => !r.correct).length}
                </p>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {exercises.length - Object.keys(results).length}
                </p>
                <p className="text-sm text-gray-600">Skipped</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/subjects/${params.subjectId}`)}
              >
                Back to Lessons
              </Button>
              <Button onClick={() => router.push(`/subjects/${params.subjectId}/lessons/${params.lessonId}`)}>
                Review Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Lesson Progress</h2>
          <Badge variant="secondary">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </Badge>
        </div>
        <Progress 
          value={(currentExerciseIndex / exercises.length) * 100} 
          className="h-3"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{Object.keys(results).length} completed</span>
          <span>
            {Object.entries(results).reduce((sum, [id, result]) => 
              sum + (result.correct ? exercises.find(e => e.id === id)?.points || 0 : 0), 0
            )} points earned
          </span>
        </div>
      </div>

      {/* Exercise indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {exercises.map((exercise, index) => {
          const result = results[exercise.id];
          const isCurrent = index === currentExerciseIndex;
          
          return (
            <button
              key={exercise.id}
              onClick={() => setCurrentExerciseIndex(index)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all font-medium
                ${isCurrent 
                  ? "bg-primary text-white scale-110" 
                  : result?.correct
                  ? "bg-green-500 text-white"
                  : result
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-600"
                }
              `}
            >
              {result?.correct ? (
                <CheckCircle className="w-5 h-5" />
              ) : result ? (
                <XCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Current exercise */}
      {currentExercise && ExerciseComponent && (
        <ExerciseWrapper
          exercise={currentExercise}
          onComplete={handleExerciseComplete}
          onNext={handleNext}
        >
          <ExerciseComponent exercise={currentExercise as any} />
        </ExerciseWrapper>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentExerciseIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!results[currentExercise?.id]}
        >
          {currentExerciseIndex === exercises.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}