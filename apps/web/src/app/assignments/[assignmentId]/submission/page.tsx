"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  FileText,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  submittedAt: string;
  score: number | null;
  graded: boolean;
  feedback: string | null;
  assignment: {
    id: string;
    title: string;
    totalPoints: number;
    class: {
      name: string;
      subject: {
        name: string;
      };
    };
    exercises: {
      id: string;
      type: string;
      question: string;
      points: number;
      orderIndex: number;
      data: any;
    }[];
  };
  answers: {
    id: string;
    exerciseId: string;
    answer: any;
    points: number | null;
    isCorrect: boolean | null;
    feedback: string | null;
  }[];
}

export default function StudentSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [assignmentId]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/student/assignments/${assignmentId}/submission`);
      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
      } else if (response.status === 404) {
        // No submission found, redirect to assignment page
        router.push(`/assignments/${assignmentId}`);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Submission not found</p>
      </div>
    );
  }

  const { assignment } = submission;
  const earnedPoints = submission.answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
  const scorePercentage = submission.score || 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/assignments")}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <p className="text-gray-600">
              {assignment.class.name} - {assignment.class.subject.name}
            </p>
          </div>
          <div className="text-right">
            {submission.graded ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Graded
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Submitted: {format(new Date(submission.submittedAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {/* Score Card */}
      {submission.graded && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {scorePercentage}%
                </div>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">
                  {earnedPoints} / {assignment.totalPoints}
                </div>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-semibold mb-2",
                  scorePercentage >= 90 ? "text-green-600" :
                  scorePercentage >= 80 ? "text-blue-600" :
                  scorePercentage >= 70 ? "text-yellow-600" :
                  "text-red-600"
                )}>
                  {scorePercentage >= 90 ? "Excellent" :
                   scorePercentage >= 80 ? "Good" :
                   scorePercentage >= 70 ? "Satisfactory" :
                   "Needs Improvement"}
                </div>
                <p className="text-sm text-gray-600">Performance</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Progress value={scorePercentage} className="h-3" />
            </div>

            {submission.feedback && (
              <Alert className="mt-6">
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <strong>Teacher Feedback:</strong> {submission.feedback}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {assignment.exercises
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((exercise, index) => {
                const answer = submission.answers.find(a => a.exerciseId === exercise.id);
                
                return (
                  <div key={exercise.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          Question {index + 1}
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {exercise.question}
                        </p>
                      </div>
                      {submission.graded && answer && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm font-medium">
                            {answer.points || 0} / {exercise.points}
                          </span>
                          {answer.isCorrect !== null && (
                            answer.isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Your Answer */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Your Answer:
                        </p>
                        {renderAnswer(exercise.type, answer?.answer)}
                      </div>

                      {/* Correct Answer (if graded and incorrect) */}
                      {submission.graded && answer?.isCorrect === false && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Correct Answer:
                          </p>
                          {renderCorrectAnswer(exercise)}
                        </div>
                      )}

                      {/* Feedback */}
                      {answer?.feedback && (
                        <Alert>
                          <MessageSquare className="h-4 w-4" />
                          <AlertDescription>
                            {answer.feedback}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/assignments")}>
          Back to Assignments
        </Button>
        {submission.graded && (
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>
    </div>
  );
}

function renderAnswer(type: string, answer: any) {
  if (answer === null || answer === undefined) {
    return <p className="text-gray-500 italic">No answer provided</p>;
  }

  switch (type) {
    case "MULTIPLE_CHOICE":
      return <p className="text-gray-700">Option {answer + 1}</p>;

    case "TRUE_FALSE":
      return <p className="text-gray-700">{answer ? "True" : "False"}</p>;

    case "SHORT_ANSWER":
    case "LONG_ANSWER":
    case "FILL_IN_GAPS":
      return <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>;

    default:
      return <p className="text-gray-700">{JSON.stringify(answer)}</p>;
  }
}

function renderCorrectAnswer(exercise: any) {
  const { type, data } = exercise;

  switch (type) {
    case "MULTIPLE_CHOICE":
      return (
        <p className="text-gray-700">
          Option {data.correctAnswer + 1}: {data.options[data.correctAnswer]}
        </p>
      );

    case "TRUE_FALSE":
      return <p className="text-gray-700">{data.correctAnswer ? "True" : "False"}</p>;

    case "SHORT_ANSWER":
      return <p className="text-gray-700">{data.correctAnswer}</p>;

    default:
      return null;
  }
}