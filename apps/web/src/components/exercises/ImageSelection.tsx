"use client";

import { useState } from "react";
import { ImageSelectionExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageSelectionProps {
  exercise: ImageSelectionExercise;
  onSubmit: (answer: string[]) => void;
  userAnswer?: string[];
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export function ImageSelection({ exercise, onSubmit, userAnswer, isCorrect, showFeedback }: ImageSelectionProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>(userAnswer || []);

  const handleImageClick = (imageId: string) => {
    if (showFeedback) return;

    if (exercise.content.multiSelect) {
      setSelectedImages(prev => 
        prev.includes(imageId) 
          ? prev.filter(id => id !== imageId)
          : [...prev, imageId]
      );
    } else {
      setSelectedImages([imageId]);
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedImages);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
        <p className="text-gray-600 mb-4">{exercise.content.question}</p>
        {exercise.content.multiSelect && (
          <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {exercise.content.images.map((image) => {
            const isSelected = selectedImages.includes(image.id);
            const isCorrectAnswer = exercise.solution.correctImageIds.includes(image.id);
            
            return (
              <div
                key={image.id}
                onClick={() => handleImageClick(image.id)}
                className={cn(
                  "relative cursor-pointer rounded-lg overflow-hidden transition-all",
                  isSelected && !showFeedback && "ring-2 ring-blue-500",
                  showFeedback && isSelected && isCorrectAnswer && "ring-2 ring-green-500",
                  showFeedback && isSelected && !isCorrectAnswer && "ring-2 ring-red-500",
                  showFeedback && !isSelected && isCorrectAnswer && "ring-2 ring-yellow-500"
                )}
              >
                <img
                  src={image.url}
                  alt={image.alt || "Option"}
                  className="w-full h-40 object-cover"
                />
                {isSelected && (
                  <div className={cn(
                    "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
                    !showFeedback && "bg-blue-500",
                    showFeedback && isCorrectAnswer && "bg-green-500",
                    showFeedback && !isCorrectAnswer && "bg-red-500"
                  )}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`mt-4 p-4 rounded-lg ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect 
              ? "Correct! Well done!" 
              : exercise.content.multiSelect
                ? "Not quite right. Check the images highlighted in yellow for the correct answers."
                : "That's not correct. Try again!"
            }
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="mt-4 w-full"
          disabled={showFeedback || selectedImages.length === 0}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
}