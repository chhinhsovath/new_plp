"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Badge {
  id: string;
  name: string;
  nameKh: string;
  description: string;
  descriptionKh: string;
  icon: string;
  category: "bronze" | "silver" | "gold" | "platinum";
  requirements: {
    type: "points" | "streak" | "exercises" | "lessons" | "perfect_score" | "time_spent";
    value: number;
  };
  unlockedAt?: string;
  progress?: number;
}

interface Level {
  level: number;
  title: string;
  titleKh: string;
  minPoints: number;
  maxPoints: number;
}

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  currentLevelProgress: number;
  nextLevelPoints: number;
  badges: Badge[];
  recentAchievements: Achievement[];
  rank?: number;
  totalUsers?: number;
}

interface Achievement {
  id: string;
  type: "badge_earned" | "level_up" | "milestone" | "special";
  title: string;
  titleKh: string;
  description: string;
  icon: string;
  earnedAt: string;
  points: number;
}

interface GamificationContextType {
  userStats: UserStats | null;
  addPoints: (points: number, reason: string) => Promise<void>;
  checkBadgeProgress: () => Promise<void>;
  celebrateAchievement: (achievement: Achievement) => void;
  loading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Define levels
const LEVELS: Level[] = [
  { level: 1, title: "Beginner", titleKh: "អ្នកចាប់ផ្តើម", minPoints: 0, maxPoints: 100 },
  { level: 2, title: "Learner", titleKh: "អ្នកសិក្សា", minPoints: 100, maxPoints: 250 },
  { level: 3, title: "Explorer", titleKh: "អ្នករុករក", minPoints: 250, maxPoints: 500 },
  { level: 4, title: "Achiever", titleKh: "អ្នកសម្រេច", minPoints: 500, maxPoints: 1000 },
  { level: 5, title: "Scholar", titleKh: "អ្នកប្រាជ្ញ", minPoints: 1000, maxPoints: 2000 },
  { level: 6, title: "Expert", titleKh: "អ្នកជំនាញ", minPoints: 2000, maxPoints: 3500 },
  { level: 7, title: "Master", titleKh: "មេ", minPoints: 3500, maxPoints: 5000 },
  { level: 8, title: "Champion", titleKh: "ជើងឯក", minPoints: 5000, maxPoints: 7500 },
  { level: 9, title: "Legend", titleKh: "វីរបុរស", minPoints: 7500, maxPoints: 10000 },
  { level: 10, title: "Grandmaster", titleKh: "មហាមេ", minPoints: 10000, maxPoints: Infinity },
];

// Define badges
const BADGES: Badge[] = [
  // Bronze Badges (Easy to earn)
  {
    id: "first-steps",
    name: "First Steps",
    nameKh: "ជំហានដំបូង",
    description: "Complete your first exercise",
    descriptionKh: "បញ្ចប់លំហាត់ដំបូងរបស់អ្នក",
    icon: "👣",
    category: "bronze",
    requirements: { type: "exercises", value: 1 },
  },
  {
    id: "point-collector",
    name: "Point Collector",
    nameKh: "អ្នកប្រមូលពិន្ទុ",
    description: "Earn 50 points",
    descriptionKh: "ទទួលបាន ៥០ ពិន្ទុ",
    icon: "💰",
    category: "bronze",
    requirements: { type: "points", value: 50 },
  },
  {
    id: "daily-learner",
    name: "Daily Learner",
    nameKh: "អ្នកសិក្សាប្រចាំថ្ងៃ",
    description: "Study for 3 days in a row",
    descriptionKh: "សិក្សា ៣ ថ្ងៃជាប់គ្នា",
    icon: "📅",
    category: "bronze",
    requirements: { type: "streak", value: 3 },
  },

  // Silver Badges (Moderate difficulty)
  {
    id: "exercise-master",
    name: "Exercise Master",
    nameKh: "មេលំហាត់",
    description: "Complete 50 exercises",
    descriptionKh: "បញ្ចប់លំហាត់ ៥០",
    icon: "🏃",
    category: "silver",
    requirements: { type: "exercises", value: 50 },
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    nameKh: "អ្នកចម្បាំងប្រចាំសប្តាហ៍",
    description: "Study for 7 days in a row",
    descriptionKh: "សិក្សា ៧ ថ្ងៃជាប់គ្នា",
    icon: "🗓️",
    category: "silver",
    requirements: { type: "streak", value: 7 },
  },
  {
    id: "point-hunter",
    name: "Point Hunter",
    nameKh: "អ្នកប្រមាញ់ពិន្ទុ",
    description: "Earn 500 points",
    descriptionKh: "ទទួលបាន ៥០០ ពិន្ទុ",
    icon: "🎯",
    category: "silver",
    requirements: { type: "points", value: 500 },
  },

  // Gold Badges (Challenging)
  {
    id: "perfectionist",
    name: "Perfectionist",
    nameKh: "អ្នកល្អឥតខ្ចោះ",
    description: "Get 10 perfect scores",
    descriptionKh: "ទទួលបានពិន្ទុពេញ ១០ ដង",
    icon: "⭐",
    category: "gold",
    requirements: { type: "perfect_score", value: 10 },
  },
  {
    id: "lesson-champion",
    name: "Lesson Champion",
    nameKh: "ជើងឯកមេរៀន",
    description: "Complete 100 lessons",
    descriptionKh: "បញ្ចប់មេរៀន ១០០",
    icon: "🏆",
    category: "gold",
    requirements: { type: "lessons", value: 100 },
  },
  {
    id: "dedication",
    name: "Dedication",
    nameKh: "ការប្តេជ្ញាចិត្ត",
    description: "Study for 30 days in a row",
    descriptionKh: "សិក្សា ៣០ ថ្ងៃជាប់គ្នា",
    icon: "🔥",
    category: "gold",
    requirements: { type: "streak", value: 30 },
  },

  // Platinum Badges (Very challenging)
  {
    id: "grand-scholar",
    name: "Grand Scholar",
    nameKh: "មហាបណ្ឌិត",
    description: "Earn 5000 points",
    descriptionKh: "ទទួលបាន ៥០០០ ពិន្ទុ",
    icon: "🎓",
    category: "platinum",
    requirements: { type: "points", value: 5000 },
  },
  {
    id: "time-investor",
    name: "Time Investor",
    nameKh: "អ្នកវិនិយោគពេលវេលា",
    description: "Study for 100 hours",
    descriptionKh: "សិក្សា ១០០ ម៉ោង",
    icon: "⏰",
    category: "platinum",
    requirements: { type: "time_spent", value: 6000 }, // 100 hours in minutes
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    nameKh: "មិនអាចបញ្ឈប់",
    description: "Study for 100 days in a row",
    descriptionKh: "សិក្សា ១០០ ថ្ងៃជាប់គ្នា",
    icon: "🚀",
    category: "platinum",
    requirements: { type: "streak", value: 100 },
  },
];

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user && isLoaded) {
      fetchUserStats();
    }
  }, [user, isLoaded]);

  const fetchUserStats = async () => {
    if (!mountedRef.current) return;
    
    try {
      // Mock data for demonstration
      const mockStats: UserStats = {
        totalPoints: 1250,
        currentLevel: 4,
        currentLevelProgress: 75,
        nextLevelPoints: 1000,
        badges: BADGES.map((badge, index) => ({
          ...badge,
          unlockedAt: index < 5 ? new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          progress: index < 5 ? 100 : Math.random() * 80,
        })),
        recentAchievements: [
          {
            id: "1",
            type: "badge_earned",
            title: "Week Warrior",
            titleKh: "អ្នកចម្បាំងប្រចាំសប្តាហ៍",
            description: "Studied for 7 days in a row",
            icon: "🗓️",
            earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            points: 50,
          },
          {
            id: "2",
            type: "level_up",
            title: "Level 4 Achieved!",
            titleKh: "សម្រេចកម្រិត ៤!",
            description: "You are now an Achiever",
            icon: "🎉",
            earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            points: 100,
          },
        ],
        rank: 42,
        totalUsers: 1234,
      };

      if (mountedRef.current) {
        setUserStats(mockStats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addPoints = useCallback(async (points: number, reason: string) => {
    if (!userStats || !mountedRef.current) return;

    try {
      // API call would go here
      const newTotalPoints = userStats.totalPoints + points;
      
      // Check for level up
      const currentLevelData = LEVELS.find(l => l.level === userStats.currentLevel);
      const nextLevel = LEVELS.find(l => l.minPoints <= newTotalPoints && l.maxPoints > newTotalPoints);
      
      if (nextLevel && nextLevel.level > userStats.currentLevel) {
        // Level up!
        const achievement: Achievement = {
          id: `level-${nextLevel.level}`,
          type: "level_up",
          title: `Level ${nextLevel.level} Achieved!`,
          titleKh: `សម្រេចកម្រិត ${nextLevel.level}!`,
          description: `You are now ${nextLevel.title}`,
          icon: "🎉",
          earnedAt: new Date().toISOString(),
          points: 100,
        };
        
        celebrateAchievement(achievement);
      }

      // Update user stats only if component is still mounted
      if (mountedRef.current) {
        setUserStats(prev => {
          if (!prev) return null;
          
          const updatedStats = {
            ...prev,
            totalPoints: newTotalPoints,
            currentLevel: nextLevel?.level || prev.currentLevel,
            currentLevelProgress: nextLevel 
              ? ((newTotalPoints - nextLevel.minPoints) / (nextLevel.maxPoints - nextLevel.minPoints)) * 100
              : prev.currentLevelProgress,
          };
          
          return updatedStats;
        });

        // Show points notification
        toast({
          title: `+${points} Points!`,
          description: reason,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding points:", error);
    }
  }, [userStats, toast]);

  const checkBadgeProgress = useCallback(async () => {
    if (!userStats || !mountedRef.current) return;

    try {
      // Check each badge for unlock conditions
      const updatedBadges = userStats.badges.map(badge => {
        if (badge.unlockedAt) return badge;

        // Check if badge should be unlocked based on current stats
        let shouldUnlock = false;
        let progress = 0;

        switch (badge.requirements.type) {
          case "points":
            progress = (userStats.totalPoints / badge.requirements.value) * 100;
            shouldUnlock = userStats.totalPoints >= badge.requirements.value;
            break;
          // Add other requirement type checks here
        }

        if (shouldUnlock && !badge.unlockedAt) {
          const achievement: Achievement = {
            id: `badge-${badge.id}`,
            type: "badge_earned",
            title: badge.name,
            titleKh: badge.nameKh,
            description: badge.description,
            icon: badge.icon,
            earnedAt: new Date().toISOString(),
            points: badge.category === "bronze" ? 25 : badge.category === "silver" ? 50 : badge.category === "gold" ? 100 : 200,
          };
          
          celebrateAchievement(achievement);
          
          return {
            ...badge,
            unlockedAt: new Date().toISOString(),
            progress: 100,
          };
        }

        return { ...badge, progress };
      });

      if (mountedRef.current) {
        setUserStats(prev => prev ? { ...prev, badges: updatedBadges } : null);
      }
    } catch (error) {
      console.error("Error checking badge progress:", error);
    }
  }, [userStats]);

  const celebrateAchievement = useCallback((achievement: Achievement) => {
    if (!mountedRef.current) return;

    // Show achievement notification
    toast({
      title: achievement.title,
      description: (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{achievement.icon}</span>
          <span>{achievement.description}</span>
        </div>
      ),
      duration: 5000,
      className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200",
    });

    // Update recent achievements
    if (mountedRef.current) {
      setUserStats(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          recentAchievements: [achievement, ...prev.recentAchievements].slice(0, 10),
        };
      });
    }
  }, [toast]);

  return (
    <GamificationContext.Provider
      value={{
        userStats,
        addPoints,
        checkBadgeProgress,
        celebrateAchievement,
        loading,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
}