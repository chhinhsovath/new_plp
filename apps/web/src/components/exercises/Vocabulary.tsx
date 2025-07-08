"use client";

import { useState } from "react";
import { VocabularyExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Image } from "lucide-react";

interface VocabularyProps {
  exercise: VocabularyExercise;
  onSubmit: (answer: number) => void;
  userAnswer?: number;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export function Vocabulary({ exercise, onSubmit, userAnswer, isCorrect, showFeedback }: VocabularyProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer ?? null);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">{exercise.title}</h3>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <h4 className="text-2xl font-bold">{exercise.content.word}</h4>
            {exercise.content.wordKh && (
              <span className="text-xl text-gray-600">({exercise.content.wordKh})</span>
            )}
          </div>

          {exercise.content.context && (
            <p className="text-gray-600 italic mb-3">"{exercise.content.context}"</p>
          )}

          {exercise.content.imageUrl && (
            <div className="mb-4">
              <img
                src={exercise.content.imageUrl}
                alt={exercise.content.word}
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {exercise.content.options && (
          <div className="space-y-2 mb-4">
            <p className="font-medium mb-2">Choose the correct definition:</p>
            {exercise.content.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = index === exercise.solution.correctOption;
              
              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && setSelectedOption(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
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
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-current"
                        : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <div className={`w-3 h-3 rounded-full ${
                          !showFeedback
                            ? "bg-blue-500"
                            : isCorrectOption
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`} />
                      )}
                    </div>
                    <p className="flex-1">{option}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showFeedback && (
          <div className={`p-4 rounded-lg mb-4 ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect ? (
              <div>
                <p className="font-semibold mb-2">Correct!</p>
                {exercise.solution.definition && (
                  <p className="mb-2">Definition: {exercise.solution.definition}</p>
                )}
                {exercise.solution.synonyms && exercise.solution.synonyms.length > 0 && (
                  <p className="text-sm">Synonyms: {exercise.solution.synonyms.join(", ")}</p>
                )}
                {exercise.solution.antonyms && exercise.solution.antonyms.length > 0 && (
                  <p className="text-sm">Antonyms: {exercise.solution.antonyms.join(", ")}</p>
                )}
              </div>
            ) : (
              <p>Not quite right. The correct answer is highlighted above.</p>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={showFeedback || selectedOption === null}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
}