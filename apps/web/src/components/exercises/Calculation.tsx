"use client";

import { useState } from "react";
import { CalculationExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

interface CalculationProps {
  exercise: CalculationExercise;
  onSubmit: (answer: number) => void;
  userAnswer?: number;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export function Calculation({ exercise, onSubmit, userAnswer, isCorrect, showFeedback }: CalculationProps) {
  const [answer, setAnswer] = useState(userAnswer?.toString() || "");
  const [workspace, setWorkspace] = useState("");

  const handleSubmit = () => {
    const numericAnswer = parseFloat(answer);
    if (!isNaN(numericAnswer)) {
      onSubmit(numericAnswer);
    }
  };

  // Replace variables in expression with their values
  const getDisplayExpression = () => {
    let expression = exercise.content.expression;
    if (exercise.content.variables) {
      Object.entries(exercise.content.variables).forEach(([variable, value]) => {
        expression = expression.replace(new RegExp(`\\b${variable}\\b`, 'g'), value.toString());
      });
    }
    return expression;
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{exercise.title}</h3>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-xl font-mono text-center">{getDisplayExpression()}</p>
        </div>

        {exercise.content.showWorkspace && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show your work (optional)
            </label>
            <textarea
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="w-full p-3 border rounded-lg min-h-[100px] font-mono text-sm"
              placeholder="Write your calculations here..."
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <Input
            type="number"
            step="any"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="text-lg"
            disabled={showFeedback}
          />
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
                <p>The correct answer is: <strong>{exercise.solution.answer}</strong></p>
                {exercise.solution.steps && (
                  <div className="mt-3">
                    <p className="font-semibold mb-1">Solution steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {exercise.solution.steps.map((step, index) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={showFeedback || !answer}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
}