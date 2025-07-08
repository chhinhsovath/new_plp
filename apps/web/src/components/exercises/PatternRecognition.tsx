"use client";

import { useState } from "react";
import { PatternRecognitionExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, HelpCircle } from "lucide-react";

interface PatternRecognitionProps {
  exercise: PatternRecognitionExercise;
  onSubmit: (answer: string | number) => void;
  userAnswer?: string | number;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export function PatternRecognition({ 
  exercise, 
  onSubmit, 
  userAnswer, 
  isCorrect, 
  showFeedback 
}: PatternRecognitionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(userAnswer ?? null);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onSubmit(selectedAnswer);
    }
  };

  const renderItem = (item: string | number | { imageUrl: string }, index?: number) => {
    if (typeof item === "object" && "imageUrl" in item) {
      return (
        <img 
          src={item.imageUrl} 
          alt={`Pattern item ${index}`}
          className="w-full h-full object-contain"
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-2xl font-bold">{item}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">{exercise.title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{exercise.instructions}</p>

        <div className="mb-8">
          <div className="grid grid-cols-auto gap-4 items-center justify-center">
            {exercise.content.sequence.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index === exercise.content.missingIndex ? (
                  <div className="w-24 h-24 border-4 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
                    <HelpCircle className="w-8 h-8 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-gray-300 rounded-lg p-2 bg-white">
                    {renderItem(item, index)}
                  </div>
                )}
                {index < exercise.content.sequence.length - 1 && (
                  <span className="text-2xl text-gray-400">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {exercise.content.options && (
          <div>
            <p className="font-medium mb-3">Select the missing item:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exercise.content.options.map((option, index) => {
                const isSelected = selectedAnswer === option || 
                  (typeof option === "object" && typeof selectedAnswer === "object" && 
                   option.imageUrl === (selectedAnswer as any).imageUrl);
                const isCorrectOption = option === exercise.solution.answer ||
                  (typeof option === "object" && typeof exercise.solution.answer === "object" &&
                   option.imageUrl === (exercise.solution.answer as any).imageUrl);
                
                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && setSelectedAnswer(option)}
                    className={`h-24 border-2 rounded-lg p-2 transition-all ${
                      isSelected && !showFeedback
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      showFeedback && isSelected && isCorrectOption
                        ? "border-green-500 bg-green-50"
                        : ""
                    } ${
                      showFeedback && isSelected && !isCorrectOption
                        ? "border-red-500 bg-red-50"
                        : ""
                    } ${
                      showFeedback && !isSelected && isCorrectOption
                        ? "border-green-500 bg-green-50"
                        : ""
                    }`}
                    disabled={showFeedback}
                  >
                    {renderItem(option)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-lg ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect ? (
              <div>
                <p className="font-semibold mb-2">Correct!</p>
                {exercise.solution.rule && (
                  <p className="text-sm">Pattern rule: {exercise.solution.rule}</p>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-2">Not quite right. The correct answer is highlighted above.</p>
                {exercise.solution.rule && (
                  <p className="text-sm">Pattern rule: {exercise.solution.rule}</p>
                )}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="mt-6 w-full"
          disabled={showFeedback || selectedAnswer === null}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
}