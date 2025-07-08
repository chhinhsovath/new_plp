"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface ShortAnswerExercise {
  id: string;
  type: "SHORT_ANSWER";
  title: string;
  titleKh?: string;
  instructions: string;
  instructionsKh?: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  content: {
    question: string;
    questionKh?: string;
    hint?: string;
    imageUrl?: string;
  };
  solution: {
    acceptableAnswers: string[];
    caseSensitive?: boolean;
    explanation?: string;
  };
}

interface ShortAnswerProps {
  exercise: ShortAnswerExercise;
  onSubmit?: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function ShortAnswer({ exercise, onSubmit, disabled }: ShortAnswerProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim() || disabled) return;

    const userAnswer = exercise.solution.caseSensitive 
      ? answer.trim() 
      : answer.trim().toLowerCase();
    
    const acceptableAnswers = exercise.solution.caseSensitive 
      ? exercise.solution.acceptableAnswers 
      : exercise.solution.acceptableAnswers.map(a => a.toLowerCase());
    
    const correct = acceptableAnswers.includes(userAnswer);
    setIsCorrect(correct);
    setSubmitted(true);
    
    if (onSubmit) {
      onSubmit(answer.trim(), correct);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitted && !disabled) {
      handleSubmit();
    }
  };

  const reset = () => {
    setAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
  };

  // Reset when exercise changes
  if (!submitted && answer && !exercise.content.question.includes(answer)) {
    reset();
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 space-y-4">
        <div>
          <p className="text-lg font-medium mb-2">{exercise.content.question}</p>
          {exercise.content.questionKh && (
            <p className="text-gray-600 mb-4">{exercise.content.questionKh}</p>
          )}
          
          {exercise.content.imageUrl && (
            <img 
              src={exercise.content.imageUrl} 
              alt="Exercise" 
              className="w-full max-w-md mx-auto mb-4 rounded-lg"
            />
          )}
          
          {exercise.content.hint && !submitted && (
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Hint:</strong> {exercise.content.hint}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">Your Answer:</Label>
          <Input
            id="answer"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            disabled={submitted || disabled}
            className={submitted ? (isCorrect ? "border-green-500" : "border-red-500") : ""}
          />
        </div>

        {!submitted && !disabled && (
          <Button 
            onClick={handleSubmit} 
            disabled={!answer.trim()}
            className="w-full"
          >
            Submit Answer
          </Button>
        )}

        {submitted && (
          <Alert className={isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <AlertDescription>
                {isCorrect ? (
                  "Correct! Well done!"
                ) : (
                  <>
                    Incorrect. The correct answer{exercise.solution.acceptableAnswers.length > 1 ? "s are" : " is"}: {" "}
                    <strong>{exercise.solution.acceptableAnswers.join(" or ")}</strong>
                  </>
                )}
                {exercise.solution.explanation && (
                  <p className="mt-2">{exercise.solution.explanation}</p>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}