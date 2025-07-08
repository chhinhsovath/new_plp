"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";

interface LongAnswerExercise {
  id: string;
  type: "LONG_ANSWER";
  title: string;
  titleKh?: string;
  instructions: string;
  instructionsKh?: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  content: {
    question: string;
    questionKh?: string;
    minWords?: number;
    maxWords?: number;
    rubric?: string[];
  };
  solution: {
    sampleAnswer?: string;
    keyPoints?: string[];
  };
}

interface LongAnswerProps {
  exercise: LongAnswerExercise;
  onSubmit?: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function LongAnswer({ exercise, onSubmit, disabled }: LongAnswerProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleChange = (value: string) => {
    setAnswer(value);
    setWordCount(countWords(value));
  };

  const handleSubmit = () => {
    if (!answer.trim() || disabled) return;
    
    setSubmitted(true);
    if (onSubmit) {
      // For long answer, we can't automatically determine if it's correct
      // This would need teacher review
      onSubmit(answer.trim(), true);
    }
  };

  const isWithinWordLimit = () => {
    if (exercise.content.minWords && wordCount < exercise.content.minWords) return false;
    if (exercise.content.maxWords && wordCount > exercise.content.maxWords) return false;
    return true;
  };

  const reset = () => {
    setAnswer("");
    setSubmitted(false);
    setWordCount(0);
  };

  // Reset when exercise changes
  if (!submitted && answer && !exercise.content.question.includes(answer.substring(0, 20))) {
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
          
          {exercise.content.rubric && exercise.content.rubric.length > 0 && (
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Grading Criteria:</strong>
                <ul className="list-disc list-inside mt-2">
                  {exercise.content.rubric.map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="essay">Your Answer:</Label>
            <div className="flex items-center gap-4 text-sm">
              <span className={`font-medium ${
                !isWithinWordLimit() ? "text-red-600" : "text-gray-600"
              }`}>
                {wordCount} words
              </span>
              {(exercise.content.minWords || exercise.content.maxWords) && (
                <span className="text-gray-500">
                  {exercise.content.minWords && exercise.content.maxWords ? (
                    `(${exercise.content.minWords}-${exercise.content.maxWords} words required)`
                  ) : exercise.content.minWords ? (
                    `(min ${exercise.content.minWords} words)`
                  ) : (
                    `(max ${exercise.content.maxWords} words)`
                  )}
                </span>
              )}
            </div>
          </div>
          
          <Textarea
            id="essay"
            value={answer}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write your answer here..."
            disabled={submitted || disabled}
            rows={10}
            className={`resize-none ${
              submitted ? "bg-gray-50" : ""
            } ${!isWithinWordLimit() && answer ? "border-red-500" : ""}`}
          />
        </div>

        {!submitted && !disabled && (
          <Button 
            onClick={handleSubmit} 
            disabled={!answer.trim() || !isWithinWordLimit()}
            className="w-full"
          >
            Submit Answer
          </Button>
        )}

        {submitted && (
          <Alert className="border-blue-500 bg-blue-50">
            <AlertDescription>
              Your answer has been submitted for review. Word count: {wordCount}
            </AlertDescription>
          </Alert>
        )}

        {submitted && exercise.solution.sampleAnswer && (
          <Alert>
            <AlertDescription>
              <strong>Sample Answer:</strong>
              <p className="mt-2 whitespace-pre-wrap">{exercise.solution.sampleAnswer}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}