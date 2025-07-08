"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClassGrades {
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
    teacher: {
      firstName: string;
      lastName: string;
    };
  };
  assignments: {
    id: string;
    title: string;
    type: string;
    totalPoints: number;
    dueDate: string;
    submission?: {
      submittedAt: string;
      score: number | null;
      graded: boolean;
      feedback: string | null;
    };
  }[];
  average: number;
  grade: string;
}

interface SubjectStats {
  subjectName: string;
  average: number;
  totalAssignments: number;
  completedAssignments: number;
  trend: "up" | "down" | "stable";
}

export default function StudentGradesPage() {
  const [classGrades, setClassGrades] = useState<ClassGrades[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch("/api/student/grades");
      if (response.ok) {
        const data = await response.json();
        setClassGrades(data.grades);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
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

  const calculateOverallAverage = () => {
    if (classGrades.length === 0) return 0;
    const sum = classGrades.reduce((acc, cg) => acc + cg.average, 0);
    return Math.round(sum / classGrades.length);
  };

  const getSubjectStats = (): SubjectStats[] => {
    const subjectMap = new Map<string, ClassGrades[]>();
    
    classGrades.forEach(cg => {
      const subject = cg.class.subject.name;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }
      subjectMap.get(subject)?.push(cg);
    });

    return Array.from(subjectMap.entries()).map(([subject, grades]) => {
      const totalAssignments = grades.reduce((sum, g) => sum + g.assignments.length, 0);
      const completedAssignments = grades.reduce(
        (sum, g) => sum + g.assignments.filter(a => a.submission?.graded).length, 
        0
      );
      const average = grades.reduce((sum, g) => sum + g.average, 0) / grades.length;

      return {
        subjectName: subject,
        average: Math.round(average),
        totalAssignments,
        completedAssignments,
        trend: average >= 80 ? "up" : average >= 60 ? "stable" : "down",
      };
    });
  };

  const filteredClasses = selectedClassId === "all" 
    ? classGrades 
    : classGrades.filter(cg => cg.class.id === selectedClassId);

  const overallAverage = calculateOverallAverage();
  const subjectStats = getSubjectStats();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading grades...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Grades</h1>
        <p className="text-gray-600">
          Track your academic progress and performance
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getGradeColor(overallAverage))}>
              {overallAverage}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn(
                overallAverage >= 90 && "bg-green-100 text-green-800",
                overallAverage >= 80 && overallAverage < 90 && "bg-blue-100 text-blue-800",
                overallAverage >= 70 && overallAverage < 80 && "bg-yellow-100 text-yellow-800",
                overallAverage >= 60 && overallAverage < 70 && "bg-orange-100 text-orange-800",
                overallAverage < 60 && "bg-red-100 text-red-800"
              )}>
                Grade {getGradeLetter(overallAverage)}
              </Badge>
              {overallAverage >= 80 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classGrades.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classGrades.reduce((sum, cg) => 
                sum + cg.assignments.filter(a => a.submission?.graded).length, 0
              )} / {classGrades.reduce((sum, cg) => sum + cg.assignments.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {subjectStats.length > 0 ? (
              <>
                <div className="text-lg font-bold">
                  {subjectStats.sort((a, b) => b.average - a.average)[0].subjectName}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {subjectStats[0].average}% average
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-class">By Class</TabsTrigger>
            <TabsTrigger value="by-subject">By Subject</TabsTrigger>
          </TabsList>
          
          {activeTab === "by-class" && (
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classGrades.map((cg) => (
                  <SelectItem key={cg.class.id} value={cg.class.id}>
                    {cg.class.name} - {cg.class.subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classGrades.map((classGrade) => (
              <Card key={classGrade.class.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{classGrade.class.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {classGrade.class.subject.name} • {classGrade.class.teacher.firstName} {classGrade.class.teacher.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-2xl font-bold", getGradeColor(classGrade.average))}>
                        {classGrade.average}%
                      </p>
                      <Badge>{classGrade.grade}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={classGrade.average} className="mb-4" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {classGrade.assignments.filter(a => a.submission?.graded).length}
                      </p>
                      <p className="text-xs text-gray-600">Graded</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {classGrade.assignments.filter(a => a.submission && !a.submission.graded).length}
                      </p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {classGrade.assignments.filter(a => !a.submission).length}
                      </p>
                      <p className="text-xs text-gray-600">Missing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-class">
          {filteredClasses.map((classGrade) => (
            <Card key={classGrade.class.id} className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{classGrade.class.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {classGrade.class.subject.name} • {classGrade.class.teacher.firstName} {classGrade.class.teacher.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-3xl font-bold", getGradeColor(classGrade.average))}>
                      {classGrade.average}%
                    </p>
                    <Badge className="text-lg px-3 py-1">{classGrade.grade}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classGrade.assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{assignment.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {assignment.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          {assignment.submission ? (
                            assignment.submission.graded ? (
                              <div>
                                <p className={cn(
                                  "text-2xl font-bold",
                                  getGradeColor((assignment.submission.score || 0))
                                )}>
                                  {assignment.submission.score}%
                                </p>
                                <p className="text-sm text-gray-600">
                                  {assignment.totalPoints} pts
                                </p>
                              </div>
                            ) : (
                              <div>
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                                <p className="text-xs text-gray-600 mt-1">
                                  Submitted {format(new Date(assignment.submission.submittedAt), "MMM d")}
                                </p>
                              </div>
                            )
                          ) : (
                            <Badge variant="destructive">Missing</Badge>
                          )}
                        </div>
                      </div>
                      {assignment.submission?.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Feedback:</strong> {assignment.submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="by-subject">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjectStats.map((stat) => (
              <Card key={stat.subjectName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{stat.subjectName}</CardTitle>
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : stat.trend === "down" ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <Target className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className={cn("text-4xl font-bold", getGradeColor(stat.average))}>
                      {stat.average}%
                    </p>
                    <Badge className="mt-2 text-lg px-4 py-1">
                      Grade {getGradeLetter(stat.average)}
                    </Badge>
                  </div>
                  
                  <Progress value={stat.average} className="mb-4" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assignments:</span>
                    <span className="font-medium">
                      {stat.completedAssignments} / {stat.totalAssignments}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}