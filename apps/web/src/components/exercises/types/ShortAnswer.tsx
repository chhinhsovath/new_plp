"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface ShortAnswerExerciseProps {
  content: {
    question: string;
    questionKh?: string;
    imageUrl?: string;
    maxLength?: number;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    acceptableAnswers: string[];
    explanation?: string;
  } | null;
}

export function ShortAnswerExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: ShortAnswerExerciseProps) {
  const [answer, setAnswer] = useState(userAnswer || "");
  const maxLength = content.maxLength || 200;

  useEffect(() => {
    onAnswerChange(answer);
  }, [answer, onAnswerChange]);

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="space-y-2">
        <p className="text-lg font-medium">{content.question}</p>
        {content.questionKh && (
          <p className="text-base text-muted-foreground">{content.questionKh}</p>
        )}
      </div>

      {/* Image (if provided) */}
      {content.imageUrl && (
        <div className="flex justify-center">
          <img
            src={content.imageUrl}
            alt="Question illustration"
            className="max-w-md rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* Answer Input */}
      <div className="space-y-2">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitted}
          placeholder="Type your answer here..."
          className={cn(
            "min-h-[100px] resize-none",
            isSubmitted && {
              "border-green-500 bg-green-50": isCorrect,
              "border-red-500 bg-red-50": !isCorrect,
            }
          )}
          maxLength={maxLength}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Write a short answer in 1-3 sentences
          </p>
          <span className="text-xs text-muted-foreground">
            {answer.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* Correct Answers (shown after submission) */}
      {isSubmitted && solution && !isCorrect && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                Acceptable answers:
              </p>
              <ul className="space-y-1">
                {solution.acceptableAnswers.map((acceptableAnswer, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    • {acceptableAnswer}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {isSubmitted && solution?.explanation && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Note:</span> {solution.explanation}
          </p>
        </div>
      )}
    </div>
  );
}