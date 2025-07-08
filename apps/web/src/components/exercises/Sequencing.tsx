"use client";

import { useState } from "react";
import { SequencingExercise } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SequencingProps {
  exercise: SequencingExercise;
  onSubmit: (answer: string[]) => void;
  userAnswer?: string[];
  isCorrect?: boolean;
  showFeedback?: boolean;
}

function SortableItem({ id, content, imageUrl }: { id: string; content: string; imageUrl?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white border rounded-lg ${
        isDragging ? "shadow-lg" : "shadow-sm"
      } hover:shadow-md transition-shadow`}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      {imageUrl && (
        <img src={imageUrl} alt={content} className="w-16 h-16 object-cover rounded" />
      )}
      <p className="flex-1">{content}</p>
    </div>
  );
}

export function Sequencing({ exercise, onSubmit, userAnswer, isCorrect, showFeedback }: SequencingProps) {
  const [items, setItems] = useState(() => {
    if (userAnswer) {
      return userAnswer;
    }
    // Shuffle items initially
    const shuffled = [...exercise.content.items].sort(() => Math.random() - 0.5);
    return shuffled.map(item => item.id);
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    onSubmit(items);
  };

  const getItemById = (id: string) => {
    return exercise.content.items.find(item => item.id === id);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
        <p className="text-gray-600 mb-4">{exercise.content.instruction}</p>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((id) => {
                const item = getItemById(id);
                if (!item) return null;
                return (
                  <SortableItem
                    key={id}
                    id={id}
                    content={item.content}
                    imageUrl={item.imageUrl}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {showFeedback && (
          <div className={`mt-4 p-4 rounded-lg ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect ? "Correct sequence!" : "Not quite right. Try again!"}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="mt-4 w-full"
          disabled={showFeedback}
        >
          Submit Answer
        </Button>
      </Card>
    </div>
  );
}