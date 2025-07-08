"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FillInGapsExercise } from "./types";

interface FillInGapsProps {
  exercise: FillInGapsExercise;
  onSubmit?: (answers: Record<string, string>, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function FillInGaps({ exercise, onSubmit, disabled }: FillInGapsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleInputChange = (gapId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [gapId]: value }));
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    // Check if all answers are correct
    const isCorrect = exercise.content.gaps.every(gap => 
      answers[gap.id]?.toLowerCase().trim() === 
      exercise.solution.answers[gap.id]?.toLowerCase().trim()
    );
    
    onSubmit(answers, isCorrect);
  };

  // Parse the text and replace gaps with input fields
  const renderTextWithGaps = () => {
    let text = exercise.content.text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort gaps by position
    const sortedGaps = [...exercise.content.gaps].sort((a, b) => a.position - b.position);

    sortedGaps.forEach((gap, index) => {
      // Add text before the gap
      elements.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, gap.position)}
        </span>
      );

      // Add the input field
      elements.push(
        <Input
          key={`gap-${gap.id}`}
          type="text"
          value={answers[gap.id] || ""}
          onChange={(e) => handleInputChange(gap.id, e.target.value)}
          disabled={disabled}
          className="inline-block w-32 mx-1 px-2 py-1 h-8"
          placeholder="___"
        />
      );

      lastIndex = gap.position + (gap.length || 0);
    });

    // Add remaining text
    elements.push(
      <span key="text-end">{text.substring(lastIndex)}</span>
    );

    return elements;
  };

  const allGapsFilled = exercise.content.gaps.every(gap => answers[gap.id]?.trim());

  return (
    <div className="space-y-6">
      <div className="text-lg leading-relaxed">
        {renderTextWithGaps()}
      </div>

      {exercise.content.textKh && (
        <p className="text-gray-600 italic">{exercise.content.textKh}</p>
      )}

      {exercise.content.options && exercise.content.options.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Word bank:</p>
          <div className="flex flex-wrap gap-2">
            {exercise.content.options.map((option, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white border rounded-full text-sm"
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      )}

      {!disabled && (
        <Button 
          onClick={handleSubmit} 
          disabled={!allGapsFilled}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}