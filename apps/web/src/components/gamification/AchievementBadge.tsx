"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category?: string;
    rarity?: "common" | "rare" | "epic" | "legendary";
    unlockedAt?: string;
    progress?: number;
    total?: number;
    rewards?: {
      points?: number;
      title?: string;
    };
  };
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  animate?: boolean;
  onClick?: () => void;
  className?: string;
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
};

const rarityGlow = {
  common: "",
  rare: "shadow-blue-400/50",
  epic: "shadow-purple-400/50",
  legendary: "shadow-yellow-400/50 animate-pulse",
};

export function AchievementBadge({
  achievement,
  size = "md",
  showProgress = true,
  animate = true,
  onClick,
  className,
}: AchievementBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isUnlocked = !!achievement.unlockedAt;
  const progress = achievement.total 
    ? (achievement.progress || 0) / achievement.total * 100 
    : 100;
  const rarity = achievement.rarity || "common";

  const sizes = {
    sm: "w-16 h-16 text-2xl",
    md: "w-24 h-24 text-4xl",
    lg: "w-32 h-32 text-5xl",
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    if (isUnlocked && animate && !isAnimating) {
      setIsAnimating(true);
      
      // Trigger confetti for legendary achievements
      if (rarity === "legendary") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFD700", "#FFA500", "#FFFF00"],
        });
      }

      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative cursor-pointer transition-all",
              isUnlocked && animate && "hover:scale-110",
              isAnimating && "animate-bounce",
              className
            )}
            onClick={handleClick}
          >
            {/* Badge Container */}
            <div
              className={cn(
                "relative rounded-full flex items-center justify-center",
                sizes[size],
                isUnlocked ? [
                  "bg-gradient-to-br",
                  rarityColors[rarity],
                  "shadow-lg",
                  rarityGlow[rarity],
                ] : "bg-gray-200 dark:bg-gray-700"
              )}
            >
              {/* Badge Icon */}
              <div className={cn(
                "relative z-10",
                !isUnlocked && "opacity-40 grayscale"
              )}>
                {achievement.icon}
              </div>

              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-gray-500" />
                </div>
              )}

              {/* Sparkle Effect for Unlocked */}
              {isUnlocked && rarity !== "common" && (
                <Sparkles className={cn(
                  "absolute top-0 right-0 h-4 w-4",
                  rarity === "legendary" ? "text-yellow-300" : "text-white",
                  "animate-pulse"
                )} />
              )}

              {/* Progress Ring */}
              {!isUnlocked && showProgress && achievement.total && size !== "sm" && (
                <svg
                  className="absolute inset-0 w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-300"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${progress * 3.01} 301`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
              )}
            </div>

            {/* Progress Bar (Alternative) */}
            {!isUnlocked && showProgress && achievement.total && size === "sm" && (
              <Progress 
                value={progress} 
                className="absolute -bottom-2 left-0 right-0 h-1"
              />
            )}

            {/* New Badge Indicator */}
            {isUnlocked && achievement.unlockedAt && 
             new Date(achievement.unlockedAt) > new Date(Date.now() - 86400000) && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                NEW
              </div>
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent 
          side="bottom" 
          className="max-w-xs p-4 space-y-2"
          sideOffset={5}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold">{achievement.name}</h4>
              {achievement.category && (
                <p className="text-xs text-muted-foreground">{achievement.category}</p>
              )}
            </div>
            {isUnlocked && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  rarity === "legendary" && "bg-yellow-100 text-yellow-800",
                  rarity === "epic" && "bg-purple-100 text-purple-800",
                  rarity === "rare" && "bg-blue-100 text-blue-800"
                )}
              >
                {rarity}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          
          {!isUnlocked && achievement.total && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{achievement.progress || 0}/{achievement.total}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}

          {achievement.rewards && (
            <div className="pt-2 border-t space-y-1">
              <p className="text-xs font-medium">Rewards:</p>
              {achievement.rewards.points && (
                <p className="text-xs text-muted-foreground">
                  +{achievement.rewards.points} XP
                </p>
              )}
              {achievement.rewards.title && (
                <p className="text-xs text-muted-foreground">
                  Title: "{achievement.rewards.title}"
                </p>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}