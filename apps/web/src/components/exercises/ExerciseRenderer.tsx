"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Volume2,
} from "lucide-react";
import confetti from "canvas-confetti";

// Exercise type components
import { MultipleChoiceExercise } from "./types/MultipleChoice";
import { FillInGapsExercise } from "./types/FillInGaps";
import { DragDropExercise } from "./types/DragDrop";
import { MatchingExercise } from "./types/Matching";
import { TrueFalseExercise } from "./types/TrueFalse";
import { ShortAnswerExercise } from "./types/ShortAnswer";
import { ListeningExercise } from "./types/Listening";
import { DrawingExercise } from "./types/Drawing";
import { SortingExercise } from "./types/Sorting";
import { SequencingExercise } from "./types/Sequencing";
import { LabelingExercise } from "./types/Labeling";
import { FindWordExercise } from "./types/FindWord";
import { FindLetterExercise } from "./types/FindLetter";
import { ChooseWordExercise } from "./types/ChooseWord";
import { InputExercise } from "./types/Input";
import { SelectSentenceExercise } from "./types/SelectSentence";
import { WriteAnswerExercise } from "./types/WriteAnswer";

export interface Exercise {
  id: string;
  type: string;
  title: string;
  titleKh?: string;
  instructions: string;
  content: any;
  solution: any;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
}

interface ExerciseRendererProps {
  exercise: Exercise;
  onComplete?: (score: number, isCorrect: boolean) => void;
  showSolution?: boolean;
  practiceMode?: boolean;
}

export function ExerciseRenderer({
  exercise,
  onComplete,
  showSolution = false,
  practiceMode = false,
}: ExerciseRendererProps) {
  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer) {
      toast({
        title: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    setAttempts(attempts + 1);
    const correct = checkAnswer(exercise.type, userAnswer, exercise.solution);
    setIsCorrect(correct);
    setIsSubmitted(true);

    // Calculate score based on attempts and time
    let calculatedScore = exercise.points;
    if (!correct) {
      calculatedScore = 0;
    } else if (attempts > 0) {
      calculatedScore = Math.max(exercise.points * 0.5, exercise.points - attempts * 2);
    }
    setScore(Math.round(calculatedScore));

    // Trigger confetti for correct answers
    if (correct) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    // Save attempt if not in practice mode
    if (!practiceMode) {
      try {
        await api.post(`/exercises/${exercise.id}/submit`, {
          answer: userAnswer,
          timeSpent,
          attempts: attempts + 1,
        });
      } catch (error) {
        console.error("Error submitting exercise:", error);
      }
    }

    if (onComplete) {
      onComplete(calculatedScore, correct);
    }
  }, [userAnswer, exercise, attempts, timeSpent, practiceMode, onComplete, toast]);

  const handleRetry = () => {
    setUserAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setScore(0);
    setShowHint(false);
  };

  const renderExercise = () => {
    const props = {
      content: exercise.content,
      onAnswerChange: setUserAnswer,
      userAnswer,
      isSubmitted,
      isCorrect,
      solution: showSolution || isSubmitted ? exercise.solution : null,
    };

    switch (exercise.type) {
      case "MULTIPLE_CHOICE":
        return <MultipleChoiceExercise {...props} />;
      case "FILL_IN_GAPS":
        return <FillInGapsExercise {...props} />;
      case "DRAG_DROP":
        return <DragDropExercise {...props} />;
      case "MATCHING":
        return <MatchingExercise {...props} />;
      case "TRUE_FALSE":
        return <TrueFalseExercise {...props} />;
      case "SHORT_ANSWER":
        return <ShortAnswerExercise {...props} />;
      case "LISTENING":
        return <ListeningExercise {...props} />;
      case "DRAWING":
        return <DrawingExercise {...props} />;
      case "SORTING":
        return <SortingExercise {...props} />;
      case "SEQUENCING":
        return <SequencingExercise {...props} />;
      case "LABELING":
        return <LabelingExercise {...props} />;
      case "FIND_WORD":
        return <FindWordExercise {...props} />;
      case "FIND_LETTER":
        return <FindLetterExercise {...props} />;
      case "CHOOSE_WORD":
        return <ChooseWordExercise {...props} />;
      case "INPUT":
        return <InputExercise {...props} />;
      case "SELECT_SENTENCE":
        return <SelectSentenceExercise {...props} />;
      case "WRITE_ANSWER":
        return <WriteAnswerExercise {...props} />;
      default:
        return <div>Unsupported exercise type: {exercise.type}</div>;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">{exercise.title}</CardTitle>
            {exercise.titleKh && (
              <CardDescription className="text-base sm:text-lg">{exercise.titleKh}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={
              exercise.difficulty === "EASY" ? "secondary" :
              exercise.difficulty === "MEDIUM" ? "default" :
              "destructive"
            }>
              {exercise.difficulty}
            </Badge>
            <Badge variant="outline">
              <Trophy className="h-3 w-3 mr-1" />
              {exercise.points} pts
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5" />
            <p className="text-xs sm:text-sm">{exercise.instructions}</p>
          </div>
        </div>

        {/* Timer and Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}</span>
          </div>
          {attempts > 0 && (
            <span>Attempts: {attempts}</span>
          )}
        </div>

        {/* Exercise Content */}
        <div className="min-h-[200px]">
          {renderExercise()}
        </div>

        {/* Hint (if available) */}
        {exercise.content.hint && !isSubmitted && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
          </div>
        )}
        
        {showHint && exercise.content.hint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{exercise.content.hint}</p>
          </div>
        )}

        {/* Result Feedback */}
        {isSubmitted && (
          <div className={cn(
            "rounded-lg p-4 flex items-center gap-3",
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          )}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-semibold">Excellent! That's correct!</p>
                  <p className="text-sm">You earned {score} points</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-semibold">Not quite right</p>
                  <p className="text-sm">Review the solution and try again</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div>
            {isSubmitted && !isCorrect && (
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!isSubmitted ? (
              <Button onClick={handleSubmit} disabled={!userAnswer}>
                Submit Answer
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button variant="default">
                Next Exercise
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to check answers
function checkAnswer(type: string, userAnswer: any, solution: any): boolean {
  switch (type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE":
      return userAnswer === solution.correct;
    
    case "FILL_IN_GAPS":
      return solution.gaps.every((gap: any, index: number) => 
        gap.toLowerCase().trim() === userAnswer[index]?.toLowerCase().trim()
      );
    
    case "MATCHING":
      return Object.entries(solution.pairs).every(([left, right]) => 
        userAnswer[left] === right
      );
    
    case "SHORT_ANSWER":
    case "WRITE_ANSWER":
      return solution.acceptableAnswers.some((answer: string) => 
        answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
      );
    
    case "DRAG_DROP":
    case "SORTING":
    case "SEQUENCING":
      return JSON.stringify(userAnswer) === JSON.stringify(solution.correctOrder);
    
    case "FIND_WORD":
    case "FIND_LETTER":
      return solution.targets.every((target: any) => 
        userAnswer.includes(target)
      );
    
    default:
      return false;
  }
}