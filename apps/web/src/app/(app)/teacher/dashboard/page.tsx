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
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualHeading, BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  UserCheck,
  UserX,
  GraduationCap,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassData {
  id: string;
  name: string;
  grade: number;
  students: StudentData[];
  stats: {
    totalStudents: number;
    activeStudents: number;
    averageProgress: number;
    averageScore: number;
    lessonsCompleted: number;
    totalLessons: number;
  };
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number;
  averageScore: number;
  lastActive: string;
  lessonsCompleted: number;
  exercisesCompleted: number;
  status: "active" | "inactive" | "struggling";
  recentActivity?: {
    date: string;
    type: string;
    score?: number;
  };
}

interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  averageClassProgress: number;
  assignmentsDue: number;
  pendingReviews: number;
  upcomingLessons: Lesson[];
  recentSubmissions: Submission[];
  performanceBySubject: SubjectPerformance[];
  weeklyActivity: WeeklyActivity[];
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  scheduledDate: string;
  classId: string;
  className: string;
}

interface Submission {
  id: string;
  studentName: string;
  studentAvatar?: string;
  type: "exercise" | "assessment";
  title: string;
  submittedAt: string;
  score?: number;
  status: "pending" | "graded";
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  studentsCount: number;
  color: string;
}

interface WeeklyActivity {
  day: string;
  activeStudents: number;
  lessonsCompleted: number;
  exercisesSubmitted: number;
}

