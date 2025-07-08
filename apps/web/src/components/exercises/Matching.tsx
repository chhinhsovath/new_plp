"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchingExercise } from "./types";
import { ArrowRight } from "lucide-react";

interface MatchingProps {
  exercise: MatchingExercise;
  onSubmit?: (matches: Array<{ leftId: string; rightId: string }>, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function Matching({ exercise, onSubmit, disabled }: MatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Array<{ leftId: string; rightId: string }>>([]);

  const handleLeftClick = (leftId: string) => {
    if (disabled) return;
    
    // If already matched, unselect
    if (matches.some(m => m.leftId === leftId)) {
      setMatches(prev => prev.filter(m => m.leftId !== leftId));
      return;
    }
    
    setSelectedLeft(leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (disabled || !selectedLeft) return;
    
    // Remove any existing match for this right item
    const newMatches = matches.filter(m => m.rightId !== rightId);
    
    // Add new match
    newMatches.push({ leftId: selectedLeft, rightId });
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const getMatchForLeft = (leftId: string) => {
    return matches.find(m => m.leftId === leftId)?.rightId;
  };

  const getMatchForRight = (rightId: string) => {
    return matches.find(m => m.rightId === rightId)?.leftId;
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    // Check if all matches are correct
    const isCorrect = matches.length === exercise.solution.matches.length &&
      matches.every(match => 
        exercise.solution.matches.some(
          correct => correct.leftId === match.leftId && correct.rightId === match.rightId
        )
      );
    
    onSubmit(matches, isCorrect);
  };

  const allItemsMatched = matches.length === exercise.content.leftColumn.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
        {/* Left column */}
        <div className="space-y-2">
          {exercise.content.leftColumn.map((item) => {
            const matchedRightId = getMatchForLeft(item.id);
            const isSelected = selectedLeft === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                disabled={disabled}
                className={`
                  w-full p-3 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : matchedRightId
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                  ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                `}
              >
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.content} 
                    className="w-full h-20 object-contain mb-2" 
                  />
                ) : null}
                <p className="font-medium">{item.content}</p>
              </button>
            );
          })}
        </div>

        {/* Connection lines */}
        <div className="flex items-center justify-center">
          <div className="relative w-12">
            {matches.map((match, index) => {
              const leftIndex = exercise.content.leftColumn.findIndex(i => i.id === match.leftId);
              const rightIndex = exercise.content.rightColumn.findIndex(i => i.id === match.rightId);
              
              return (
                <div
                  key={`${match.leftId}-${match.rightId}`}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    top: `${leftIndex * 100}px`,
                  }}
                >
                  <ArrowRight className="w-6 h-6 text-green-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {exercise.content.rightColumn.map((item) => {
            const matchedLeftId = getMatchForRight(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={disabled || !selectedLeft}
                className={`
                  w-full p-3 rounded-lg border-2 text-left transition-all
                  ${matchedLeftId
                    ? "border-green-500 bg-green-50"
                    : selectedLeft
                    ? "border-gray-300 hover:border-blue-400"
                    : "border-gray-200"
                  }
                  ${disabled || !selectedLeft ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                `}
              >
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.content} 
                    className="w-full h-20 object-contain mb-2" 
                  />
                ) : null}
                <p className="font-medium">{item.content}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>Click an item on the left, then click its match on the right.</p>
        <p>Matched: {matches.length} / {exercise.content.leftColumn.length}</p>
      </div>

      {!disabled && (
        <Button 
          onClick={handleSubmit} 
          disabled={!allItemsMatched}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}