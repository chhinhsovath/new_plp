"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DragDropExercise } from "./types";
import { GripVertical } from "lucide-react";

interface DragDropProps {
  exercise: DragDropExercise;
  onSubmit?: (answers: Record<string, string>, isCorrect: boolean) => void;
  disabled?: boolean;
}

interface DragItem {
  id: string;
  content: string;
  imageUrl?: string;
}

export function DragDrop({ exercise, onSubmit, disabled }: DragDropProps) {
  const [draggedItems, setDraggedItems] = useState<Record<string, string>>({}); // zoneId -> itemId
  const [availableItems, setAvailableItems] = useState<DragItem[]>(exercise.content.items);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const draggedOverZone = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    draggedOverZone.current = zoneId;
    (e.currentTarget as HTMLElement).classList.add("bg-blue-50", "border-blue-400");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("bg-blue-50", "border-blue-400");
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove("bg-blue-50", "border-blue-400");

    if (!draggedItem || disabled) return;

    // Check if this item is allowed in this zone
    const zone = exercise.content.dropZones.find(z => z.id === zoneId);
    if (!zone?.acceptIds.includes(draggedItem.id)) {
      return;
    }

    // Remove item from available items
    setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));

    // If there was already an item in this zone, move it back to available
    const previousItem = draggedItems[zoneId];
    if (previousItem) {
      const prevItemData = exercise.content.items.find(item => item.id === previousItem);
      if (prevItemData) {
        setAvailableItems(prev => [...prev, prevItemData]);
      }
    }

    // Place the new item in the zone
    setDraggedItems(prev => ({ ...prev, [zoneId]: draggedItem.id }));
    setDraggedItem(null);
  };

  const handleRemoveFromZone = (zoneId: string) => {
    const itemId = draggedItems[zoneId];
    if (!itemId) return;

    const item = exercise.content.items.find(i => i.id === itemId);
    if (item) {
      setAvailableItems(prev => [...prev, item]);
      setDraggedItems(prev => {
        const newItems = { ...prev };
        delete newItems[zoneId];
        return newItems;
      });
    }
  };

  const handleSubmit = () => {
    if (!onSubmit) return;

    // Check if all answers are correct
    const isCorrect = Object.entries(exercise.solution.mapping).every(
      ([itemId, correctZoneId]) => {
        // Find which zone this item is in
        const placedZoneId = Object.entries(draggedItems).find(
          ([_, placedItemId]) => placedItemId === itemId
        )?.[0];
        return placedZoneId === correctZoneId;
      }
    );

    onSubmit(draggedItems, isCorrect);
  };

  const allZonesFilled = exercise.content.dropZones.every(zone => draggedItems[zone.id]);

  return (
    <div className="space-y-6">
      {/* Available items */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium mb-3">Drag items to the correct boxes:</p>
        <div className="flex flex-wrap gap-2">
          {availableItems.map((item) => (
            <div
              key={item.id}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item)}
              className={`
                flex items-center gap-2 px-3 py-2 bg-white border rounded-lg
                ${disabled ? "opacity-60" : "cursor-move hover:shadow-md"}
                transition-shadow
              `}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.content} className="w-8 h-8 object-contain" />
              ) : (
                <span>{item.content}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Drop zones */}
      <div className="grid gap-4 md:grid-cols-2">
        {exercise.content.dropZones.map((zone) => {
          const droppedItem = draggedItems[zone.id] 
            ? exercise.content.items.find(item => item.id === draggedItems[zone.id])
            : null;

          return (
            <div
              key={zone.id}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, zone.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone.id)}
              className={`
                min-h-[100px] p-4 border-2 border-dashed rounded-lg
                transition-colors
                ${droppedItem ? "border-solid border-gray-300 bg-gray-50" : "border-gray-300"}
              `}
            >
              <p className="text-sm font-medium mb-2">{zone.label}</p>
              {droppedItem ? (
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    {droppedItem.imageUrl ? (
                      <img 
                        src={droppedItem.imageUrl} 
                        alt={droppedItem.content} 
                        className="w-8 h-8 object-contain" 
                      />
                    ) : (
                      <span>{droppedItem.content}</span>
                    )}
                  </div>
                  {!disabled && (
                    <button
                      onClick={() => handleRemoveFromZone(zone.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Drop an item here</p>
              )}
            </div>
          );
        })}
      </div>

      {!disabled && (
        <Button 
          onClick={handleSubmit} 
          disabled={!allZonesFilled}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}