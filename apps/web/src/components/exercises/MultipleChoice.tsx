"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultipleChoiceExercise } from "./types";

interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  onSubmit?: (answer: number, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function MultipleChoice({ exercise, onSubmit, disabled }: MultipleChoiceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedAnswer || !onSubmit) return;
    
    const answerIndex = parseInt(selectedAnswer);
    const isCorrect = answerIndex === exercise.solution.correctAnswer;
    onSubmit(answerIndex, isCorrect);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{exercise.content.question}</h3>
        {exercise.content.questionKh && (
          <p className="text-gray-600">{exercise.content.questionKh}</p>
        )}
        
        {exercise.content.imageUrl && (
          <img 
            src={exercise.content.imageUrl} 
            alt="Question" 
            className="mt-4 rounded-lg max-w-full h-auto max-h-64 object-contain"
          />
        )}
      </div>

      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={setSelectedAnswer}
        disabled={disabled}
      >
        <div className="space-y-3">
          {exercise.content.options.map((option, index) => (
            <label
              key={index}
              htmlFor={`option-${index}`}
              className={`
                flex items-center space-x-3 p-4 rounded-lg border cursor-pointer
                transition-colors hover:bg-gray-50
                ${selectedAnswer === index.toString() ? 'border-primary bg-primary/5' : 'border-gray-200'}
                ${disabled ? 'cursor-not-allowed opacity-60' : ''}
              `}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`}
                disabled={disabled}
              />
              <Label 
                htmlFor={`option-${index}`} 
                className="flex-1 cursor-pointer font-normal"
              >
                {option}
              </Label>
            </label>
          ))}
        </div>
      </RadioGroup>

      {!disabled && (
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedAnswer}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}