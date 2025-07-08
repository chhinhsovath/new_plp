"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  overview: {
    totalStudents: number;
    averageGrade: number;
    assignmentCompletionRate: number;
    classAttendanceRate: number;
  };
  performanceTrends: {
    month: string;
    average: number;
  }[];
  subjectPerformance: {
    subject: string;
    average: number;
    students: number;
  }[];
  topPerformers: {
    id: string;
    name: string;
    average: number;
    trend: "up" | "down" | "stable";
  }[];
  strugglingStudents: {
    id: string;
    name: string;
    average: number;
    missedAssignments: number;
  }[];
  assignmentStats: {
    id: string;
    title: string;
    averageScore: number;
    submissionRate: number;
    onTimeRate: number;
  }[];
}

export default function TeacherAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/teacher/analytics?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // In real implementation, generate PDF/Excel report
    console.log("Exporting analytics report...");
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  if (loading || !analyticsData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teaching Analytics</h1>
            <p className="text-gray-600">
              Comprehensive insights into student performance and class metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getGradeColor(analyticsData.overview.averageGrade))}>
              {analyticsData.overview.averageGrade}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{getGradeLetter(analyticsData.overview.averageGrade)}</Badge>
              <TrendingUp className="w-3 h-3 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.assignmentCompletionRate}%</div>
            <Progress value={analyticsData.overview.assignmentCompletionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.classAttendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Live class participation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {analyticsData.performanceTrends.map((trend, index) => {
              const height = (trend.average / 100) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      trend.average >= 80 ? "bg-green-500" : 
                      trend.average >= 60 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-xs mt-2">{trend.month}</p>
                  <p className="text-xs font-medium">{trend.average}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPerformers.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                      index === 0 && "bg-yellow-500",
                      index === 1 && "bg-gray-400",
                      index === 2 && "bg-orange-600",
                      index > 2 && "bg-gray-300"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">Average: {student.average}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "text-xs",
                      student.average >= 90 && "bg-green-100 text-green-800"
                    )}>
                      {getGradeLetter(student.average)}
                    </Badge>
                    {student.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : student.trend === "down" ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <Target className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Struggling Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Students Needing Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.strugglingStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">Average: {student.average}%</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-xs">
                      {student.missedAssignments} missed
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">assignments</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.subjectPerformance.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{subject.subject}</p>
                    <p className="text-sm text-gray-600">{subject.students} students</p>
                  </div>
                  <span className={cn("font-bold", getGradeColor(subject.average))}>
                    {subject.average}%
                  </span>
                </div>
                <Progress value={subject.average} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead className="text-center">Submission Rate</TableHead>
                <TableHead className="text-center">On-Time Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.assignmentStats.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-bold", getGradeColor(assignment.averageScore))}>
                      {assignment.averageScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={assignment.submissionRate} className="w-20 h-2" />
                      <span className="text-sm">{assignment.submissionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      assignment.onTimeRate >= 90 && "bg-green-100 text-green-800",
                      assignment.onTimeRate >= 70 && assignment.onTimeRate < 90 && "bg-yellow-100 text-yellow-800",
                      assignment.onTimeRate < 70 && "bg-red-100 text-red-800"
                    )}>
                      {assignment.onTimeRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}