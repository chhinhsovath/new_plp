"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface MultipleChoiceExerciseProps {
  content: {
    question: string;
    questionKh?: string;
    options: Array<{
      id: string;
      text: string;
      textKh?: string;
    }>;
    imageUrl?: string;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    correct: string;
    explanation?: string;
  } | null;
}

export function MultipleChoiceExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: MultipleChoiceExerciseProps) {
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

      {/* Options */}
      <RadioGroup
        value={userAnswer || ""}
        onValueChange={onAnswerChange}
        disabled={isSubmitted}
        className="space-y-3"
      >
        {content.options.map((option) => {
          const isSelected = userAnswer === option.id;
          const isCorrectOption = solution?.correct === option.id;
          const showCorrect = isSubmitted && isCorrectOption;
          const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

          return (
            <div
              key={option.id}
              className={cn(
                "relative flex items-center space-x-3 rounded-lg border p-4 transition-all",
                isSubmitted && {
                  "border-green-500 bg-green-50": showCorrect,
                  "border-red-500 bg-red-50": showIncorrect,
                  "opacity-60": !isSelected && !isCorrectOption,
                },
                !isSubmitted && "hover:bg-muted/50 cursor-pointer"
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label
                htmlFor={option.id}
                className={cn(
                  "flex-1 cursor-pointer text-base",
                  isSubmitted && "cursor-default"
                )}
              >
                <span className="block">{option.text}</span>
                {option.textKh && (
                  <span className="block text-sm text-muted-foreground mt-1">
                    {option.textKh}
                  </span>
                )}
              </Label>
              
              {/* Feedback icons */}
              {showCorrect && (
                <CheckCircle2 className="h-5 w-5 text-green-600 absolute right-4" />
              )}
              {showIncorrect && (
                <XCircle className="h-5 w-5 text-red-600 absolute right-4" />
              )}
            </div>
          );
        })}
      </RadioGroup>

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