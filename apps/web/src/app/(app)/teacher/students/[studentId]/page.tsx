"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualHeading, BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { SubjectProgressCard } from "@/components/progress/SubjectProgressCard";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Activity,
  BookOpen,
  Brain,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface StudentDetailPageProps {
  params: {
    studentId: string;
  };
}

interface StudentDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  grade: number;
  className: string;
  enrollmentDate: string;
  parentName?: string;
  parentContact?: string;
  status: "active" | "inactive" | "struggling";
  stats: {
    overallProgress: number;
    averageScore: number;
    totalTimeSpent: number; // minutes
    lessonsCompleted: number;
    exercisesCompleted: number;
    assessmentsTaken: number;
    currentStreak: number;
    longestStreak: number;
  };
  subjects: SubjectProgress[];
  recentActivity: Activity[];
  performanceHistory: PerformanceData[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
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
  type: "lesson" | "exercise" | "assessment" | "video";
  title: string;
  subject: string;
  score?: number;
  timeSpent: number;
}

interface PerformanceData {
  date: string;
  score: number;
  exercises: number;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    fetchStudentDetails();
  }, [params.studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockStudent: StudentDetails = {
        id: params.studentId,
        name: "Sophea Kim",
        email: "sophea.kim@school.edu",
        phone: "+855 12 345 678",
        avatar: `https://ui-avatars.com/api/?name=Sophea+Kim&background=random`,
        grade: 5,
        className: "Grade 5A",
        enrollmentDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        parentName: "Mr. Kim Vannak",
        parentContact: "+855 12 987 654",
        status: "active",
        stats: {
          overallProgress: 72,
          averageScore: 85,
          totalTimeSpent: 2480, // ~41 hours
          lessonsCompleted: 58,
          exercisesCompleted: 245,
          assessmentsTaken: 12,
          currentStreak: 5,
          longestStreak: 12,
        },
        subjects: [
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
        ],
        recentActivity: generateRecentActivity(),
        performanceHistory: generatePerformanceHistory(),
        strengths: ["Mathematics problem solving", "Khmer reading comprehension", "Consistent daily practice"],
        weaknesses: ["English vocabulary", "Science terminology", "Time management in assessments"],
        recommendations: [
          "Increase English vocabulary practice with flashcards",
          "Focus on science experiments and hands-on activities",
          "Practice timed exercises to improve speed",
        ],
      };

      setStudent(mockStudent);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    // Implement messaging functionality
    console.log("Send message to student");
  };

  const generateReport = () => {
    // Implement report generation
    console.log("Generate progress report");
  };

  if (loading) {
    return <StudentDetailSkeleton />;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/teacher/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            <BilingualText en="Back to Dashboard" km="ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង" />
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.avatar} />
              <AvatarFallback>{student.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground">
                {student.className} • <BilingualText en="Student ID:" km="លេខសម្គាល់សិស្ស៖" /> {student.id}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={sendMessage} variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              <BilingualText en="Message" km="សារ" />
            </Button>
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              <BilingualText en="Generate Report" km="បង្កើតរបាយការណ៍" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {student.status === "struggling" && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            <BilingualText en="Attention Required" km="ត្រូវការការយកចិត្តទុកដាក់" />
          </AlertTitle>
          <AlertDescription>
            <BilingualText
              en="This student is struggling and may need additional support."
              km="សិស្សនេះកំពុងជួបការលំបាក ហើយប្រហែលជាត្រូវការជំនួយបន្ថែម។"
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Overall Progress" km="វឌ្ឍនភាពរួម" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={student.stats.overallProgress} type="percentage" />
                </p>
              </div>
              <ProgressRing progress={student.stats.overallProgress} size={60} strokeWidth={6} />
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
                  <FormattedNumber value={student.stats.averageScore} type="percentage" />
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
                  <FormattedNumber value={student.stats.totalTimeSpent} type="duration" />
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Current Streak" km="ថ្ងៃជាប់គ្នា" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={student.stats.currentStreak} /> <BilingualText en="days" km="ថ្ងៃ" />
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">
            <BilingualText en="Overview" km="ទិដ្ឋភាពទូទៅ" />
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BilingualText en="Subjects" km="មុខវិជ្ជា" />
          </TabsTrigger>
          <TabsTrigger value="activity">
            <BilingualText en="Activity" km="សកម្មភាព" />
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BilingualText en="Insights" km="ការយល់ដឹង" />
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Performance Trend" km="និន្នាការការអនុវត្ត" />
                </CardTitle>
                <CardDescription>
                  <BilingualText en="Average scores over time" km="ពិន្ទុមធ្យមតាមពេលវេលា" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={student.performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
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

            {/* Activity Overview */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Learning Activity" km="សកម្មភាពសិក្សា" />
                </CardTitle>
                <CardDescription>
                  <BilingualText en="Exercises completed over time" km="លំហាត់ដែលបានបញ្ចប់តាមពេលវេលា" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={student.performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="exercises" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Student Information" km="ព័ត៌មានសិស្ស" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <BilingualText en="Enrollment Date" km="កាលបរិច្ឆេទចុះឈ្មោះ" />
                    </p>
                    <p className="font-medium">
                      <FormattedDate date={student.enrollmentDate} format="long" />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <BilingualText en="Class" km="ថ្នាក់" />
                    </p>
                    <p className="font-medium">{student.className}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <BilingualText en="Status" km="ស្ថានភាព" />
                    </p>
                    <Badge 
                      variant="secondary"
                      className={
                        student.status === "active" ? "bg-green-100 text-green-700" :
                        student.status === "struggling" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {student.status === "active" && <BilingualText en="Active" km="សកម្ម" />}
                      {student.status === "inactive" && <BilingualText en="Inactive" km="អសកម្ម" />}
                      {student.status === "struggling" && <BilingualText en="Struggling" km="មានបញ្ហា" />}
                    </Badge>
                  </div>
                </div>
                {student.parentName && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <BilingualText en="Parent/Guardian" km="មាតាបិតា/អាណាព្យាបាល" />
                      </p>
                      <p className="font-medium">{student.parentName}</p>
                    </div>
                    {student.parentContact && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          <BilingualText en="Parent Contact" km="ទំនាក់ទំនងមាតាបិតា" />
                        </p>
                        <p className="font-medium">{student.parentContact}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {student.subjects.map((subject) => (
              <SubjectProgressCard
                key={subject.id}
                subject={subject}
                showActions={false}
              />
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Recent Activity" km="សកម្មភាពថ្មីៗ" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Detailed activity log" km="កំណត់ហេតុសកម្មភាពលម្អិត" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><BilingualText en="Date" km="កាលបរិច្ឆេទ" /></TableHead>
                    <TableHead><BilingualText en="Activity" km="សកម្មភាព" /></TableHead>
                    <TableHead><BilingualText en="Subject" km="មុខវិជ្ជា" /></TableHead>
                    <TableHead><BilingualText en="Score" km="ពិន្ទុ" /></TableHead>
                    <TableHead><BilingualText en="Time" km="ពេលវេលា" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <FormattedDate date={activity.date} format="short" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {activity.type === "lesson" && <BookOpen className="h-4 w-4 text-blue-600" />}
                          {activity.type === "exercise" && <Brain className="h-4 w-4 text-green-600" />}
                          {activity.type === "assessment" && <FileText className="h-4 w-4 text-purple-600" />}
                          {activity.title}
                        </div>
                      </TableCell>
                      <TableCell>{activity.subject}</TableCell>
                      <TableCell>
                        {activity.score !== undefined ? (
                          <Badge variant="secondary">
                            <FormattedNumber value={activity.score} type="percentage" />
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <FormattedNumber value={activity.timeSpent} type="duration" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <BilingualText en="Strengths" km="ចំណុចខ្លាំង" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {student.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <BilingualText en="Areas for Improvement" km="ចំណុចត្រូវកែលម្អ" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {student.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <BilingualText en="Recommendations" km="អនុសាសន៍" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {student.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Subject Trends */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Subject Performance Trends" km="និន្នាការការអនុវត្តតាមមុខវិជ្ជា" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                          <BilingualText en="Average:" km="មធ្យម៖" /> <FormattedNumber value={subject.averageScore} type="percentage" />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {subject.trend === "up" && (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      )}
                      {subject.trend === "down" && (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      {subject.trend === "stable" && (
                        <Activity className="h-5 w-5 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {subject.trend === "up" && <BilingualText en="Improving" km="កំពុងប្រសើរឡើង" />}
                        {subject.trend === "down" && <BilingualText en="Declining" km="កំពុងធ្លាក់ចុះ" />}
                        {subject.trend === "stable" && <BilingualText en="Stable" km="ស្ថិតស្ថេរ" />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StudentDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

function generateRecentActivity(): Activity[] {
  const activities = [
    { type: "exercise" as const, title: "Multiplication Practice", subject: "Mathematics" },
    { type: "lesson" as const, title: "Introduction to Fractions", subject: "Mathematics" },
    { type: "assessment" as const, title: "Grammar Quiz", subject: "Khmer" },
    { type: "video" as const, title: "Science Experiments", subject: "Science" },
    { type: "exercise" as const, title: "Vocabulary Builder", subject: "English" },
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    return {
      id: `activity-${i + 1}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      ...activity,
      score: activity.type !== "video" ? Math.floor(Math.random() * 30) + 70 : undefined,
      timeSpent: Math.floor(Math.random() * 45) + 15,
    };
  });
}

function generatePerformanceHistory(): PerformanceData[] {
  const days = 30;
  const data: PerformanceData[] = [];
  let baseScore = 75;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some randomness but trend upward
    baseScore = Math.max(60, Math.min(100, baseScore + (Math.random() - 0.4) * 5));
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(baseScore),
      exercises: Math.floor(Math.random() * 10) + 3,
    });
  }

  return data;
}