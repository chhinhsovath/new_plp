"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  BookOpen,
  Star,
  Flame
} from "lucide-react";

interface ProgressData {
  user: any;
  stats: {
    totalPoints: number;
    level: number;
    streak: number;
    completedLessons: number;
    totalExercises: number;
    correctAnswers: number;
    accuracy: number;
  };
  subjectProgress: Array<{
    subject: any;
    lessons: any[];
    totalScore: number;
    completedLessons: number;
  }>;
  recentActivity: any[];
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/progress");
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading progress...</p>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No progress data available</p>
      </div>
    );
  }

  const { stats, subjectProgress, recentActivity } = progressData;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Progress</h1>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">Level {stats.level}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.correctAnswers}/{stats.totalExercises} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLessons}</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          {subjectProgress.map((subject) => {
            const progressPercentage = subject.lessons.length > 0
              ? Math.round((subject.completedLessons / subject.lessons.length) * 100)
              : 0;

            return (
              <Card key={subject.subject.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.subject.icon}</span>
                      <div>
                        <CardTitle>{subject.subject.name}</CardTitle>
                        <CardDescription>
                          {subject.completedLessons} of {subject.lessons.length} lessons completed
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{subject.totalScore} points</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={progressPercentage} className="mb-2" />
                  <p className="text-sm text-gray-600">{progressPercentage}% Complete</p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentActivity.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity yet. Start learning to see your progress!</p>
              </CardContent>
            </Card>
          ) : (
            recentActivity.map((activity, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${activity.isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
                    `}>
                      {activity.isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.exercise?.title || "Exercise"}</p>
                      <p className="text-sm text-gray-600">
                        {activity.exercise?.subject?.name} • {activity.exercise?.lesson?.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.score} points</p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                </div>
                <h3 className="font-semibold">First Steps</h3>
                <p className="text-sm text-gray-600 mt-1">Complete your first exercise</p>
                <Badge className="mt-2" variant="default">Earned</Badge>
              </CardContent>
            </Card>

            <Card className="text-center opacity-60">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold">Subject Master</h3>
                <p className="text-sm text-gray-600 mt-1">Complete all lessons in one subject</p>
                <Badge className="mt-2" variant="secondary">Locked</Badge>
              </CardContent>
            </Card>

            <Card className="text-center opacity-60">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold">Hot Streak</h3>
                <p className="text-sm text-gray-600 mt-1">Maintain a 7-day streak</p>
                <Badge className="mt-2" variant="secondary">Locked</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}