"use client";

import { useState } from "react";
import { SliderExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider as SliderUI } from "@/components/ui/slider";

interface SliderProps {
  exercise: SliderExercise;
  onSubmit: (answer: number) => void;
  userAnswer?: number;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export function Slider({ exercise, onSubmit, userAnswer, isCorrect, showFeedback }: SliderProps) {
  const [value, setValue] = useState(userAnswer ?? exercise.content.min);

  const handleSubmit = () => {
    onSubmit(value);
  };

  const formatValue = (val: number) => {
    return exercise.content.unit ? `${val} ${exercise.content.unit}` : val.toString();
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
        <p className="text-gray-600 mb-6">{exercise.content.question}</p>

        <div className="mb-8">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-blue-600">
              {formatValue(value)}
            </span>
          </div>

          <div className="px-4">
            <SliderUI
              value={[value]}
              onValueChange={(values) => setValue(values[0])}
              min={exercise.content.min}
              max={exercise.content.max}
              step={exercise.content.step || 1}
              disabled={showFeedback}
              className="mb-4"
            />

            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatValue(exercise.content.min)}</span>
              <span>{formatValue(exercise.content.max)}</span>
            </div>

            {exercise.content.labels && (
              <div className="mt-4 flex justify-between">
                {Object.entries(exercise.content.labels).map(([labelValue, labelText]) => {
                  const position = ((Number(labelValue) - exercise.content.min) / 
                    (exercise.content.max - exercise.content.min)) * 100;
                  
                  return (
                    <div
                      key={labelValue}
                      className="absolute text-xs text-gray-500"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      {labelText}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {showFeedback && (
          <div className={`p-4 rounded-lg mb-4 ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect ? (
              <p>Correct! Well done!</p>
            ) : (
              <div>
                <p className="mb-2">Not quite right.</p>
                <p>The correct answer is: <strong>{formatValue(exercise.solution.correctValue)}</strong></p>
                {exercise.solution.tolerance && (
                  <p className="text-sm mt-1">
                    (Acceptable range: {formatValue(exercise.solution.correctValue - exercise.solution.tolerance)} - {formatValue(exercise.solution.correctValue + exercise.solution.tolerance)})
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={showFeedback}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
}