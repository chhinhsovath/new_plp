"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Clock,
  Users,
  FileText,
  Download,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  BarChart3,
  Link2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  instructions: string;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
  };
  dueDate: string;
  totalPoints: number;
  createdAt: string;
  exercises: {
    id: string;
    type: string;
    question: string;
    points: number;
    orderIndex: number;
    data: any;
  }[];
  resources: {
    id: string;
    type: string;
    name: string;
    url: string;
  }[];
  _count: {
    submissions: number;
  };
}

interface Submission {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  submittedAt: string;
  score: number | null;
  graded: boolean;
  answers: {
    exerciseId: string;
    answer: any;
  }[];
}

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    }
  }, [activeTab, assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data.assignment);
        setEnrollmentCount(data.enrollmentCount);
      }
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/teacher/assignments";
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading assignment details...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Assignment not found</p>
      </div>
    );
  }

  const submissionRate = enrollmentCount > 0
    ? Math.round((assignment._count.submissions / enrollmentCount) * 100)
    : 0;
  
  const gradedCount = submissions.filter(s => s.graded).length;
  const averageScore = submissions.filter(s => s.graded && s.score !== null)
    .reduce((sum, s) => sum + (s.score || 0), 0) / (gradedCount || 1);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "HOMEWORK": return "Homework";
      case "QUIZ": return "Quiz";
      case "EXAM": return "Exam";
      case "PROJECT": return "Project";
      case "PRACTICE": return "Practice";
      default: return type;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{assignment.class.name} - {assignment.class.subject.name}</span>
              <span>•</span>
              <Badge variant="outline">{getTypeLabel(assignment.type)}</Badge>
              <span>•</span>
              <span>{assignment.totalPoints} points</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/teacher/assignments/${assignmentId}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={handleDeleteAssignment}>
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button asChild>
              <Link href={`/teacher/assignments/${assignmentId}/grade`}>
                <Award className="w-4 h-4 mr-2" />
                Grade Submissions
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises">
            Exercises ({assignment.exercises.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({assignment._count.submissions})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(assignment.dueDate), "MMM d")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(assignment.dueDate), "yyyy 'at' h:mm a")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assignment._count.submissions} / {enrollmentCount}
                </div>
                <Progress value={submissionRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Graded</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gradedCount} / {assignment._count.submissions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {assignment._count.submissions - gradedCount} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gradedCount > 0 ? `${averageScore.toFixed(1)}%` : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {gradedCount > 0 ? `Based on ${gradedCount} graded` : "No grades yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">
                {assignment.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">
                {assignment.instructions || "No instructions provided."}
              </p>
            </CardContent>
          </Card>

          {assignment.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignment.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {resource.type === "file" ? (
                          <FileText className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Link2 className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          {resource.type === "link" && (
                            <p className="text-xs text-gray-500">{resource.url}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          {resource.type === "file" ? "Download" : "Open"}
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assignment.exercises
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((exercise, index) => (
                    <div key={exercise.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">
                          Question {index + 1} ({exercise.points} points)
                        </h4>
                        <Badge variant="outline">
                          {exercise.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">
                        {exercise.question}
                      </p>
                      {renderExercisePreview(exercise)}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Submissions</CardTitle>
                <Button asChild>
                  <Link href={`/teacher/assignments/${assignmentId}/grade`}>
                    <Award className="w-4 h-4 mr-2" />
                    Grade All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.student.firstName} {submission.student.lastName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.submittedAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        {submission.graded ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Graded
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.graded && submission.score !== null
                          ? `${submission.score}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/teacher/assignments/${assignmentId}/submissions/${submission.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Score distribution chart coming soon
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Exercise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Exercise analytics coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderExercisePreview(exercise: any) {
  const { type, data } = exercise;

  switch (type) {
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-2 ml-4">
          {data.options.map((option: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2",
                  index === data.correctAnswer
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300"
                )}
              />
              <span className={index === data.correctAnswer ? "font-medium" : ""}>
                {option}
              </span>
            </div>
          ))}
        </div>
      );

    case "TRUE_FALSE":
      return (
        <div className="ml-4">
          <p className="text-sm text-gray-600">
            Correct answer: <span className="font-medium">{data.correctAnswer ? "True" : "False"}</span>
          </p>
        </div>
      );

    case "SHORT_ANSWER":
      return (
        <div className="ml-4">
          <p className="text-sm text-gray-600">
            Expected answer: <span className="font-medium">{data.correctAnswer}</span>
          </p>
        </div>
      );

    case "LONG_ANSWER":
      return (
        <div className="ml-4 space-y-2">
          {data.rubric && (
            <div>
              <p className="text-sm font-medium text-gray-600">Grading Rubric:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.rubric}</p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}