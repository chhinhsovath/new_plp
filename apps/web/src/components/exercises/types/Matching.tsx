"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface MatchingExerciseProps {
  content: {
    leftItems: Array<{
      id: string;
      text: string;
      textKh?: string;
    }>;
    rightItems: Array<{
      id: string;
      text: string;
      textKh?: string;
    }>;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: Record<string, string> | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    pairs: Record<string, string>;
  } | null;
}

export function MatchingExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: MatchingExerciseProps) {
  const [matches, setMatches] = useState<Record<string, string>>(userAnswer || {});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  useEffect(() => {
    onAnswerChange(matches);
  }, [matches, onAnswerChange]);

  const handleLeftClick = (leftId: string) => {
    if (isSubmitted) return;
    
    if (selectedLeft === leftId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftId);
    }
  };

  const handleRightClick = (rightId: string) => {
    if (isSubmitted || !selectedLeft) return;

    const newMatches = { ...matches };
    
    // Remove any existing match for this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === rightId) {
        delete newMatches[key];
      }
    });

    // Create new match
    newMatches[selectedLeft] = rightId;
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleClearMatch = (leftId: string) => {
    if (isSubmitted) return;
    
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
  };

  const isMatchCorrect = (leftId: string, rightId: string) => {
    if (!isSubmitted || !solution) return null;
    return solution.pairs[leftId] === rightId;
  };

  const getMatchedRightItem = (leftId: string) => {
    const rightId = matches[leftId];
    if (!rightId) return null;
    return content.rightItems.find(item => item.id === rightId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">
            Click an item, then click its match
          </h3>
          {content.leftItems.map((leftItem) => {
            const matchedRight = getMatchedRightItem(leftItem.id);
            const isSelected = selectedLeft === leftItem.id;
            const hasMatch = !!matchedRight;
            const matchCorrect = matchedRight && 
              isMatchCorrect(leftItem.id, matches[leftItem.id]);

            return (
              <div
                key={leftItem.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  "flex items-center justify-between gap-3",
                  isSelected && "border-primary bg-primary/10",
                  !isSelected && !hasMatch && "border-gray-200 hover:border-gray-300",
                  hasMatch && !isSubmitted && "border-blue-300 bg-blue-50",
                  isSubmitted && matchCorrect && "border-green-500 bg-green-50",
                  isSubmitted && hasMatch && !matchCorrect && "border-red-500 bg-red-50"
                )}
                onClick={() => handleLeftClick(leftItem.id)}
              >
                <div className="flex-1">
                  <p className="font-medium">{leftItem.text}</p>
                  {leftItem.textKh && (
                    <p className="text-sm text-muted-foreground">{leftItem.textKh}</p>
                  )}
                </div>
                
                {hasMatch && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      → {matchedRight.text}
                    </div>
                    {!isSubmitted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearMatch(leftItem.id);
                        }}
                      >
                        ×
                      </Button>
                    )}
                    {isSubmitted && (
                      matchCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">
            Available matches
          </h3>
          {content.rightItems.map((rightItem) => {
            const isMatched = Object.values(matches).includes(rightItem.id);
            const canSelect = selectedLeft && !isMatched && !isSubmitted;

            return (
              <div
                key={rightItem.id}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  canSelect && "cursor-pointer hover:border-primary hover:bg-primary/5",
                  !canSelect && "cursor-not-allowed",
                  isMatched && "opacity-50"
                )}
                onClick={() => canSelect && handleRightClick(rightItem.id)}
              >
                <p className="font-medium">{rightItem.text}</p>
                {rightItem.textKh && (
                  <p className="text-sm text-muted-foreground">{rightItem.textKh}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Show correct matches after submission */}
      {isSubmitted && solution && !isCorrect && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">Correct matches:</p>
          {Object.entries(solution.pairs).map(([leftId, rightId]) => {
            const leftItem = content.leftItems.find(item => item.id === leftId);
            const rightItem = content.rightItems.find(item => item.id === rightId);
            return (
              <div key={leftId} className="text-sm">
                {leftItem?.text} → {rightItem?.text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}