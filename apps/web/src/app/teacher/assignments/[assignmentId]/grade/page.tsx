"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  totalPoints: number;
  exercises: {
    id: string;
    type: string;
    question: string;
    points: number;
    orderIndex: number;
    data: any;
  }[];
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
  feedback: string | null;
  answers: {
    exerciseId: string;
    answer: any;
    isCorrect: boolean | null;
    points: number | null;
    feedback: string | null;
  }[];
}

export default function GradeAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        fetch(`/api/teacher/assignments/${assignmentId}`),
        fetch(`/api/teacher/assignments/${assignmentId}/submissions`),
      ]);

      if (assignmentRes.ok && submissionsRes.ok) {
        const assignmentData = await assignmentRes.json();
        const submissionsData = await submissionsRes.json();
        
        setAssignment(assignmentData.assignment);
        setSubmissions(submissionsData.submissions);
        
        // Initialize grades state
        const initialGrades: { [key: string]: any } = {};
        submissionsData.submissions.forEach((submission: Submission) => {
          initialGrades[submission.id] = {
            feedback: submission.feedback || "",
            answers: {},
          };
          submission.answers.forEach((answer) => {
            initialGrades[submission.id].answers[answer.exerciseId] = {
              points: answer.points !== null ? answer.points : 0,
              isCorrect: answer.isCorrect,
              feedback: answer.feedback || "",
            };
          });
        });
        setGrades(initialGrades);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentSubmission = submissions[currentIndex];

  const updateGrade = (exerciseId: string, field: string, value: any) => {
    setGrades((prev) => ({
      ...prev,
      [currentSubmission.id]: {
        ...prev[currentSubmission.id],
        answers: {
          ...prev[currentSubmission.id].answers,
          [exerciseId]: {
            ...prev[currentSubmission.id].answers[exerciseId],
            [field]: value,
          },
        },
      },
    }));
  };

  const updateOverallFeedback = (feedback: string) => {
    setGrades((prev) => ({
      ...prev,
      [currentSubmission.id]: {
        ...prev[currentSubmission.id],
        feedback,
      },
    }));
  };

  const calculateTotalScore = () => {
    if (!currentSubmission || !assignment) return 0;
    
    const grade = grades[currentSubmission.id];
    if (!grade) return 0;
    
    let totalPoints = 0;
    assignment.exercises.forEach((exercise) => {
      const answer = grade.answers[exercise.id];
      if (answer && answer.points !== undefined) {
        totalPoints += answer.points;
      }
    });
    
    return Math.round((totalPoints / assignment.totalPoints) * 100);
  };

  const saveGrade = async () => {
    if (!currentSubmission || !assignment) return;
    
    setSaving(true);
    
    try {
      const grade = grades[currentSubmission.id];
      const totalScore = calculateTotalScore();
      
      const response = await fetch(`/api/teacher/submissions/${currentSubmission.id}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: totalScore,
          feedback: grade.feedback,
          answers: Object.entries(grade.answers).map(([exerciseId, data]: [string, any]) => ({
            exerciseId,
            points: data.points,
            isCorrect: data.isCorrect,
            feedback: data.feedback,
          })),
        }),
      });

      if (response.ok) {
        // Update local state to reflect graded status
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === currentSubmission.id
              ? { ...sub, graded: true, score: totalScore }
              : sub
          )
        );
        
        // Move to next submission if available
        if (currentIndex < submissions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        alert("Failed to save grade");
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      alert("Failed to save grade");
    } finally {
      setSaving(false);
    }
  };

  const autogradeSubmission = () => {
    if (!currentSubmission || !assignment) return;
    
    const grade = grades[currentSubmission.id];
    
    assignment.exercises.forEach((exercise) => {
      const submission = currentSubmission.answers.find(a => a.exerciseId === exercise.id);
      if (!submission) return;
      
      let points = 0;
      let isCorrect = false;
      
      switch (exercise.type) {
        case "MULTIPLE_CHOICE":
          isCorrect = submission.answer === exercise.data.correctAnswer;
          points = isCorrect ? exercise.points : 0;
          break;
          
        case "TRUE_FALSE":
          isCorrect = submission.answer === exercise.data.correctAnswer;
          points = isCorrect ? exercise.points : 0;
          break;
          
        case "SHORT_ANSWER":
          isCorrect = submission.answer?.toLowerCase().trim() === 
                     exercise.data.correctAnswer?.toLowerCase().trim();
          points = isCorrect ? exercise.points : 0;
          break;
          
        default:
          // Manual grading required
          points = 0;
      }
      
      updateGrade(exercise.id, "points", points);
      updateGrade(exercise.id, "isCorrect", isCorrect);
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading submissions...</p>
      </div>
    );
  }

  if (!assignment || submissions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-gray-500 mb-4">No submissions to grade</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ungradedCount = submissions.filter(s => !s.graded).length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Grade Assignment</h1>
            <p className="text-gray-600">{assignment.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{currentIndex + 1}</span> of {submissions.length}
              {ungradedCount > 0 && (
                <span className="ml-2">({ungradedCount} ungraded)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                disabled={currentIndex === submissions.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <Progress 
          value={((currentIndex + 1) / submissions.length) * 100} 
          className="h-2"
        />
      </div>

      {currentSubmission && (
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {currentSubmission.student.firstName} {currentSubmission.student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{currentSubmission.student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="text-sm font-medium">
                      {format(new Date(currentSubmission.submittedAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  {currentSubmission.graded && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Graded
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Questions and Answers */}
          <div className="space-y-6">
            {assignment.exercises
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((exercise, index) => {
                const submission = currentSubmission.answers.find(
                  (a) => a.exerciseId === exercise.id
                );
                const grade = grades[currentSubmission.id]?.answers[exercise.id] || {
                  points: 0,
                  isCorrect: null,
                  feedback: "",
                };

                return (
                  <Card key={exercise.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">
                            Question {index + 1}
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {exercise.question}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Input
                            type="number"
                            min="0"
                            max={exercise.points}
                            value={grade.points}
                            onChange={(e) =>
                              updateGrade(exercise.id, "points", parseInt(e.target.value) || 0)
                            }
                            className="w-16"
                          />
                          <span className="text-sm text-gray-600">/ {exercise.points}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Display correct answer for reference */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Expected Answer:
                        </p>
                        {renderExpectedAnswer(exercise)}
                      </div>

                      {/* Student's answer */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Student's Answer:
                        </p>
                        {renderStudentAnswer(exercise.type, submission?.answer)}
                      </div>

                      {/* Feedback */}
                      <div>
                        <Label>Feedback (optional)</Label>
                        <Textarea
                          placeholder="Provide feedback for this answer..."
                          value={grade.feedback}
                          onChange={(e) =>
                            updateGrade(exercise.id, "feedback", e.target.value)
                          }
                          rows={2}
                        />
                      </div>

                      {/* Quick grade buttons for objective questions */}
                      {(exercise.type === "MULTIPLE_CHOICE" || 
                        exercise.type === "TRUE_FALSE" || 
                        exercise.type === "SHORT_ANSWER") && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={grade.isCorrect === true ? "default" : "outline"}
                            onClick={() => {
                              updateGrade(exercise.id, "isCorrect", true);
                              updateGrade(exercise.id, "points", exercise.points);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Correct
                          </Button>
                          <Button
                            size="sm"
                            variant={grade.isCorrect === false ? "default" : "outline"}
                            onClick={() => {
                              updateGrade(exercise.id, "isCorrect", false);
                              updateGrade(exercise.id, "points", 0);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Incorrect
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* Overall Feedback and Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback & Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Overall Feedback</Label>
                <Textarea
                  placeholder="Provide overall feedback for the student..."
                  value={grades[currentSubmission.id]?.feedback || ""}
                  onChange={(e) => updateOverallFeedback(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Score</p>
                  <p className="text-2xl font-bold">{calculateTotalScore()}%</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={autogradeSubmission}
                    disabled={saving}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Auto-grade
                  </Button>
                  <Button onClick={saveGrade} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : currentSubmission.graded ? "Update Grade" : "Save Grade"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function renderExpectedAnswer(exercise: any) {
  const { type, data } = exercise;

  switch (type) {
    case "MULTIPLE_CHOICE":
      return (
        <p className="text-gray-700">
          {data.options[data.correctAnswer]} (Option {data.correctAnswer + 1})
        </p>
      );

    case "TRUE_FALSE":
      return <p className="text-gray-700">{data.correctAnswer ? "True" : "False"}</p>;

    case "SHORT_ANSWER":
      return <p className="text-gray-700">{data.correctAnswer}</p>;

    case "LONG_ANSWER":
      return (
        <div className="space-y-2">
          {data.sampleAnswer && (
            <div>
              <p className="text-xs font-medium text-gray-600">Sample Answer:</p>
              <p className="text-gray-700 text-sm">{data.sampleAnswer}</p>
            </div>
          )}
          {data.rubric && (
            <div>
              <p className="text-xs font-medium text-gray-600">Rubric:</p>
              <p className="text-gray-700 text-sm">{data.rubric}</p>
            </div>
          )}
        </div>
      );

    default:
      return <p className="text-gray-500 italic">Manual grading required</p>;
  }
}

function renderStudentAnswer(type: string, answer: any) {
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
      return <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>;

    default:
      return <p className="text-gray-700">{JSON.stringify(answer)}</p>;
  }
}