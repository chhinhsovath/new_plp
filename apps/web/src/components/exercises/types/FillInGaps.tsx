"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FillInGapsExerciseProps {
  content: {
    text: string;
    textKh?: string;
    gaps: number; // Number of gaps in the text
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: string[] | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    gaps: string[];
    explanation?: string;
  } | null;
}

export function FillInGapsExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: FillInGapsExerciseProps) {
  const [answers, setAnswers] = useState<string[]>(
    userAnswer || Array(content.gaps).fill("")
  );

  useEffect(() => {
    onAnswerChange(answers);
  }, [answers, onAnswerChange]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Split text by gaps (marked with ___)
  const renderTextWithGaps = (text: string, isKhmer?: boolean) => {
    const parts = text.split(/___/);
    const elements: JSX.Element[] = [];

    parts.forEach((part, index) => {
      elements.push(
        <span key={`text-${index}`} className={isKhmer ? "text-muted-foreground" : ""}>
          {part}
        </span>
      );

      if (index < parts.length - 1) {
        const gapIndex = index;
        const userValue = answers[gapIndex] || "";
        const correctValue = solution?.gaps[gapIndex];
        const isGapCorrect = isSubmitted && correctValue && 
          userValue.toLowerCase().trim() === correctValue.toLowerCase().trim();
        const isGapIncorrect = isSubmitted && correctValue && 
          userValue.toLowerCase().trim() !== correctValue.toLowerCase().trim();

        elements.push(
          <span key={`gap-${index}`} className="inline-block mx-1">
            <Input
              type="text"
              value={userValue}
              onChange={(e) => handleAnswerChange(gapIndex, e.target.value)}
              disabled={isSubmitted}
              className={cn(
                "inline-block w-32 h-8 text-center",
                isSubmitted && {
                  "border-green-500 bg-green-50": isGapCorrect,
                  "border-red-500 bg-red-50": isGapIncorrect,
                }
              )}
              placeholder="..."
            />
            {isSubmitted && correctValue && !isGapCorrect && (
              <span className="block text-xs text-green-600 mt-1">
                Correct: {correctValue}
              </span>
            )}
          </span>
        );
      }
    });

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Text with gaps */}
      <div className="text-lg leading-relaxed">
        <div className="mb-2">{renderTextWithGaps(content.text)}</div>
        {content.textKh && (
          <div className="text-base">{renderTextWithGaps(content.textKh, true)}</div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground">
        Fill in the blanks with the appropriate words
      </p>

      {/* Explanation */}
      {isSubmitted && solution?.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {solution.explanation}
          </p>
        </div>
      )}
    </div>
  );
}