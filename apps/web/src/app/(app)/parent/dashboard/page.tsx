"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualHeading, BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { SubjectProgressCard } from "@/components/progress/SubjectProgressCard";
import { StreakDisplay } from "@/components/progress/StreakDisplay";
import { AchievementBadge } from "@/components/progress/AchievementBadge";
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Target,
  Award,
  Eye,
  MessageSquare,
  Bell,
  Settings,
  UserPlus,
  Shield,
  CreditCard,
  FileText,
  PieChart,
  BarChart3,
  Download,
  Timer,
  Brain,
  Zap,
  Star,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Child {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grade: number;
  age: number;
  enrolledDate: string;
  status: "active" | "inactive";
  stats: {
    overallProgress: number;
    averageScore: number;
    totalTimeSpent: number; // minutes
    lessonsCompleted: number;
    exercisesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    weeklyGoal: number;
    weeklyProgress: number;
  };
  subjects: SubjectProgress[];
  recentActivity: Activity[];
  achievements: Achievement[];
  upcomingLessons: UpcomingLesson[];
  performanceHistory: PerformanceData[];
}

interface SubjectProgress {
  id: string;
  name: string;
  nameKh?: string;
  icon: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  exercisesCompleted: number;
  totalExercises: number;
  averageScore: number;
  lastActivity?: string;
  trend: "up" | "down" | "stable";
}

interface Activity {
  id: string;
  date: string;
  type: "lesson" | "exercise" | "assessment" | "video" | "achievement";
  title: string;
  subject?: string;
  score?: number;
  timeSpent: number;
  details?: string;
}

interface Achievement {
  id: string;
  title: string;
  titleKh?: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: "streak" | "completion" | "mastery" | "participation";
}

interface UpcomingLesson {
  id: string;
  title: string;
  subject: string;
  scheduledDate: string;
  estimatedDuration: number;
}

interface PerformanceData {
  date: string;
  score: number;
  timeSpent: number;
}

interface ParentSettings {
  notifications: {
    dailyReport: boolean;
    weeklyReport: boolean;
    achievements: boolean;
    lowPerformance: boolean;
  };
  limits: {
    dailyTimeLimit: number; // minutes
    breakReminder: number; // minutes
  };
  privacy: {
    allowDataSharing: boolean;
    allowProgressSharing: boolean;
  };
}

