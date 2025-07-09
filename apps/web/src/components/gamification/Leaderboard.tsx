"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  Star,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  streak: number;
  badges: number;
  change: "up" | "down" | "same";
  changeValue?: number;
}

interface LeaderboardProps {
  timeRange?: "daily" | "weekly" | "monthly" | "all";
  limit?: number;
  showCurrentUser?: boolean;
  className?: string;
}

export function Leaderboard({
  timeRange = "weekly",
  limit = 10,
  showCurrentUser = true,
  className,
}: LeaderboardProps) {
  const { isKhmer } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTimeRange]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
        rank: i + 1,
        id: `user-${i + 1}`,
        name: generateName(i),
        avatar: `https://ui-avatars.com/api/?name=${generateName(i)}&background=random`,
        points: Math.max(5000 - i * 100 - Math.floor(Math.random() * 50), 100),
        level: Math.max(10 - Math.floor(i / 5), 1),
        streak: Math.max(30 - i, 0),
        badges: Math.max(20 - Math.floor(i / 3), 1),
        change: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "same",
        changeValue: i % 3 !== 2 ? Math.floor(Math.random() * 5) + 1 : undefined,
      }));

      setLeaderboard(mockLeaderboard.slice(0, limit));

      // Mock current user rank
      setCurrentUserRank({
        rank: 15,
        id: "current-user",
        name: "You",
        avatar: "https://ui-avatars.com/api/?name=You&background=primary",
        points: 2850,
        level: 6,
        streak: 12,
        badges: 8,
        change: "up",
        changeValue: 3,
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <BilingualText en="Leaderboard" km="តារាងពិន្ទុ" />
            </CardTitle>
            <CardDescription>
              <BilingualText
                en="Top performers this week"
                km="អ្នកដឹកនាំប្រចាំសប្តាហ៍នេះ"
              />
            </CardDescription>
          </div>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            <FormattedNumber value={1234} />
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedTimeRange} onValueChange={(v: any) => setSelectedTimeRange(v)}>
          <div className="px-6 pb-3">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily">
                <BilingualText en="Today" km="ថ្ងៃនេះ" />
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <BilingualText en="Week" km="សប្តាហ៍" />
              </TabsTrigger>
              <TabsTrigger value="monthly">
                <BilingualText en="Month" km="ខែ" />
              </TabsTrigger>
              <TabsTrigger value="all">
                <BilingualText en="All Time" km="គ្រប់ពេល" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTimeRange} className="mt-0">
            <div className="divide-y">
              {loading ? (
                <LeaderboardSkeleton />
              ) : (
                <>
                  {leaderboard.map((entry) => (
                    <LeaderboardEntry key={entry.id} entry={entry} />
                  ))}

                  {showCurrentUser && currentUserRank && currentUserRank.rank > limit && (
                    <>
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        <span>• • •</span>
                      </div>
                      <LeaderboardEntry
                        entry={currentUserRank}
                        isCurrentUser
                        className="bg-primary/5"
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full">
            <BilingualText en="View Full Leaderboard" km="មើលតារាងពិន្ទុពេញ" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface LeaderboardEntryProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  className?: string;
}

function LeaderboardEntry({ entry, isCurrentUser, className }: LeaderboardEntryProps) {
  const { isKhmer } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors",
        isCurrentUser && "font-medium",
        className
      )}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-10">
        {entry.rank <= 3 ? (
          getRankIcon(entry.rank)
        ) : (
          <Badge
            variant="secondary"
            className={cn("min-w-[2rem] justify-center", getRankBadgeColor(entry.rank))}
          >
            {entry.rank}
          </Badge>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.avatar} />
          <AvatarFallback>{entry.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">
            {isCurrentUser ? <BilingualText en="You" km="អ្នក" /> : entry.name}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Level {entry.level}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {entry.badges}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {entry.streak}d
            </span>
          </div>
        </div>
      </div>

      {/* Points & Change */}
      <div className="text-right">
        <p className="font-semibold">
          <FormattedNumber value={entry.points} />
        </p>
        {entry.change !== "same" && entry.changeValue && (
          <p
            className={cn(
              "text-xs flex items-center gap-1 justify-end",
              entry.change === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            {entry.change === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {entry.changeValue}
          </p>
        )}
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-6 py-3">
          <div className="w-10 h-8 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </>
  );
}

function generateName(index: number): string {
  const firstNames = ["Sophea", "Dara", "Sokha", "Pisey", "Vanna", "Srey", "Bopha", "Ratha"];
  const lastNames = ["Kim", "Chen", "Nguyen", "Sok", "Chan", "Lee", "Touch", "Heng"];
  
  return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
}