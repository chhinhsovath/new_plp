"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGamification } from "@/contexts/GamificationContext";
import { BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Lock,
  Star,
  Award,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  Zap,
  Shield,
  Crown,
  Gem,
} from "lucide-react";

interface BadgeShowcaseProps {
  className?: string;
  showProgress?: boolean;
  columns?: number;
}

export function BadgeShowcase({
  className,
  showProgress = true,
  columns = 4,
}: BadgeShowcaseProps) {
  const { userStats } = useGamification();
  const { isKhmer } = useLanguage();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "bronze" | "silver" | "gold" | "platinum">("all");

  if (!userStats) return null;

  const filteredBadges = selectedCategory === "all" 
    ? userStats.badges 
    : userStats.badges.filter(b => b.category === selectedCategory);

  const earnedBadges = filteredBadges.filter(b => b.unlockedAt);
  const lockedBadges = filteredBadges.filter(b => !b.unlockedAt);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bronze":
        return <Shield className="h-4 w-4 text-orange-600" />;
      case "silver":
        return <Star className="h-4 w-4 text-gray-400" />;
      case "gold":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "platinum":
        return <Gem className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bronze":
        return "border-orange-200 bg-orange-50";
      case "silver":
        return "border-gray-200 bg-gray-50";
      case "gold":
        return "border-yellow-200 bg-yellow-50";
      case "platinum":
        return "border-purple-200 bg-purple-50";
      default:
        return "";
    }
  };

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <BilingualText en="Badge Collection" km="ការប្រមូលស្លាកសញ្ញា" />
              </CardTitle>
              <CardDescription>
                <BilingualText
                  en={`${earnedBadges.length} of ${userStats.badges.length} badges earned`}
                  km={`ទទួលបាន ${earnedBadges.length} ក្នុងចំណោម ${userStats.badges.length} ស្លាកសញ្ញា`}
                />
              </CardDescription>
            </div>
            {showProgress && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  <FormattedNumber value={(earnedBadges.length / userStats.badges.length) * 100} type="percentage" decimals={0} />
                </p>
                <p className="text-xs text-muted-foreground">
                  <BilingualText en="Complete" km="បានបញ្ចប់" />
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">
                <BilingualText en="All" km="ទាំងអស់" />
              </TabsTrigger>
              <TabsTrigger value="bronze" className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-orange-600" />
                <span className="hidden sm:inline"><BilingualText en="Bronze" km="សំរិទ្ធ" /></span>
              </TabsTrigger>
              <TabsTrigger value="silver" className="flex items-center gap-1">
                <Star className="h-3 w-3 text-gray-400" />
                <span className="hidden sm:inline"><BilingualText en="Silver" km="ប្រាក់" /></span>
              </TabsTrigger>
              <TabsTrigger value="gold" className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="hidden sm:inline"><BilingualText en="Gold" km="មាស" /></span>
              </TabsTrigger>
              <TabsTrigger value="platinum" className="flex items-center gap-1">
                <Gem className="h-3 w-3 text-purple-600" />
                <span className="hidden sm:inline"><BilingualText en="Platinum" km="ប្លាទីន" /></span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-6">
              {/* Earned Badges */}
              {earnedBadges.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    <BilingualText en="Earned Badges" km="ស្លាកសញ្ញាដែលទទួលបាន" />
                  </h3>
                  <div className={cn(
                    "grid gap-4",
                    `grid-cols-2 sm:grid-cols-3 md:grid-cols-${columns}`
                  )}>
                    {earnedBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isLocked={false}
                        onClick={() => setSelectedBadge(badge)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Badges */}
              {lockedBadges.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    <BilingualText en="Locked Badges" km="ស្លាកសញ្ញាដែលនៅជាប់សោ" />
                  </h3>
                  <div className={cn(
                    "grid gap-4",
                    `grid-cols-2 sm:grid-cols-3 md:grid-cols-${columns}`
                  )}>
                    {lockedBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isLocked={true}
                        onClick={() => setSelectedBadge(badge)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-4xl">{selectedBadge?.icon}</span>
              <div>
                <p>{isKhmer ? selectedBadge?.nameKh : selectedBadge?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryIcon(selectedBadge?.category)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {selectedBadge?.category}
                  </span>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              {isKhmer ? selectedBadge?.descriptionKh : selectedBadge?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedBadge?.unlockedAt ? (
              <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg">
                <span className="font-medium">
                  <BilingualText en="Earned on" km="ទទួលបាននៅ" />
                </span>
                <FormattedDate date={selectedBadge.unlockedAt} format="long" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span><BilingualText en="Progress" km="វឌ្ឍនភាព" /></span>
                    <span className="font-medium">
                      <FormattedNumber value={selectedBadge?.progress || 0} type="percentage" decimals={0} />
                    </span>
                  </div>
                  <Progress value={selectedBadge?.progress || 0} className="h-2" />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">
                    <BilingualText en="How to earn:" km="របៀបទទួលបាន៖" />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getRequirementText(selectedBadge?.requirements, isKhmer)}
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface BadgeCardProps {
  badge: any;
  isLocked: boolean;
  onClick: () => void;
}

function BadgeCard({ badge, isLocked, onClick }: BadgeCardProps) {
  const { isKhmer } = useLanguage();

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        isLocked && "opacity-60",
        badge.category && getCategoryColor(badge.category)
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className="relative inline-block mb-2">
          <span className="text-3xl sm:text-4xl">{badge.icon}</span>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <h4 className="font-medium text-sm line-clamp-1">
          {isKhmer ? badge.nameKh : badge.name}
        </h4>
        {badge.progress !== undefined && !badge.unlockedAt && (
          <Progress value={badge.progress} className="h-1 mt-2" />
        )}
        {badge.unlockedAt && (
          <Badge variant="secondary" className="mt-2 text-xs">
            <BilingualText en="Earned" km="ទទួលបាន" />
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "bronze":
      return "border-orange-200 hover:border-orange-300";
    case "silver":
      return "border-gray-200 hover:border-gray-300";
    case "gold":
      return "border-yellow-200 hover:border-yellow-300";
    case "platinum":
      return "border-purple-200 hover:border-purple-300";
    default:
      return "";
  }
}

function getRequirementText(requirement: any, isKhmer: boolean): string {
  if (!requirement) return "";

  const value = requirement.value;
  
  switch (requirement.type) {
    case "points":
      return isKhmer ? `ទទួលបាន ${value} ពិន្ទុ` : `Earn ${value} points`;
    case "streak":
      return isKhmer ? `សិក្សា ${value} ថ្ងៃជាប់គ្នា` : `Study for ${value} days in a row`;
    case "exercises":
      return isKhmer ? `បញ្ចប់លំហាត់ ${value}` : `Complete ${value} exercises`;
    case "lessons":
      return isKhmer ? `បញ្ចប់មេរៀន ${value}` : `Complete ${value} lessons`;
    case "perfect_score":
      return isKhmer ? `ទទួលបានពិន្ទុពេញ ${value} ដង` : `Get ${value} perfect scores`;
    case "time_spent":
      return isKhmer ? `សិក្សា ${Math.floor(value / 60)} ម៉ោង` : `Study for ${Math.floor(value / 60)} hours`;
    default:
      return "";
  }
}