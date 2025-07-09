"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/contexts/GamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { cn } from "@/lib/utils";
import {
  Zap,
  TrendingUp,
  Trophy,
  Target,
  Award,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PointsDisplayProps {
  variant?: "compact" | "detailed" | "hero";
  showProgress?: boolean;
  showNextLevel?: boolean;
  animated?: boolean;
  className?: string;
}

export function PointsDisplay({
  variant = "compact",
  showProgress = true,
  showNextLevel = true,
  animated = true,
  className,
}: PointsDisplayProps) {
  const { userStats } = useGamification();
  const { isKhmer } = useLanguage();
  const [displayPoints, setDisplayPoints] = useState(userStats?.totalPoints || 0);

  useEffect(() => {
    if (animated && userStats) {
      // Animate points counting up
      const duration = 1000;
      const steps = 30;
      const increment = (userStats.totalPoints - displayPoints) / steps;
      let current = displayPoints;

      const timer = setInterval(() => {
        current += increment;
        if (
          (increment > 0 && current >= userStats.totalPoints) ||
          (increment < 0 && current <= userStats.totalPoints)
        ) {
          setDisplayPoints(userStats.totalPoints);
          clearInterval(timer);
        } else {
          setDisplayPoints(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else if (userStats) {
      setDisplayPoints(userStats.totalPoints);
    }
  }, [userStats?.totalPoints]);

  if (!userStats) return null;

  const levelProgress = userStats.currentLevelProgress || 0;
  const pointsToNextLevel = userStats.nextLevelPoints - userStats.totalPoints;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold">
            <FormattedNumber value={displayPoints} />
          </span>
        </div>
        {showProgress && (
          <Progress value={levelProgress} className="w-20 h-2" />
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  <BilingualText en="Total Points" km="ពិន្ទុសរុប" />
                </p>
                <div className="flex items-baseline gap-3">
                  <AnimatedNumber value={displayPoints} className="text-4xl font-bold" />
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Level {userStats.currentLevel}
                  </span>
                  {showNextLevel && (
                    <span className="text-xs text-muted-foreground">
                      • <FormattedNumber value={pointsToNextLevel} /> to level {userStats.currentLevel + 1}
                    </span>
                  )}
                </div>
                {showProgress && (
                  <Progress value={levelProgress} className="h-2" />
                )}
              </div>

              {userStats.rank && (
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Rank #{userStats.rank}
                  </Badge>
                  <span className="text-muted-foreground">
                    of {userStats.totalUsers} learners
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl" />
              <Sparkles className="h-24 w-24 text-primary/30 relative" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">
              <FormattedNumber value={displayPoints} />
            </span>
            <span className="text-sm text-muted-foreground">
              <BilingualText en="points" km="ពិន្ទុ" />
            </span>
          </div>
          <Badge variant="secondary">
            Level {userStats.currentLevel}
          </Badge>
        </div>

        {showProgress && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Level {userStats.currentLevel}</span>
              <span>Level {userStats.currentLevel + 1}</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            {showNextLevel && (
              <p className="text-xs text-center text-muted-foreground">
                <FormattedNumber value={pointsToNextLevel} /> points to next level
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  return (
    <span className={className}>
      <FormattedNumber value={value} />
    </span>
  );
}

interface PointsAnimationProps {
  points: number;
  reason: string;
}

export function PointsAnimation({ points, reason }: PointsAnimationProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-lg text-primary">+{points}</p>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}