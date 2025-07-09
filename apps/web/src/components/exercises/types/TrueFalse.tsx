"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface TrueFalseExerciseProps {
  content: {
    statement: string;
    statementKh?: string;
    imageUrl?: string;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: boolean | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    correct: boolean;
    explanation?: string;
  } | null;
}

export function TrueFalseExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: TrueFalseExerciseProps) {
  const handleChange = (value: string) => {
    onAnswerChange(value === "true");
  };

  const getOptionStyles = (value: boolean) => {
    const isSelected = userAnswer === value;
    const isCorrectOption = solution?.correct === value;
    const showCorrect = isSubmitted && isCorrectOption;
    const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

    return cn(
      "relative flex items-center space-x-3 rounded-lg border p-4 transition-all",
      isSubmitted && {
        "border-green-500 bg-green-50": showCorrect,
        "border-red-500 bg-red-50": showIncorrect,
        "opacity-60": !isSelected && !isCorrectOption,
      },
      !isSubmitted && "hover:bg-muted/50 cursor-pointer"
    );
  };

  return (
    <div className="space-y-6">
      {/* Statement */}
      <div className="space-y-2">
        <p className="text-lg font-medium">{content.statement}</p>
        {content.statementKh && (
          <p className="text-base text-muted-foreground">{content.statementKh}</p>
        )}
      </div>

      {/* Image (if provided) */}
      {content.imageUrl && (
        <div className="flex justify-center">
          <img
            src={content.imageUrl}
            alt="Statement illustration"
            className="max-w-md rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* True/False Options */}
      <RadioGroup
        value={userAnswer?.toString() || ""}
        onValueChange={handleChange}
        disabled={isSubmitted}
        className="space-y-3"
      >
        {/* True Option */}
        <div className={getOptionStyles(true)}>
          <RadioGroupItem value="true" id="true" />
          <Label
            htmlFor="true"
            className={cn(
              "flex-1 cursor-pointer text-base flex items-center gap-3",
              isSubmitted && "cursor-default"
            )}
          >
            <span className="text-2xl">✓</span>
            <div>
              <span className="font-medium">True</span>
              <span className="text-sm text-muted-foreground ml-2">ពិត</span>
            </div>
          </Label>
          
          {isSubmitted && userAnswer === true && solution?.correct === true && (
            <CheckCircle2 className="h-5 w-5 text-green-600 absolute right-4" />
          )}
          {isSubmitted && userAnswer === true && solution?.correct === false && (
            <XCircle className="h-5 w-5 text-red-600 absolute right-4" />
          )}
        </div>

        {/* False Option */}
        <div className={getOptionStyles(false)}>
          <RadioGroupItem value="false" id="false" />
          <Label
            htmlFor="false"
            className={cn(
              "flex-1 cursor-pointer text-base flex items-center gap-3",
              isSubmitted && "cursor-default"
            )}
          >
            <span className="text-2xl">✗</span>
            <div>
              <span className="font-medium">False</span>
              <span className="text-sm text-muted-foreground ml-2">មិនពិត</span>
            </div>
          </Label>
          
          {isSubmitted && userAnswer === false && solution?.correct === false && (
            <CheckCircle2 className="h-5 w-5 text-green-600 absolute right-4" />
          )}
          {isSubmitted && userAnswer === false && solution?.correct === true && (
            <XCircle className="h-5 w-5 text-red-600 absolute right-4" />
          )}
        </div>
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