export default function TeacherDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "struggling">("all");
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    checkTeacherRole();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [selectedClass]);

  const checkTeacherRole = async () => {
    if (!user) return;
    
    try {
      const response = await api.get("/users/me");
      if (response.data.role !== "TEACHER") {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockClasses: ClassData[] = [
        {
          id: "1",
          name: "Grade 5A",
          grade: 5,
          students: generateMockStudents(28),
          stats: {
            totalStudents: 28,
            activeStudents: 24,
            averageProgress: 68,
            averageScore: 82,
            lessonsCompleted: 45,
            totalLessons: 80,
          },
        },
        {
          id: "2",
          name: "Grade 5B",
          grade: 5,
          students: generateMockStudents(26),
          stats: {
            totalStudents: 26,
            activeStudents: 22,
            averageProgress: 72,
            averageScore: 85,
            lessonsCompleted: 50,
            totalLessons: 80,
          },
        },
        {
          id: "3",
          name: "Grade 6A",
          grade: 6,
          students: generateMockStudents(30),
          stats: {
            totalStudents: 30,
            activeStudents: 27,
            averageProgress: 65,
            averageScore: 78,
            lessonsCompleted: 42,
            totalLessons: 85,
          },
        },
      ];

      const mockStats: DashboardStats = {
        totalStudents: 84,
        activeToday: 73,
        averageClassProgress: 68.3,
        assignmentsDue: 5,
        pendingReviews: 12,
        upcomingLessons: [
          {
            id: "1",
            title: "Fractions and Decimals",
            subject: "Mathematics",
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
            classId: "1",
            className: "Grade 5A",
          },
          {
            id: "2",
            title: "Khmer Grammar",
            subject: "Khmer",
            scheduledDate: new Date(Date.now() + 172800000).toISOString(),
            classId: "2",
            className: "Grade 5B",
          },
        ],
        recentSubmissions: [
          {
            id: "1",
            studentName: "Sophea Kim",
            type: "exercise",
            title: "Multiplication Practice",
            submittedAt: new Date().toISOString(),
            score: 95,
            status: "graded",
          },
          {
            id: "2",
            studentName: "Dara Chen",
            type: "assessment",
            title: "Science Quiz",
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            status: "pending",
          },
        ],
        performanceBySubject: [
          { subject: "Mathematics", averageScore: 82, studentsCount: 84, color: "#8884d8" },
          { subject: "Khmer", averageScore: 85, studentsCount: 84, color: "#82ca9d" },
          { subject: "English", averageScore: 78, studentsCount: 84, color: "#ffc658" },
          { subject: "Science", averageScore: 80, studentsCount: 84, color: "#ff7c7c" },
        ],
        weeklyActivity: generateWeeklyActivity(),
      };

      setClasses(mockClasses);
      setDashboardStats(mockStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = () => {
    let students: StudentData[] = [];
    
    if (selectedClass === "all") {
      students = classes.flatMap(c => c.students);
    } else {
      const classData = classes.find(c => c.id === selectedClass);
      students = classData?.students || [];
    }

    if (searchQuery) {
      students = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      students = students.filter(s => s.status === filterStatus);
    }

    return students;
  };

  const getClassStats = () => {
    if (selectedClass === "all") {
      const total = classes.reduce((acc, c) => acc + c.stats.totalStudents, 0);
      const active = classes.reduce((acc, c) => acc + c.stats.activeStudents, 0);
      const avgProgress = classes.reduce((acc, c) => acc + c.stats.averageProgress * c.stats.totalStudents, 0) / total;
      const avgScore = classes.reduce((acc, c) => acc + c.stats.averageScore * c.stats.totalStudents, 0) / total;
      
      return {
        totalStudents: total,
        activeStudents: active,
        averageProgress: Math.round(avgProgress),
        averageScore: Math.round(avgScore),
      };
    }

    const classData = classes.find(c => c.id === selectedClass);
    return classData?.stats || null;
  };

  if (loading) {
    return <TeacherDashboardSkeleton />;
  }

  const classStats = getClassStats();

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <BilingualHeading
          en={`Welcome back, ${user?.firstName || "Teacher"}!`}
          km={`សូមស្វាគមន៍ការត្រឡប់មកវិញ ${user?.firstName || "គ្រូ"}!`}
          level={1}
          className="mb-2 text-2xl sm:text-3xl"
        />
        <BilingualText
          en="Monitor your students' progress and manage your classes"
          km="តាមដានវឌ្ឍនភាពរបស់សិស្ស និងគ្រប់គ្រងថ្នាក់របស់អ្នក"
          className="text-sm sm:text-lg text-muted-foreground"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <BilingualText en="Total Students" km="សិស្សសរុប" />
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  <FormattedNumber value={dashboardStats?.totalStudents || 0} />
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <BilingualText en="Active Today" km="សកម្មថ្ងៃនេះ" />
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  <FormattedNumber value={dashboardStats?.activeToday || 0} />
                </p>
              </div>
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Avg Progress" km="វឌ្ឍនភាពមធ្យម" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={dashboardStats?.averageClassProgress || 0} type="percentage" />
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Pending Reviews" km="ការពិនិត្យរង់ចាំ" />
                </p>
                <p className="text-2xl font-bold">
                  <FormattedNumber value={dashboardStats?.pendingReviews || 0} />
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Selector */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <BilingualText en="All Classes" km="ថ្នាក់ទាំងអស់" />
            </SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} ({cls.stats.totalStudents} <BilingualText en="students" km="សិស្ស" />)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {classStats && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              <BilingualText en="Active:" km="សកម្ម៖" /> {classStats.activeStudents}/{classStats.totalStudents}
            </span>
            <span>
              <BilingualText en="Avg Score:" km="ពិន្ទុមធ្យម៖" /> <FormattedNumber value={classStats.averageScore} type="percentage" />
            </span>
          </div>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">
            <BilingualText en="Overview" km="ទិដ្ឋភាពទូទៅ" />
          </TabsTrigger>
          <TabsTrigger value="students">
            <BilingualText en="Students" km="សិស្ស" />
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BilingualText en="Assignments" km="កិច្ចការ" />
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BilingualText en="Analytics" km="ការវិភាគ" />
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Subject */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Performance by Subject" km="ការអនុវត្តតាមមុខវិជ្ជា" />
                </CardTitle>
                <CardDescription>
                  <BilingualText en="Average scores across all classes" km="ពិន្ទុមធ្យមនៅគ្រប់ថ្នាក់" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats?.performanceBySubject || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Weekly Activity" km="សកម្មភាពប្រចាំសប្តាហ៍" />
                </CardTitle>
                <CardDescription>
                  <BilingualText en="Student engagement over the past week" km="ការចូលរួមរបស់សិស្សក្នុងរយៈពេលមួយសប្តាហ៍" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardStats?.weeklyActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="activeStudents" stroke="#8884d8" name="Active Students" />
                      <Line type="monotone" dataKey="lessonsCompleted" stroke="#82ca9d" name="Lessons" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Recent Submissions" km="ការដាក់ស្នើថ្មីៗ" />
              </CardTitle>
              <CardDescription>
                <BilingualText en="Latest student work requiring review" km="ការងារសិស្សថ្មីៗដែលត្រូវការពិនិត្យ" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats?.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={submission.studentAvatar} />
                        <AvatarFallback>{submission.studentName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.title} • <FormattedDate date={submission.submittedAt} format="relative" />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === "graded" ? (
                        <Badge variant="secondary" className="bg-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          <FormattedNumber value={submission.score!} type="percentage" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100">
                          <Clock className="h-3 w-3 mr-1" />
                          <BilingualText en="Pending" km="រង់ចាំ" />
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BilingualText en="Upcoming Lessons" km="មេរៀនខាងមុខ" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats?.upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.subject} • {lesson.className} • <FormattedDate date={lesson.scheduledDate} format="long" />
                      </p>
                    </div>
                    <Link href={`/teacher/lessons/${lesson.id}/prepare`}>
                      <Button size="sm" variant="outline">
                        <BilingualText en="Prepare" km="រៀបចំ" />
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isKhmer ? "ស្វែងរកសិស្ស..." : "Search students..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"><BilingualText en="All Students" km="សិស្សទាំងអស់" /></SelectItem>
                <SelectItem value="active"><BilingualText en="Active" km="សកម្ម" /></SelectItem>
                <SelectItem value="inactive"><BilingualText en="Inactive" km="អសកម្ម" /></SelectItem>
                <SelectItem value="struggling"><BilingualText en="Struggling" km="មានបញ្ហា" /></SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              <BilingualText en="Export" km="នាំចេញ" />
            </Button>
          </div>

          {/* Students Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><BilingualText en="Student" km="សិស្ស" /></TableHead>
                  <TableHead><BilingualText en="Progress" km="វឌ្ឍនភាព" /></TableHead>
                  <TableHead><BilingualText en="Avg Score" km="ពិន្ទុមធ្យម" /></TableHead>
                  <TableHead><BilingualText en="Lessons" km="មេរៀន" /></TableHead>
                  <TableHead><BilingualText en="Last Active" km="សកម្មចុងក្រោយ" /></TableHead>
                  <TableHead><BilingualText en="Status" km="ស្ថានភាព" /></TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents().map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">
                          <FormattedNumber value={student.progress} type="percentage" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <FormattedNumber value={student.averageScore} type="percentage" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        <FormattedNumber value={student.lessonsCompleted} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <FormattedDate date={student.lastActive} format="relative" />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          student.status === "active" && "bg-green-100 text-green-700",
                          student.status === "inactive" && "bg-gray-100 text-gray-700",
                          student.status === "struggling" && "bg-red-100 text-red-700"
                        )}
                      >
                        {student.status === "active" && <BilingualText en="Active" km="សកម្ម" />}
                        {student.status === "inactive" && <BilingualText en="Inactive" km="អសកម្ម" />}
                        {student.status === "struggling" && <BilingualText en="Struggling" km="មានបញ្ហា" />}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/teacher/students/${student.id}`} className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Progress Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <BilingualHeading
              en="Assignments & Assessments"
              km="កិច្ចការ និងការវាយតម្លៃ"
              level={3}
            />
            <Button>
              <BilingualText en="Create Assignment" km="បង្កើតកិច្ចការ" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <BilingualText
                  en="Assignment management coming soon"
                  km="ការគ្រប់គ្រងកិច្ចការនឹងមកដល់ឆាប់ៗ"
                  className="text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <BilingualHeading
            en="Detailed Analytics"
            km="ការវិភាគលម្អិត"
            level={3}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Student Distribution" km="ការបែងចែកសិស្ស" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={[
                          { name: "Active", value: dashboardStats?.activeToday || 0 },
                          { name: "Inactive", value: (dashboardStats?.totalStudents || 0) - (dashboardStats?.activeToday || 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff7c7c" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <BilingualText en="Class Comparison" km="ការប្រៀបធៀបថ្នាក់" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{cls.name}</span>
                        <span><FormattedNumber value={cls.stats.averageProgress} type="percentage" /></span>
                      </div>
                      <Progress value={cls.stats.averageProgress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeacherDashboardSkeleton() {
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

function generateMockStudents(count: number): StudentData[] {
  const firstNames = ["Sophea", "Dara", "Sokha", "Pisey", "Vanna", "Srey", "Bopha", "Ratha"];
  const lastNames = ["Kim", "Chen", "Nguyen", "Sok", "Chan", "Lee", "Touch", "Heng"];
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const progress = Math.floor(Math.random() * 40) + 50;
    const score = Math.floor(Math.random() * 30) + 65;
    const isActive = Math.random() > 0.2;
    const isStruggling = score < 70 && Math.random() > 0.5;
    
    return {
      id: `student-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`,
      progress,
      averageScore: score,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lessonsCompleted: Math.floor((progress / 100) * 80),
      exercisesCompleted: Math.floor(Math.random() * 200) + 100,
      status: isStruggling ? "struggling" : isActive ? "active" : "inactive",
    };
  });
}

function generateWeeklyActivity(): WeeklyActivity[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({
    day,
    activeStudents: Math.floor(Math.random() * 30) + 50,
    lessonsCompleted: Math.floor(Math.random() * 20) + 10,
    exercisesSubmitted: Math.floor(Math.random() * 100) + 50,
  }));
}