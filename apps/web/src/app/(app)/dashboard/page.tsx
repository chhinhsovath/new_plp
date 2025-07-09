"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/contexts/UserRoleContext";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Target,
  Flame,
  Clock,
  BookOpen,
  Brain,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  Star,
  Zap,
  Users,
  Video,
  FileText,
  BarChart3,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, startOfWeek, eachDayOfInterval, subDays } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";

interface DashboardData {
  user: {
    name: string;
    grade: string;
    avatar?: string;
    points: number;
    level: number;
    nextLevelPoints: number;
    streak: number;
    longestStreak: number;
  };
  stats: {
    totalLessonsCompleted: number;
    totalExercises: number;
    totalTimeSpent: number; // in minutes
    averageScore: number;
    subjectsInProgress: number;
    assessmentsTaken: number;
    videosWatched: number;
    booksRead: number;
  };
  progress: {
    overall: number;
    subjects: Array<{
      id: string;
      name: string;
      icon: string;
      progress: number;
      lessonsCompleted: number;
      totalLessons: number;
      lastActivity?: string;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: "lesson" | "exercise" | "assessment" | "video" | "book";
    title: string;
    subject?: string;
    completedAt: string;
    score?: number;
  }>;
  weeklyActivity: Array<{
    date: string;
    exercises: number;
    minutes: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress?: number;
    total?: number;
  }>;
  upcomingLessons: Array<{
    id: string;
    title: string;
    subject: string;
    dueDate?: string;
    difficulty: string;
  }>;
}

export default function StudentDashboard() {
  const { user } = useUser();
  const { userRole, isStudent, isTeacher, isParent, isAdmin } = useUserRole();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    // Redirect based on role
    if (userRole && !isStudent) {
      if (isTeacher) {
        window.location.href = "/teacher/dashboard";
      } else if (isParent) {
        window.location.href = "/parent/dashboard";
      } else if (isAdmin) {
        window.location.href = "/admin";
      }
    }
  }, [userRole, isStudent, isTeacher, isParent, isAdmin]);

  useEffect(() => {
    if (isStudent) {
      fetchDashboardData();
    }
  }, [isStudent]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // For now, using mock data
      const mockData: DashboardData = {
        user: {
          name: user?.firstName || "Student",
          grade: "Grade 5",
          avatar: user?.imageUrl,
          points: 1250,
          level: 8,
          nextLevelPoints: 1500,
          streak: 7,
          longestStreak: 15,
        },
        stats: {
          totalLessonsCompleted: 45,
          totalExercises: 238,
          totalTimeSpent: 1240, // ~20 hours
          averageScore: 85,
          subjectsInProgress: 4,
          assessmentsTaken: 12,
          videosWatched: 28,
          booksRead: 15,
        },
        progress: {
          overall: 68,
          subjects: [
            {
              id: "math",
              name: "Mathematics",
              icon: "🔢",
              progress: 75,
              lessonsCompleted: 15,
              totalLessons: 20,
              lastActivity: "2 hours ago",
            },
            {
              id: "khmer",
              name: "Khmer",
              icon: "🇰🇭",
              progress: 82,
              lessonsCompleted: 18,
              totalLessons: 22,
              lastActivity: "Yesterday",
            },
            {
              id: "english",
              name: "English",
              icon: "🔤",
              progress: 65,
              lessonsCompleted: 13,
              totalLessons: 20,
              lastActivity: "3 days ago",
            },
            {
              id: "science",
              name: "Science",
              icon: "🔬",
              progress: 55,
              lessonsCompleted: 11,
              totalLessons: 20,
              lastActivity: "1 week ago",
            },
          ],
        },
        recentActivity: [
          {
            id: "1",
            type: "exercise",
            title: "Multiplication Tables",
            subject: "Mathematics",
            completedAt: new Date().toISOString(),
            score: 95,
          },
          {
            id: "2",
            type: "video",
            title: "Introduction to Photosynthesis",
            subject: "Science",
            completedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            type: "assessment",
            title: "English Grammar Test",
            subject: "English",
            completedAt: new Date(Date.now() - 172800000).toISOString(),
            score: 88,
          },
        ],
        weeklyActivity: generateWeeklyActivity(),
        achievements: [
          {
            id: "1",
            name: "Fast Learner",
            description: "Complete 10 lessons in a week",
            icon: "🚀",
            unlockedAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: "2",
            name: "Math Master",
            description: "Score 90% or higher in 5 math exercises",
            icon: "🧮",
            progress: 3,
            total: 5,
          },
          {
            id: "3",
            name: "Bookworm",
            description: "Read 20 books",
            icon: "📚",
            progress: 15,
            total: 20,
          },
          {
            id: "4",
            name: "Perfect Week",
            description: "Study every day for a week",
            icon: "⭐",
            unlockedAt: new Date(Date.now() - 604800000).toISOString(),
          },
        ],
        upcomingLessons: [
          {
            id: "1",
            title: "Fractions and Decimals",
            subject: "Mathematics",
            difficulty: "MEDIUM",
          },
          {
            id: "2",
            title: "Writing Formal Letters",
            subject: "Khmer",
            difficulty: "HARD",
          },
          {
            id: "3",
            title: "Past Tense Verbs",
            subject: "English",
            difficulty: "EASY",
          },
        ],
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return <div>Error loading dashboard</div>;
  }

  const levelProgress = 
    ((dashboardData.user.points - (dashboardData.user.level - 1) * 250) / 
    (dashboardData.user.nextLevelPoints - (dashboardData.user.level - 1) * 250)) * 100;

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarImage src={dashboardData.user.avatar} />
              <AvatarFallback>{dashboardData.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Welcome back, {dashboardData.user.name}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {dashboardData.user.grade} • Level {dashboardData.user.level}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-bold">
              <Flame className={cn(
                "h-5 w-5 sm:h-6 sm:w-6",
                dashboardData.user.streak > 0 ? "text-orange-500" : "text-gray-400"
              )} />
              {dashboardData.user.streak} day streak
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Longest: {dashboardData.user.longestStreak} days
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Level {dashboardData.user.level}</span>
            <span>{dashboardData.user.points} / {dashboardData.user.nextLevelPoints} XP</span>
          </div>
          <Progress value={levelProgress} className="h-3" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{dashboardData.stats.totalLessonsCompleted}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exercises Done</p>
                <p className="text-2xl font-bold">{dashboardData.stats.totalExercises}</p>
              </div>
              <Brain className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{dashboardData.stats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Studied</p>
                <p className="text-2xl font-bold">{Math.floor(dashboardData.stats.totalTimeSpent / 60)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your learning activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.weeklyActivity}>
                      <defs>
                        <linearGradient id="colorExercises" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="exercises" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorExercises)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#82ca9d" 
                        fillOpacity={1} 
                        fill="url(#colorMinutes)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump back into learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/subjects">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Practice Exercises
                  </Button>
                </Link>
                <Link href="/assessments">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Button>
                </Link>
                <Link href="/videos">
                  <Button className="w-full justify-start" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      activity.type === "exercise" && "bg-blue-100 text-blue-600",
                      activity.type === "video" && "bg-purple-100 text-purple-600",
                      activity.type === "assessment" && "bg-green-100 text-green-600",
                      activity.type === "lesson" && "bg-orange-100 text-orange-600",
                      activity.type === "book" && "bg-pink-100 text-pink-600"
                    )}>
                      {activity.type === "exercise" && <Brain className="h-5 w-5" />}
                      {activity.type === "video" && <Video className="h-5 w-5" />}
                      {activity.type === "assessment" && <FileText className="h-5 w-5" />}
                      {activity.type === "lesson" && <BookOpen className="h-5 w-5" />}
                      {activity.type === "book" && <BookOpen className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.subject} • {format(new Date(activity.completedAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    {activity.score !== undefined && (
                      <Badge variant="secondary">{activity.score}%</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.progress.subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{subject.icon}</span>
                      <div>
                        <CardTitle>{subject.name}</CardTitle>
                        <CardDescription>
                          {subject.lessonsCompleted} of {subject.totalLessons} lessons
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{subject.progress}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={subject.progress} className="h-2" />
                  {subject.lastActivity && (
                    <p className="text-sm text-muted-foreground">
                      Last studied: {subject.lastActivity}
                    </p>
                  )}
                  <Link href={`/subjects/${subject.id}`}>
                    <Button className="w-full" variant="outline">
                      Continue Learning
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Your journey across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {dashboardData.progress.overall}%
                  </div>
                  <p className="text-sm text-muted-foreground">Course Completion</p>
                </div>
                <Progress value={dashboardData.progress.overall} className="h-4" />
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{dashboardData.stats.subjectsInProgress}</p>
                    <p className="text-sm text-muted-foreground">Active Subjects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{dashboardData.stats.totalLessonsCompleted}</p>
                    <p className="text-sm text-muted-foreground">Lessons Done</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Learning Analytics</CardTitle>
                  <CardDescription>Track your progress over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedTimeRange === "week" ? "default" : "outline"}
                    onClick={() => setSelectedTimeRange("week")}
                  >
                    Week
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTimeRange === "month" ? "default" : "outline"}
                    onClick={() => setSelectedTimeRange("month")}
                  >
                    Month
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTimeRange === "year" ? "default" : "outline"}
                    onClick={() => setSelectedTimeRange("year")}
                  >
                    Year
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Spent Chart */}
                <div className="space-y-2">
                  <h4 className="font-medium">Time Spent Learning</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="minutes" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Exercises Completed Chart */}
                <div className="space-y-2">
                  <h4 className="font-medium">Exercises Completed</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="exercises" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{dashboardData.stats.totalExercises}</p>
                  <p className="text-sm text-muted-foreground">Exercises</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{dashboardData.stats.videosWatched}</p>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{dashboardData.stats.assessmentsTaken}</p>
                  <p className="text-sm text-muted-foreground">Tests</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">{dashboardData.stats.booksRead}</p>
                  <p className="text-sm text-muted-foreground">Books</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.achievements.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt;
              const progress = achievement.total 
                ? (achievement.progress! / achievement.total) * 100 
                : 100;

              return (
                <Card 
                  key={achievement.id} 
                  className={cn(
                    "transition-all",
                    !isUnlocked && "opacity-75"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "text-4xl p-3 rounded-lg",
                        isUnlocked ? "bg-yellow-100" : "bg-gray-100"
                      )}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {!isUnlocked && achievement.total && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.total}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        {isUnlocked && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Unlocked {format(new Date(achievement.unlockedAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Achievement Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">
                    {dashboardData.achievements.filter(a => a.unlockedAt).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Unlocked</p>
                </div>
                <div>
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">
                    {dashboardData.achievements.filter(a => !a.unlockedAt && a.progress).length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div>
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-semibold">
                    {dashboardData.achievements.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Lessons */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Suggested Next Steps</CardTitle>
          <CardDescription>Recommended lessons based on your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{lesson.title}</h4>
                  <Badge 
                    variant={
                      lesson.difficulty === "EASY" ? "secondary" :
                      lesson.difficulty === "MEDIUM" ? "default" :
                      "destructive"
                    }
                  >
                    {lesson.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{lesson.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

function generateWeeklyActivity() {
  const endDate = new Date();
  const startDate = subDays(endDate, 6);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(date => ({
    date: format(date, "EEE"),
    exercises: Math.floor(Math.random() * 15) + 5,
    minutes: Math.floor(Math.random() * 60) + 20,
  }));
}