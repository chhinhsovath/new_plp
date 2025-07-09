"use client";

import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastActiveDate,
  className,
}: StreakDisplayProps) {
  const isActive = currentStreak > 0;
  const isOnFire = currentStreak >= 7;
  const isRecord = currentStreak === longestStreak && currentStreak > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Current Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {currentStreak}
              </span>
              <span className="text-lg text-muted-foreground">
                day{currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {longestStreak} days
            </p>
          </div>
          
          <div className={cn(
            "relative",
            isOnFire && "animate-pulse"
          )}>
            <Flame
              className={cn(
                "h-16 w-16 transition-colors",
                !isActive && "text-gray-300",
                isActive && !isOnFire && "text-orange-400",
                isOnFire && "text-orange-500"
              )}
            />
            {isRecord && currentStreak > 0 && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                NEW!
              </div>
            )}
          </div>
        </div>

        {/* Streak calendar */}
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            This Week
          </p>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const isToday = i === 6;
              const isActive = i >= (7 - currentStreak) || currentStreak >= 7;
              
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-xs font-medium",
                    isActive ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-400",
                    isToday && "ring-2 ring-orange-500"
                  )}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-center">
            {currentStreak === 0 && "Start learning today to begin your streak!"}
            {currentStreak > 0 && currentStreak < 3 && "Great start! Keep it up!"}
            {currentStreak >= 3 && currentStreak < 7 && "You're building a habit!"}
            {currentStreak >= 7 && currentStreak < 14 && "One week streak! Amazing!"}
            {currentStreak >= 14 && currentStreak < 30 && "Two weeks! You're unstoppable!"}
            {currentStreak >= 30 && "Incredible dedication! Keep going!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}