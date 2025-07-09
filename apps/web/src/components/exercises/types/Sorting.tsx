"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Grip, CheckCircle2, XCircle } from "lucide-react";

interface SortingExerciseProps {
  content: {
    items: Array<{
      id: string;
      text: string;
      textKh?: string;
    }>;
    instruction: string;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: string[] | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    correctOrder: string[];
  } | null;
}

export function SortingExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: SortingExerciseProps) {
  const [items, setItems] = useState(userAnswer || content.items.map(item => item.id));
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null);

  useEffect(() => {
    onAnswerChange(items);
  }, [items, onAnswerChange]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItem !== itemId) {
      setDraggedOverItem(itemId);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !draggedOverItem || isSubmitted) return;

    const draggedIndex = items.indexOf(draggedItem);
    const draggedOverIndex = items.indexOf(draggedOverItem);

    const newItems = [...items];
    newItems[draggedIndex] = draggedOverItem;
    newItems[draggedOverIndex] = draggedItem;

    setItems(newItems);
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const getItemById = (id: string) => content.items.find(item => item.id === id);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{content.instruction}</p>
      
      <div className="space-y-2">
        {items.map((itemId, index) => {
          const item = getItemById(itemId);
          if (!item) return null;

          const isCorrectPosition = isSubmitted && solution?.correctOrder[index] === itemId;
          const isIncorrectPosition = isSubmitted && solution?.correctOrder[index] !== itemId;

          return (
            <div
              key={itemId}
              draggable={!isSubmitted}
              onDragStart={(e) => handleDragStart(e, itemId)}
              onDragOver={(e) => handleDragOver(e, itemId)}
              onDrop={handleDrop}
              onDragLeave={() => setDraggedOverItem(null)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border bg-white transition-all",
                !isSubmitted && "cursor-move hover:shadow-md",
                draggedOverItem === itemId && "border-primary scale-105",
                isSubmitted && {
                  "border-green-500 bg-green-50": isCorrectPosition,
                  "border-red-500 bg-red-50": isIncorrectPosition,
                }
              )}
            >
              <div className="text-lg font-semibold text-muted-foreground w-8">
                {index + 1}.
              </div>
              {!isSubmitted && <Grip className="h-4 w-4 text-muted-foreground" />}
              <div className="flex-1">
                <p className="font-medium">{item.text}</p>
                {item.textKh && (
                  <p className="text-sm text-muted-foreground">{item.textKh}</p>
                )}
              </div>
              {isSubmitted && (
                isCorrectPosition ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )
              )}
            </div>
          );
        })}
      </div>

      {isSubmitted && solution && !isCorrect && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">Correct order:</p>
          <ol className="list-decimal list-inside space-y-1">
            {solution.correctOrder.map((itemId) => {
              const item = getItemById(itemId);
              return (
                <li key={itemId} className="text-sm text-blue-700">
                  {item?.text}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}