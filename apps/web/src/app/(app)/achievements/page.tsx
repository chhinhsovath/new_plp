"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GamificationProvider, useGamification } from "@/contexts/GamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualHeading, BilingualText } from "@/components/ui/bilingual-text";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import { LevelProgress } from "@/components/gamification/LevelProgress";
import { BadgeShowcase } from "@/components/gamification/BadgeShowcase";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Award,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Star,
  Crown,
  Flame,
  Clock,
  ChevronRight,
} from "lucide-react";

function AchievementsContent() {
  const { userStats, loading } = useGamification();
  const { isKhmer } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("overview");

  if (loading) {
    return <AchievementsSkeleton />;
  }

  if (!userStats) {
    return <div>Error loading achievements</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <BilingualHeading
          en="Achievements & Rewards"
          km="សមិទ្ធិផល និងរង្វាន់"
          level={1}
          className="mb-2 text-2xl sm:text-3xl"
        />
        <BilingualText
          en="Track your progress, earn badges, and climb the leaderboard"
          km="តាមដានវឌ្ឍនភាពរបស់អ្នក ទទួលបានស្លាកសញ្ញា និងឡើងលើតារាងពិន្ទុ"
          className="text-sm sm:text-lg text-muted-foreground"
        />
      </div>

      {/* Points Hero Section */}
      <PointsDisplay variant="hero" className="mb-6 sm:mb-8" />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <BilingualText en="Current Streak" km="ថ្ងៃជាប់គ្នា" />
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl sm:text-2xl font-bold">
                    <FormattedNumber value={userStats.badges[0]?.progress || 5} />
                  </p>
                  <span className="text-sm text-muted-foreground">
                    <BilingualText en="days" km="ថ្ងៃ" />
                  </span>
                </div>
              </div>
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <BilingualText en="Badges Earned" km="ស្លាកសញ្ញាទទួលបាន" />
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {userStats.badges.filter(b => b.unlockedAt).length}/{userStats.badges.length}
                </p>
              </div>
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <BilingualText en="Global Rank" km="ចំណាត់ថ្នាក់សកល" />
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  #{userStats.rank || 42}
                </p>
              </div>
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <BilingualText en="Time Studied" km="ពេលវេលាសិក្សា" />
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  <FormattedNumber value={42} />h
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="overview">
            <span className="hidden sm:inline"><BilingualText en="Overview" km="ទិដ្ឋភាពទូទៅ" /></span>
            <span className="sm:hidden"><BilingualText en="Overview" km="ទូទៅ" /></span>
          </TabsTrigger>
          <TabsTrigger value="badges">
            <span className="hidden sm:inline"><BilingualText en="Badges" km="ស្លាកសញ្ញា" /></span>
            <span className="sm:hidden"><BilingualText en="Badges" km="ស្លាក" /></span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <span className="hidden sm:inline"><BilingualText en="Leaderboard" km="តារាងពិន្ទុ" /></span>
            <span className="sm:hidden"><BilingualText en="Leaders" km="ពិន្ទុ" /></span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <span className="hidden sm:inline"><BilingualText en="History" km="ប្រវត្តិ" /></span>
            <span className="sm:hidden"><BilingualText en="History" km="ប្រវត្តិ" /></span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LevelProgress variant="card" showMilestones />
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    <BilingualText en="Recent Achievements" km="សមិទ្ធិផលថ្មីៗ" />
                  </CardTitle>
                  <CardDescription>
                    <BilingualText en="Your latest accomplishments" km="សមិទ្ធផលចុងក្រោយរបស់អ្នក" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userStats.recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {isKhmer ? achievement.titleKh : achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <FormattedDate date={achievement.earnedAt} format="relative" />
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            +{achievement.points} points
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <BadgeShowcase columns={2} />
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    <BilingualText en="Quick Stats" km="ស្ថិតិរហ័ស" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText en="Perfect Scores" km="ពិន្ទុពេញ" />
                    </span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText en="Exercises Completed" km="លំហាត់បានបញ្ចប់" />
                    </span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText en="Lessons Finished" km="មេរៀនបានបញ្ចប់" />
                    </span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText en="Videos Watched" km="វីដេអូបានមើល" />
                    </span>
                    <span className="font-medium">38</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <BadgeShowcase />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard timeRange="weekly" />
            <Leaderboard timeRange="all" />
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Achievement History" km="ប្រវត្តិសមិទ្ធិផល" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Your complete achievement timeline" km="ពេលវេលាសមិទ្ធិផលពេញលេញរបស់អ្នក" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline of achievements */}
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                  {userStats.recentAchievements.concat(userStats.recentAchievements).map((achievement, index) => (
                    <div key={`${achievement.id}-${index}`} className="relative flex gap-4 pb-8">
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2">
                        <span className="text-2xl">{achievement.icon}</span>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-medium">
                          {isKhmer ? achievement.titleKh : achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <FormattedDate date={achievement.earnedAt} format="long" />
                          <span>+{achievement.points} points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-64 bg-muted rounded animate-pulse mb-2" />
      <div className="h-6 w-96 bg-muted rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded animate-pulse" />
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <GamificationProvider>
      <AchievementsContent />
    </GamificationProvider>
  );
}