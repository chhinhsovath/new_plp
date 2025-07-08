"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrueFalseExercise } from "./types";
import { Check, X } from "lucide-react";

interface TrueFalseProps {
  exercise: TrueFalseExercise;
  onSubmit?: (answer: boolean, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function TrueFalse({ exercise, onSubmit, disabled }: TrueFalseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (selectedAnswer === null || !onSubmit) return;
    
    const isCorrect = selectedAnswer === exercise.solution.isTrue;
    onSubmit(selectedAnswer, isCorrect);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{exercise.content.statement}</h3>
        {exercise.content.statementKh && (
          <p className="text-gray-600">{exercise.content.statementKh}</p>
        )}
        
        {exercise.content.imageUrl && (
          <img 
            src={exercise.content.imageUrl} 
            alt="Statement" 
            className="mt-4 rounded-lg max-w-full h-auto max-h-64 object-contain"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedAnswer(true)}
          disabled={disabled}
          className={`
            p-6 rounded-lg border-2 transition-all
            ${selectedAnswer === true 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          `}
        >
          <Check className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-lg font-medium">True</p>
          <p className="text-sm text-gray-600">ពិត</p>
        </button>

        <button
          onClick={() => setSelectedAnswer(false)}
          disabled={disabled}
          className={`
            p-6 rounded-lg border-2 transition-all
            ${selectedAnswer === false 
              ? 'border-red-500 bg-red-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          `}
        >
          <X className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <p className="text-lg font-medium">False</p>
          <p className="text-sm text-gray-600">មិនពិត</p>
        </button>
      </div>

      {!disabled && (
        <Button 
          onClick={handleSubmit} 
          disabled={selectedAnswer === null}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}