"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileQuestion,
  Clock,
  Target,
  Award,
  BookOpen,
  TrendingUp,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  BarChart3,
  Brain,
  Mic,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

interface Assessment {
  id: string;
  title: string;
  titleKh?: string;
  type: string;
  grade: string;
  duration: number;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    questions: number;
    attempts: number;
  };
  userAttempts?: any[];
  hasAttempted?: boolean;
}

interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  assessment: {
    title: string;
    type: string;
    subject?: {
      name: string;
    };
  };
}

const assessmentTypeIcons: Record<string, any> = {
  EGRA: Mic,
  EGMA: Brain,
  PROFICIENCY_TEST: ClipboardCheck,
  GRADE_PROGRESSION: TrendingUp,
  DIAGNOSTIC: BarChart3,
  PLACEMENT: Target,
};

const assessmentTypeColors: Record<string, string> = {
  EGRA: "bg-blue-100 text-blue-700",
  EGMA: "bg-purple-100 text-purple-700",
  PROFICIENCY_TEST: "bg-green-100 text-green-700",
  GRADE_PROGRESSION: "bg-orange-100 text-orange-700",
  DIAGNOSTIC: "bg-red-100 text-red-700",
  PLACEMENT: "bg-indigo-100 text-indigo-700",
};

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attemptHistory, setAttemptHistory] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    grade: "",
    subject: "",
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completedAssessments: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.grade) params.append("grade", filters.grade);
      if (filters.subject) params.append("subjectId", filters.subject);

      const [assessmentsRes, historyRes, subjectsRes] = await Promise.all([
        api.get(`/assessments?${params}`),
        api.get("/assessments/history"),
        api.get("/subjects"),
      ]);

      setAssessments(assessmentsRes.data.assessments);
      setAttemptHistory(historyRes.data);
      setSubjects(subjectsRes.data);

      // Calculate stats
      const completed = historyRes.data.filter((a: AssessmentAttempt) => a.completedAt);
      const totalScore = completed.reduce((acc: number, a: AssessmentAttempt) => acc + (a.score || 0), 0);
      
      setStats({
        totalAttempts: historyRes.data.length,
        averageScore: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
        completedAssessments: completed.length,
        inProgress: historyRes.data.filter((a: AssessmentAttempt) => !a.completedAt).length,
      });
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (assessmentId: string) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/start`);
      router.push(`/assessments/${assessmentId}/take/${response.data.attempt.id}`);
    } catch (error) {
      console.error("Error starting assessment:", error);
    }
  };

  const getLatestAttemptScore = (assessment: Assessment) => {
    if (!assessment.userAttempts || assessment.userAttempts.length === 0) return null;
    const completed = assessment.userAttempts.filter(a => a.completedAt);
    if (completed.length === 0) return null;
    return Math.round(completed[completed.length - 1].score);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileQuestion className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Assessments</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Test your knowledge and track your learning progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedAssessments}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="egra">EGRA Tests</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
        </TabsList>

        {/* Available Assessments */}
        <TabsContent value="available" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="EGRA">EGRA</SelectItem>
                <SelectItem value="EGMA">EGMA</SelectItem>
                <SelectItem value="PROFICIENCY_TEST">Proficiency Test</SelectItem>
                <SelectItem value="GRADE_PROGRESSION">Grade Progression</SelectItem>
                <SelectItem value="DIAGNOSTIC">Diagnostic</SelectItem>
                <SelectItem value="PLACEMENT">Placement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {[1, 2, 3, 4, 5, 6].map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => {
              const Icon = assessmentTypeIcons[assessment.type] || FileQuestion;
              const latestScore = getLatestAttemptScore(assessment);
              
              return (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        assessmentTypeColors[assessment.type] || "bg-gray-100"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {latestScore !== null && (
                        <Badge variant="secondary" className="text-sm">
                          Score: {latestScore}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{assessment.title}</CardTitle>
                    {assessment.titleKh && (
                      <CardDescription className="text-base">
                        {assessment.titleKh}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{assessment.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        <span>{assessment._count.questions} questions</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{assessment.type}</Badge>
                      <Badge variant="outline">Grade {assessment.grade}</Badge>
                      {assessment.subject && (
                        <Badge variant="outline">{assessment.subject.name}</Badge>
                      )}
                    </div>

                    {assessment.hasAttempted && (
                      <p className="text-sm text-muted-foreground">
                        Attempted {assessment.userAttempts?.length || 0} time(s)
                      </p>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      {assessment.hasAttempted ? "Retake Assessment" : "Start Assessment"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* EGRA Tests */}
        <TabsContent value="egra" className="space-y-6">
          <div className="text-center mb-6">
            <Mic className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Early Grade Reading Assessment (EGRA)
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              EGRA tests measure foundational reading skills including letter recognition, 
              phonics, fluency, and comprehension. These assessments help track reading 
              development in early grades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments
              .filter(a => a.type === "EGRA")
              .map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Mic className="h-6 w-6 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {assessment.title}
                        </h3>
                        {assessment.titleKh && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {assessment.titleKh}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <Badge variant="outline">Grade {assessment.grade}</Badge>
                          <span>{assessment.duration} minutes</span>
                          <span>{assessment._count.questions} tasks</span>
                        </div>
                        <Button onClick={() => handleStartAssessment(assessment.id)}>
                          Begin EGRA Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-6">
          {attemptHistory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No assessment attempts yet. Start your first assessment!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attemptHistory.map((attempt) => (
                <Card key={attempt.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          assessmentTypeColors[attempt.assessment.type] || "bg-gray-100"
                        )}>
                          {assessmentTypeIcons[attempt.assessment.type] ? (
                            <Icon className="h-5 w-5" />
                          ) : (
                            <FileQuestion className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {attempt.assessment.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>
                              Started {formatDistanceToNow(new Date(attempt.startedAt), { addSuffix: true })}
                            </span>
                            {attempt.assessment.subject && (
                              <Badge variant="outline">
                                {attempt.assessment.subject.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {attempt.completedAt ? (
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {Math.round(attempt.score || 0)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Score</p>
                          </div>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}