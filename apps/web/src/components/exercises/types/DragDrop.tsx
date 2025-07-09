"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Grip } from "lucide-react";

interface DragDropExerciseProps {
  content: {
    items: Array<{
      id: string;
      text: string;
      textKh?: string;
      imageUrl?: string;
    }>;
    targetZones: Array<{
      id: string;
      label: string;
      labelKh?: string;
    }>;
  };
  onAnswerChange: (answer: any) => void;
  userAnswer: Record<string, string[]> | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  solution: {
    correctPlacements: Record<string, string[]>;
  } | null;
}

export function DragDropExercise({
  content,
  onAnswerChange,
  userAnswer,
  isSubmitted,
  isCorrect,
  solution,
}: DragDropExerciseProps) {
  const [placements, setPlacements] = useState<Record<string, string[]>>(
    userAnswer || 
    content.targetZones.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {})
  );
  const [unplacedItems, setUnplacedItems] = useState<string[]>(
    content.items.map(item => item.id)
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    // Update unplaced items based on current placements
    const placedItems = Object.values(placements).flat();
    setUnplacedItems(
      content.items
        .map(item => item.id)
        .filter(id => !placedItems.includes(id))
    );
    onAnswerChange(placements);
  }, [placements, content.items, onAnswerChange]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (!draggedItem || isSubmitted) return;

    const newPlacements = { ...placements };
    
    // Remove item from its current location
    Object.keys(newPlacements).forEach(zone => {
      newPlacements[zone] = newPlacements[zone].filter(id => id !== draggedItem);
    });

    // Add item to new zone
    newPlacements[zoneId] = [...newPlacements[zoneId], draggedItem];
    
    setPlacements(newPlacements);
    setDraggedItem(null);
  };

  const handleDropToUnplaced = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || isSubmitted) return;

    const newPlacements = { ...placements };
    
    // Remove item from all zones
    Object.keys(newPlacements).forEach(zone => {
      newPlacements[zone] = newPlacements[zone].filter(id => id !== draggedItem);
    });
    
    setPlacements(newPlacements);
    setDraggedItem(null);
  };

  const getItemById = (id: string) => content.items.find(item => item.id === id);

  const isItemCorrectlyPlaced = (itemId: string, zoneId: string) => {
    if (!isSubmitted || !solution) return null;
    return solution.correctPlacements[zoneId]?.includes(itemId);
  };

  const renderItem = (itemId: string, isInZone: boolean = false) => {
    const item = getItemById(itemId);
    if (!item) return null;

    const correctZone = isSubmitted && solution && 
      Object.entries(solution.correctPlacements).find(([_, items]) => 
        items.includes(itemId)
      )?.[0];

    const currentZone = Object.entries(placements).find(([_, items]) => 
      items.includes(itemId)
    )?.[0];

    const isCorrectlyPlaced = isSubmitted && correctZone === currentZone;
    const isIncorrectlyPlaced = isSubmitted && currentZone && correctZone !== currentZone;

    return (
      <div
        key={itemId}
        draggable={!isSubmitted}
        onDragStart={(e) => handleDragStart(e, itemId)}
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-white cursor-move transition-all",
          "hover:shadow-md",
          isSubmitted && {
            "border-green-500 bg-green-50": isCorrectlyPlaced,
            "border-red-500 bg-red-50": isIncorrectlyPlaced,
            "cursor-default": true,
          }
        )}
      >
        {!isSubmitted && <Grip className="h-4 w-4 text-muted-foreground" />}
        <div className="flex-1">
          {item.imageUrl && (
            <img src={item.imageUrl} alt="" className="h-12 w-12 object-cover rounded mb-1" />
          )}
          <p className="text-sm font-medium">{item.text}</p>
          {item.textKh && (
            <p className="text-xs text-muted-foreground">{item.textKh}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Unplaced items */}
      <div
        className={cn(
          "min-h-[100px] p-4 border-2 border-dashed rounded-lg",
          "transition-colors",
          draggedItem && "border-primary bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDropToUnplaced}
      >
        <p className="text-sm text-muted-foreground mb-3">
          Drag items from here to the appropriate categories below
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {unplacedItems.map(itemId => renderItem(itemId))}
        </div>
      </div>

      {/* Target zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.targetZones.map(zone => {
          const zoneItems = placements[zone.id] || [];
          const isZoneActive = draggedItem && !isSubmitted;

          return (
            <div
              key={zone.id}
              className={cn(
                "min-h-[150px] p-4 border-2 rounded-lg",
                "transition-colors",
                isZoneActive && "border-primary bg-primary/5"
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, zone.id)}
            >
              <h3 className="font-semibold mb-2">{zone.label}</h3>
              {zone.labelKh && (
                <p className="text-sm text-muted-foreground mb-3">{zone.labelKh}</p>
              )}
              <div className="space-y-2">
                {zoneItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Drop items here
                  </p>
                ) : (
                  zoneItems.map(itemId => renderItem(itemId, true))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show correct placements after submission */}
      {isSubmitted && solution && !isCorrect && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">Correct placements:</p>
          {Object.entries(solution.correctPlacements).map(([zoneId, itemIds]) => {
            const zone = content.targetZones.find(z => z.id === zoneId);
            return (
              <div key={zoneId} className="mb-2">
                <span className="font-medium">{zone?.label}:</span>{" "}
                {itemIds.map(id => getItemById(id)?.text).join(", ")}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}