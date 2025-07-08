"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Exercise, ExerciseResult } from "./types";

interface ExerciseWrapperProps {
  exercise: Exercise;
  onComplete: (result: ExerciseResult) => void;
  onNext?: () => void;
  children: React.ReactNode;
}

export function ExerciseWrapper({ 
  exercise, 
  onComplete, 
  onNext,
  children 
}: ExerciseWrapperProps) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!submitted) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const handleSubmit = (answer: any, isCorrect: boolean) => {
    setAttempts(prev => prev + 1);
    setSubmitted(true);

    const score = isCorrect ? exercise.points : 0;
    const exerciseResult: ExerciseResult = {
      correct: isCorrect,
      score,
      feedback: isCorrect 
        ? "Great job! You got it right!" 
        : "Not quite right. Try again!",
    };

    setResult(exerciseResult);
    onComplete(exerciseResult);
  };

  const handleReset = () => {
    setSubmitted(false);
    setResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div>
            <CardTitle>{exercise.title}</CardTitle>
            {exercise.titleKh && (
              <CardDescription className="text-lg mt-1">
                {exercise.titleKh}
              </CardDescription>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Time: {formatTime(timeSpent)}</p>
            <p className="text-sm font-medium">{exercise.points} points</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">{exercise.instructions}</p>
          {exercise.instructionsKh && (
            <p className="text-sm text-gray-600">{exercise.instructionsKh}</p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {React.cloneElement(children as React.ReactElement, {
          onSubmit: handleSubmit,
          disabled: submitted,
          exercise,
        })}

        {result && (
          <Alert 
            variant={result.correct ? "default" : "destructive"}
            className="mt-6"
          >
            <div className="flex items-center gap-2">
              {result.correct ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="font-medium">
                {result.feedback}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            {submitted && !result?.correct && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          {submitted && result?.correct && onNext && (
            <Button onClick={onNext}>
              Next Exercise
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {attempts > 0 && (
          <p className="text-xs text-gray-500 mt-4">
            Attempts: {attempts}
          </p>
        )}
      </CardContent>
    </Card>
  );
}