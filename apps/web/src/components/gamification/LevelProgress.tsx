"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/contexts/GamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { cn } from "@/lib/utils";
import {
  Award,
  ChevronRight,
  Star,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface LevelProgressProps {
  variant?: "compact" | "detailed" | "card";
  showMilestones?: boolean;
  className?: string;
}

const LEVEL_COLORS = [
  "bg-gray-500",      // Level 1
  "bg-green-500",     // Level 2
  "bg-blue-500",      // Level 3
  "bg-purple-500",    // Level 4
  "bg-orange-500",    // Level 5
  "bg-red-500",       // Level 6
  "bg-pink-500",      // Level 7
  "bg-indigo-500",    // Level 8
  "bg-yellow-500",    // Level 9
  "bg-gradient-to-r from-purple-500 to-pink-500", // Level 10
];

const LEVEL_ICONS = [
  "🌱", // Level 1 - Beginner
  "🌿", // Level 2 - Learner
  "🔍", // Level 3 - Explorer
  "🎯", // Level 4 - Achiever
  "📚", // Level 5 - Scholar
  "🎓", // Level 6 - Expert
  "👑", // Level 7 - Master
  "🏆", // Level 8 - Champion
  "⚡", // Level 9 - Legend
  "💎", // Level 10 - Grandmaster
];

const LEVEL_MILESTONES = [
  { level: 1, points: 0, reward: "Welcome Badge", icon: "🎉" },
  { level: 2, points: 100, reward: "Learner Badge", icon: "📖" },
  { level: 3, points: 250, reward: "Explorer Badge", icon: "🗺️" },
  { level: 4, points: 500, reward: "Achiever Badge", icon: "🏅" },
  { level: 5, points: 1000, reward: "Scholar Badge", icon: "🎓" },
  { level: 6, points: 2000, reward: "Expert Badge", icon: "⭐" },
  { level: 7, points: 3500, reward: "Master Badge", icon: "👑" },
  { level: 8, points: 5000, reward: "Champion Badge", icon: "🏆" },
  { level: 9, points: 7500, reward: "Legend Badge", icon: "⚡" },
  { level: 10, points: 10000, reward: "Grandmaster Badge", icon: "💎" },
];

export function LevelProgress({
  variant = "compact",
  showMilestones = false,
  className,
}: LevelProgressProps) {
  const { userStats } = useGamification();
  const { isKhmer } = useLanguage();

  if (!userStats) return null;

  const currentLevel = userStats.currentLevel;
  const levelProgress = userStats.currentLevelProgress || 0;
  const currentMilestone = LEVEL_MILESTONES[currentLevel - 1];
  const nextMilestone = LEVEL_MILESTONES[currentLevel] || LEVEL_MILESTONES[LEVEL_MILESTONES.length - 1];

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{LEVEL_ICONS[currentLevel - 1]}</span>
          <div>
            <p className="text-sm font-medium">Level {currentLevel}</p>
            <Progress value={levelProgress} className="w-24 h-1.5" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <BilingualText en="Level Progress" km="វឌ្ឍនភាពកម្រិត" />
          </CardTitle>
          <CardDescription>
            <BilingualText
              en="Track your journey to the next level"
              km="តាមដានដំណើររបស់អ្នកទៅកម្រិតបន្ទាប់"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Level Display */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
              <span className="text-5xl">{LEVEL_ICONS[currentLevel - 1]}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Level {currentLevel}</h3>
              <p className="text-muted-foreground">{currentMilestone.reward}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <FormattedNumber value={userStats.totalPoints} /> XP
              </span>
              <span className="text-muted-foreground">
                <FormattedNumber value={nextMilestone.points} /> XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              <FormattedNumber value={nextMilestone.points - userStats.totalPoints} /> XP to level {currentLevel + 1}
            </p>
          </div>

          {/* Milestones */}
          {showMilestones && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                <BilingualText en="Milestones" km="ចំណុចសំខាន់" />
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {LEVEL_MILESTONES.map((milestone, index) => {
                  const isUnlocked = currentLevel > milestone.level;
                  const isCurrent = currentLevel === milestone.level;
                  
                  return (
                    <div
                      key={milestone.level}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        isUnlocked && "bg-primary/5",
                        isCurrent && "bg-primary/10 border border-primary/20",
                        !isUnlocked && !isCurrent && "opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {isUnlocked ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Level {milestone.level} - {milestone.reward}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <FormattedNumber value={milestone.points} /> XP
                        </p>
                      </div>
                      <span className="text-lg">{milestone.icon}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            LEVEL_COLORS[Math.min(currentLevel - 1, LEVEL_COLORS.length - 1)]
          )}>
            <span className="text-2xl">{LEVEL_ICONS[currentLevel - 1]}</span>
          </div>
          <div>
            <p className="font-semibold">Level {currentLevel}</p>
            <p className="text-sm text-muted-foreground">{currentMilestone.reward}</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {levelProgress.toFixed(0)}%
        </Badge>
      </div>

      <div className="space-y-1.5">
        <Progress value={levelProgress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span><FormattedNumber value={userStats.totalPoints} /> XP</span>
          <span><FormattedNumber value={nextMilestone.points} /> XP</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full">
        <BilingualText en="View All Levels" km="មើលកម្រិតទាំងអស់" />
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}