export default function ParentDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [parentSettings, setParentSettings] = useState<ParentSettings>({
    notifications: {
      dailyReport: true,
      weeklyReport: true,
      achievements: true,
      lowPerformance: true,
    },
    limits: {
      dailyTimeLimit: 120,
      breakReminder: 30,
    },
    privacy: {
      allowDataSharing: false,
      allowProgressSharing: true,
    },
  });

  useEffect(() => {
    checkParentRole();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const checkParentRole = async () => {
    if (!user) return;
    
    try {
      const response = await api.get("/users/me");
      if (response.data.role !== "PARENT") {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };

  const fetchChildren = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockChildren: Child[] = [
        {
          id: "child-1",
          name: "Sophea Kim",
          email: "sophea.kim@school.edu",
          avatar: `https://ui-avatars.com/api/?name=Sophea+Kim&background=random`,
          grade: 5,
          age: 11,
          enrolledDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          stats: {
            overallProgress: 72,
            averageScore: 85,
            totalTimeSpent: 2480,
            lessonsCompleted: 58,
            exercisesCompleted: 245,
            currentStreak: 5,
            longestStreak: 12,
            weeklyGoal: 7,
            weeklyProgress: 5,
          },
          subjects: generateSubjectProgress(),
          recentActivity: generateRecentActivity(),
          achievements: generateAchievements(),
          upcomingLessons: generateUpcomingLessons(),
          performanceHistory: generatePerformanceHistory(),
        },
        {
          id: "child-2",
          name: "Dara Kim",
          email: "dara.kim@school.edu",
          avatar: `https://ui-avatars.com/api/?name=Dara+Kim&background=random`,
          grade: 3,
          age: 9,
          enrolledDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          stats: {
            overallProgress: 65,
            averageScore: 78,
            totalTimeSpent: 1860,
            lessonsCompleted: 42,
            exercisesCompleted: 189,
            currentStreak: 3,
            longestStreak: 8,
            weeklyGoal: 5,
            weeklyProgress: 3,
          },
          subjects: generateSubjectProgress(),
          recentActivity: generateRecentActivity(),
          achievements: generateAchievements(),
          upcomingLessons: generateUpcomingLessons(),
          performanceHistory: generatePerformanceHistory(),
        },
      ];

      setChildren(mockChildren);
      if (mockChildren.length > 0) {
        setSelectedChild(mockChildren[0].id);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const addChild = async () => {
    if (!childEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide your child's email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call would go here
      console.log("Adding child:", childEmail);
      
      toast({
        title: "Child Added",
        description: "Your child has been added successfully",
      });
      
      setIsAddChildDialogOpen(false);
      setChildEmail("");
      
      // Refresh children list
      await fetchChildren();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateSettings = async () => {
    try {
      // API call would go here
      console.log("Updating settings:", parentSettings);
      
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
      });
      
      setIsSettingsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateReport = (childId: string) => {
    // Generate and download progress report
    console.log("Generating report for child:", childId);
    toast({
      title: "Report Generated",
      description: "The progress report has been downloaded",
    });
  };

  if (loading) {
    return <ParentDashboardSkeleton />;
  }

  const currentChild = children.find(c => c.id === selectedChild);

  if (!currentChild) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              <BilingualText en="No Children Added" km="មិនមានកូនត្រូវបានបន្ថែម" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              <BilingualText
                en="Add your children to monitor their progress"
                km="បន្ថែមកូនរបស់អ្នកដើម្បីតាមដានវឌ្ឍនភាពរបស់ពួកគេ"
              />
            </p>
            <Button onClick={() => setIsAddChildDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              <BilingualText en="Add Child" km="បន្ថែមកូន" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <BilingualHeading
              en={`Welcome back, ${user?.firstName || "Parent"}!`}
              km={`សូមស្វាគមន៍ការត្រឡប់មកវិញ ${user?.firstName || "មាតាបិតា"}!`}
              level={1}
              className="mb-2 text-2xl sm:text-3xl"
            />
            <BilingualText
              en="Monitor your children's learning progress"
              km="តាមដានវឌ្ឍនភាពសិក្សារបស់កូនអ្នក"
              className="text-sm sm:text-lg text-muted-foreground"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)} className="flex-1 sm:flex-initial">
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline"><BilingualText en="Settings" km="ការកំណត់" /></span>
              <span className="sm:hidden"><BilingualText en="Settings" km="កំណត់" /></span>
            </Button>
            <Button onClick={() => setIsAddChildDialogOpen(true)} className="flex-1 sm:flex-initial">
              <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline"><BilingualText en="Add Child" km="បន្ថែមកូន" /></span>
              <span className="sm:hidden"><BilingualText en="Add" km="បន្ថែម" /></span>
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} • <FormattedNumber value={child.grade} type="grade" />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Performance Alert */}
      {currentChild.stats.averageScore < 70 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            <BilingualText en="Performance Alert" km="ការជូនដំណឹងអំពីការអនុវត្ត" />
          </AlertTitle>
          <AlertDescription>
            <BilingualText
              en={`${currentChild.name} may need additional support in some subjects.`}
              km={`${currentChild.name} ប្រហែលជាត្រូវការជំនួយបន្ថែមក្នុងមុខវិជ្ជាមួយចំនួន។`}
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Overall Progress" km="វឌ្ឍនភាពរួម" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={currentChild.stats.overallProgress} type="percentage" />
                </p>
              </div>
              <ProgressRing progress={currentChild.stats.overallProgress} size={60} strokeWidth={6} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Average Score" km="ពិន្ទុមធ្យម" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={currentChild.stats.averageScore} type="percentage" />
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Study Time" km="ពេលវេលាសិក្សា" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={currentChild.stats.totalTimeSpent} type="duration" />
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <StreakDisplay currentStreak={currentChild.stats.currentStreak} />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="overview">
            <BilingualText en="Overview" km="ទិដ្ឋភាពទូទៅ" />
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BilingualText en="Subjects" km="មុខវិជ្ជា" />
          </TabsTrigger>
          <TabsTrigger value="activity">
            <BilingualText en="Activity" km="សកម្មភាព" />
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <BilingualText en="Achievements" km="សមិទ្ធិផល" />
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BilingualText en="Reports" km="របាយការណ៍" />
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Weekly Goal Progress" km="វឌ្ឍនភាពគោលដៅប្រចាំសប្តាហ៍" />
                </CardTitle>
                <CardDescription>
                  <BilingualText
                    en={`${currentChild.stats.weeklyProgress} of ${currentChild.stats.weeklyGoal} days completed`}
                    km={`${currentChild.stats.weeklyProgress} ក្នុងចំណោម ${currentChild.stats.weeklyGoal} ថ្ងៃបានបញ្ចប់`}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress 
                    value={(currentChild.stats.weeklyProgress / currentChild.stats.weeklyGoal) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("common.monday")}</span>
                    <span>{t("common.sunday")}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-8 rounded-md flex items-center justify-center",
                          i < currentChild.stats.weeklyProgress
                            ? "bg-green-500 text-white"
                            : "bg-muted"
                        )}
                      >
                        {i < currentChild.stats.weeklyProgress && (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Performance Trend" km="និន្នាការការអនុវត្ត" />
                </CardTitle>
                <CardDescription>
                  <BilingualText en="Last 7 days" km="៧ថ្ងៃចុងក្រោយ" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentChild.performanceHistory.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Upcoming Lessons" km="មេរៀនខាងមុខ" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Scheduled for this week" km="បានកំណត់សម្រាប់សប្តាហ៍នេះ" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentChild.upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.subject} • <FormattedDate date={lesson.scheduledDate} format="short" />
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Timer className="h-3 w-3 mr-1" />
                      <FormattedNumber value={lesson.estimatedDuration} type="duration" />
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance Radar */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Subject Performance" km="ការអនុវត្តតាមមុខវិជ្ជា" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={currentChild.subjects.map(s => ({
                    subject: s.name,
                    score: s.averageScore,
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentChild.subjects.map((subject) => (
              <SubjectProgressCard
                key={subject.id}
                subject={subject}
                showActions={false}
              />
            ))}
          </div>

          {/* Time Spent by Subject */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Time Distribution" km="ការបែងចែកពេលវេលា" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={currentChild.subjects.map(s => ({
                        name: s.name,
                        value: Math.floor(Math.random() * 100) + 50,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {currentChild.subjects.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Recent Activity" km="សកម្មភាពថ្មីៗ" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Your child's learning activities" km="សកម្មភាពសិក្សារបស់កូនអ្នក" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentChild.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      "p-2 rounded-full",
                      activity.type === "lesson" && "bg-blue-100 text-blue-600",
                      activity.type === "exercise" && "bg-green-100 text-green-600",
                      activity.type === "assessment" && "bg-purple-100 text-purple-600",
                      activity.type === "video" && "bg-orange-100 text-orange-600",
                      activity.type === "achievement" && "bg-yellow-100 text-yellow-600"
                    )}>
                      {activity.type === "lesson" && <BookOpen className="h-4 w-4" />}
                      {activity.type === "exercise" && <Brain className="h-4 w-4" />}
                      {activity.type === "assessment" && <FileText className="h-4 w-4" />}
                      {activity.type === "video" && <Eye className="h-4 w-4" />}
                      {activity.type === "achievement" && <Trophy className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          {activity.subject && (
                            <p className="text-sm text-muted-foreground">{activity.subject}</p>
                          )}
                          {activity.details && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {activity.score !== undefined && (
                            <Badge variant="secondary" className="mb-1">
                              <FormattedNumber value={activity.score} type="percentage" />
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            <FormattedDate date={activity.date} format="relative" />
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          <FormattedNumber value={activity.timeSpent} type="duration" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentChild.achievements.filter(a => a.unlockedAt).map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                title={achievement.title}
                titleKh={achievement.titleKh}
                description={achievement.description}
                icon={achievement.icon}
                unlockedAt={achievement.unlockedAt}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Locked Achievements" km="សមិទ្ធិផលដែលនៅជាប់សោ" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Keep learning to unlock these" km="បន្តសិក្សាដើម្បីដោះសោទាំងនេះ" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentChild.achievements.filter(a => !a.unlockedAt).map((achievement) => (
                  <div key={achievement.id} className="text-center p-4 border rounded-lg opacity-50">
                    <div className="text-3xl mb-2 grayscale">{achievement.icon}</div>
                    <p className="text-sm font-medium">
                      <BilingualText en={achievement.title} km={achievement.titleKh || achievement.title} />
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Progress Reports" km="របាយការណ៍វឌ្ឍនភាព" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Generate detailed reports for your child" km="បង្កើតរបាយការណ៍លម្អិតសម្រាប់កូនរបស់អ្នក" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => generateReport(currentChild.id)}
                  className="h-auto p-6 justify-start"
                  variant="outline"
                >
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">
                        <BilingualText en="Weekly Report" km="របាយការណ៍ប្រចាំសប្តាហ៍" />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <BilingualText
                          en="Summary of this week's progress"
                          km="សង្ខេបនៃវឌ្ឍនភាពសប្តាហ៍នេះ"
                        />
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => generateReport(currentChild.id)}
                  className="h-auto p-6 justify-start"
                  variant="outline"
                >
                  <div className="flex items-start gap-4">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">
                        <BilingualText en="Monthly Report" km="របាយការណ៍ប្រចាំខែ" />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <BilingualText
                          en="Detailed monthly analysis"
                          km="ការវិភាគលម្អិតប្រចាំខែ"
                        />
                      </p>
                    </div>
                  </div>
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">
                  <BilingualText en="Report History" km="ប្រវត្តិរបាយការណ៍" />
                </h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            <BilingualText en="Weekly Report" km="របាយការណ៍ប្រចាំសប្តាហ៍" />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <FormattedDate
                              date={new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()}
                              format="short"
                            />
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Child Dialog */}
      <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <BilingualText en="Add Your Child" km="បន្ថែមកូនរបស់អ្នក" />
            </DialogTitle>
            <DialogDescription>
              <BilingualText
                en="Enter your child's email to link their account"
                km="បញ្ចូលអ៊ីមែលរបស់កូនអ្នកដើម្បីភ្ជាប់គណនីរបស់ពួកគេ"
              />
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="childEmail">
                <BilingualText en="Child's Email" km="អ៊ីមែលរបស់កូន" />
              </Label>
              <Input
                id="childEmail"
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder={isKhmer ? "បញ្ចូលអ៊ីមែលរបស់កូន" : "Enter child's email"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddChildDialogOpen(false)}>
              <BilingualText en="Cancel" km="បោះបង់" />
            </Button>
            <Button onClick={addChild}>
              <BilingualText en="Add Child" km="បន្ថែមកូន" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <BilingualText en="Parent Settings" km="ការកំណត់មាតាបិតា" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <h4 className="font-medium mb-3">
                <BilingualText en="Notifications" km="ការជូនដំណឹង" />
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-report">
                    <BilingualText en="Daily Progress Report" km="របាយការណ៍វឌ្ឍនភាពប្រចាំថ្ងៃ" />
                  </Label>
                  <Switch
                    id="daily-report"
                    checked={parentSettings.notifications.dailyReport}
                    onCheckedChange={(checked) =>
                      setParentSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, dailyReport: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-report">
                    <BilingualText en="Weekly Summary" km="សង្ខេបប្រចាំសប្តាហ៍" />
                  </Label>
                  <Switch
                    id="weekly-report"
                    checked={parentSettings.notifications.weeklyReport}
                    onCheckedChange={(checked) =>
                      setParentSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, weeklyReport: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="achievements">
                    <BilingualText en="Achievement Unlocked" km="សមិទ្ធិផលដោះសោ" />
                  </Label>
                  <Switch
                    id="achievements"
                    checked={parentSettings.notifications.achievements}
                    onCheckedChange={(checked) =>
                      setParentSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, achievements: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="low-performance">
                    <BilingualText en="Low Performance Alert" km="ការជូនដំណឹងអំពីការអនុវត្តទាប" />
                  </Label>
                  <Switch
                    id="low-performance"
                    checked={parentSettings.notifications.lowPerformance}
                    onCheckedChange={(checked) =>
                      setParentSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, lowPerformance: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Screen Time Limits */}
            <div>
              <h4 className="font-medium mb-3">
                <BilingualText en="Screen Time Limits" km="ដែនកំណត់ពេលវេលាអេក្រង់" />
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="daily-limit">
                    <BilingualText en="Daily Time Limit (minutes)" km="ដែនកំណត់ពេលប្រចាំថ្ងៃ (នាទី)" />
                  </Label>
                  <Input
                    id="daily-limit"
                    type="number"
                    value={parentSettings.limits.dailyTimeLimit}
                    onChange={(e) =>
                      setParentSettings(prev => ({
                        ...prev,
                        limits: { ...prev.limits, dailyTimeLimit: parseInt(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="break-reminder">
                    <BilingualText en="Break Reminder (minutes)" km="ការរំលឹកសម្រាក (នាទី)" />
                  </Label>
                  <Input
                    id="break-reminder"
                    type="number"
                    value={parentSettings.limits.breakReminder}
                    onChange={(e) =>
                      setParentSettings(prev => ({
                        ...prev,
                        limits: { ...prev.limits, breakReminder: parseInt(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              <BilingualText en="Cancel" km="បោះបង់" />
            </Button>
            <Button onClick={updateSettings}>
              <BilingualText en="Save Settings" km="រក្សាទុកការកំណត់" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ParentDashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-6 w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#d084d0"];

function generateSubjectProgress(): SubjectProgress[] {
  return [
    {
      id: "math",
      name: "Mathematics",
      nameKh: "គណិតវិទ្យា",
      icon: "🔢",
      progress: 78,
      lessonsCompleted: 15,
      totalLessons: 20,
      exercisesCompleted: 82,
      totalExercises: 100,
      averageScore: 88,
      lastActivity: "2 hours ago",
      trend: "up",
    },
    {
      id: "khmer",
      name: "Khmer",
      nameKh: "ភាសាខ្មែរ",
      icon: "🇰🇭",
      progress: 85,
      lessonsCompleted: 17,
      totalLessons: 20,
      exercisesCompleted: 90,
      totalExercises: 100,
      averageScore: 92,
      lastActivity: "Yesterday",
      trend: "stable",
    },
    {
      id: "english",
      name: "English",
      nameKh: "ភាសាអង់គ្លេស",
      icon: "🔤",
      progress: 65,
      lessonsCompleted: 13,
      totalLessons: 20,
      exercisesCompleted: 68,
      totalExercises: 100,
      averageScore: 78,
      lastActivity: "3 days ago",
      trend: "down",
    },
    {
      id: "science",
      name: "Science",
      nameKh: "វិទ្យាសាស្ត្រ",
      icon: "🔬",
      progress: 70,
      lessonsCompleted: 14,
      totalLessons: 20,
      exercisesCompleted: 75,
      totalExercises: 100,
      averageScore: 82,
      lastActivity: "1 week ago",
      trend: "up",
    },
  ];
}

function generateRecentActivity(): Activity[] {
  const activities = [
    { type: "lesson" as const, title: "Fractions and Decimals", subject: "Mathematics" },
    { type: "exercise" as const, title: "Grammar Practice", subject: "Khmer" },
    { type: "achievement" as const, title: "Week Warrior Badge Earned", details: "Completed 7 days in a row!" },
    { type: "video" as const, title: "Science Experiments", subject: "Science" },
    { type: "assessment" as const, title: "Math Quiz", subject: "Mathematics" },
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    return {
      id: `activity-${i + 1}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      ...activity,
      score: activity.type !== "video" && activity.type !== "achievement" ? Math.floor(Math.random() * 30) + 70 : undefined,
      timeSpent: Math.floor(Math.random() * 45) + 15,
    };
  });
}

function generateAchievements(): Achievement[] {
  return [
    {
      id: "1",
      title: "First Steps",
      titleKh: "ជំហានដំបូង",
      description: "Complete your first lesson",
      icon: "👣",
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: "completion",
    },
    {
      id: "2",
      title: "Week Warrior",
      titleKh: "អ្នកចម្បាំងប្រចាំសប្តាហ៍",
      description: "Study for 7 days in a row",
      icon: "🗓️",
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "streak",
    },
    {
      id: "3",
      title: "Math Master",
      titleKh: "មេគណិតវិទ្យា",
      description: "Score 90% or higher in 10 math exercises",
      icon: "🧮",
      unlockedAt: undefined,
      category: "mastery",
    },
    {
      id: "4",
      title: "Explorer",
      titleKh: "អ្នករុករក",
      description: "Try all subjects",
      icon: "🧭",
      unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: "participation",
    },
    {
      id: "5",
      title: "Speed Learner",
      titleKh: "អ្នកសិក្សាលឿន",
      description: "Complete 5 lessons in one day",
      icon: "⚡",
      unlockedAt: undefined,
      category: "completion",
    },
  ];
}

function generateUpcomingLessons(): UpcomingLesson[] {
  return [
    {
      id: "1",
      title: "Multiplication Tables",
      subject: "Mathematics",
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 30,
    },
    {
      id: "2",
      title: "Reading Comprehension",
      subject: "Khmer",
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 45,
    },
    {
      id: "3",
      title: "Basic Vocabulary",
      subject: "English",
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 30,
    },
  ];
}

function generatePerformanceHistory(): PerformanceData[] {
  const days = 30;
  const data: PerformanceData[] = [];
  let baseScore = 75;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    baseScore = Math.max(60, Math.min(100, baseScore + (Math.random() - 0.4) * 5));
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(baseScore),
      timeSpent: Math.floor(Math.random() * 60) + 30,
    });
  }

  return data;
}