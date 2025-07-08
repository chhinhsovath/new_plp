"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  Clock,
  FileText,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  BookOpen,
  Link2,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  type: string;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
  };
  dueDate: string;
  totalPoints: number;
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
  submission?: {
    id: string;
    submittedAt: string;
    score: number | null;
    graded: boolean;
  };
}

interface Answer {
  exerciseId: string;
  answer: any;
}

export default function StudentAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [savedDraft, setSavedDraft] = useState(false);

  useEffect(() => {
    fetchAssignment();
    loadDraft();
  }, [assignmentId]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [answers]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/student/assignments/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data.assignment);
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = () => {
    const draft = localStorage.getItem(`assignment-draft-${assignmentId}`);
    if (draft) {
      setAnswers(JSON.parse(draft));
    }
  };

  const saveDraft = () => {
    localStorage.setItem(`assignment-draft-${assignmentId}`, JSON.stringify(answers));
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  const updateAnswer = (exerciseId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [exerciseId]: answer,
    }));
  };

  const isExerciseAnswered = (exerciseId: string) => {
    const answer = answers[exerciseId];
    return answer !== undefined && answer !== null && answer !== "";
  };

  const getAnsweredCount = () => {
    if (!assignment) return 0;
    return assignment.exercises.filter((ex) => isExerciseAnswered(ex.id)).length;
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    const unansweredCount = assignment.exercises.length - getAnsweredCount();
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const submissionAnswers: Answer[] = assignment.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        answer: answers[exercise.id] ?? null,
      }));

      const response = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: submissionAnswers,
        }),
      });

      if (response.ok) {
        // Clear draft
        localStorage.removeItem(`assignment-draft-${assignmentId}`);
        // Redirect to submission view
        router.push(`/assignments/${assignmentId}/submission`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading assignment...</p>
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

  if (assignment.submission) {
    router.push(`/assignments/${assignmentId}/submission`);
    return null;
  }

  const currentExercise = assignment.exercises[currentExerciseIndex];
  const progress = ((getAnsweredCount() / assignment.exercises.length) * 100);
  const isOverdue = isPast(new Date(assignment.dueDate));

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
            <Badge variant={isOverdue ? "destructive" : "outline"} className="mb-2">
              {assignment.type}
            </Badge>
            <p className="text-sm text-gray-600">
              Due: {format(new Date(assignment.dueDate), "MMM d, yyyy h:mm a")}
            </p>
            {isOverdue && (
              <p className="text-sm text-red-600 font-medium">Overdue</p>
            )}
          </div>
        </div>
      </div>

      {isOverdue && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This assignment is past due. Late submissions may receive reduced credit.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">
              {getAnsweredCount()} of {assignment.exercises.length} answered
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Total Points: {assignment.totalPoints}</span>
            </div>
            {savedDraft && (
              <span className="text-sm text-green-600">Draft saved</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions and Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">
                {assignment.instructions || assignment.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {assignment.resources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignment.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {resource.type === "file" ? (
                      <FileText className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Link2 className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm flex-1">{resource.name}</span>
                    <Download className="w-3 h-3 text-gray-400" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Question {currentExerciseIndex + 1} of {assignment.exercises.length}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {currentExercise.points} points
              </p>
            </div>
            <Badge variant="outline">
              {currentExercise.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg whitespace-pre-wrap">{currentExercise.question}</p>
            
            {renderExerciseInput(
              currentExercise,
              answers[currentExercise.id],
              (answer) => updateAnswer(currentExercise.id, answer)
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                disabled={currentExerciseIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {assignment.exercises.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentExerciseIndex(index)}
                    className={cn(
                      "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      index === currentExerciseIndex
                        ? "bg-primary text-white"
                        : isExerciseAnswered(assignment.exercises[index].id)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {currentExerciseIndex < assignment.exercises.length - 1 ? (
                <Button
                  onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderExerciseInput(
  exercise: any,
  currentAnswer: any,
  updateAnswer: (answer: any) => void
) {
  const { type, data } = exercise;

  switch (type) {
    case "MULTIPLE_CHOICE":
      return (
        <RadioGroup
          value={currentAnswer?.toString() || ""}
          onValueChange={(value) => updateAnswer(parseInt(value))}
        >
          {data.options.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-lg">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "TRUE_FALSE":
      return (
        <RadioGroup
          value={currentAnswer?.toString() || ""}
          onValueChange={(value) => updateAnswer(value === "true")}
        >
          <div className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-lg">
            <RadioGroupItem value="true" id="true" />
            <Label htmlFor="true" className="cursor-pointer flex-1">
              True
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-lg">
            <RadioGroupItem value="false" id="false" />
            <Label htmlFor="false" className="cursor-pointer flex-1">
              False
            </Label>
          </div>
        </RadioGroup>
      );

    case "SHORT_ANSWER":
      return (
        <Input
          type="text"
          placeholder="Enter your answer..."
          value={currentAnswer || ""}
          onChange={(e) => updateAnswer(e.target.value)}
          className="w-full"
        />
      );

    case "LONG_ANSWER":
      return (
        <Textarea
          placeholder="Enter your answer..."
          value={currentAnswer || ""}
          onChange={(e) => updateAnswer(e.target.value)}
          rows={8}
          className="w-full"
        />
      );

    case "FILL_IN_GAPS":
      // For simplicity, using a text input for gaps
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Fill in the blanks in the text below:
          </p>
          <Textarea
            placeholder="Enter your completed text..."
            value={currentAnswer || ""}
            onChange={(e) => updateAnswer(e.target.value)}
            rows={6}
          />
        </div>
      );

    default:
      return (
        <Alert>
          <AlertDescription>
            This exercise type is not yet supported for online submission.
          </AlertDescription>
        </Alert>
      );
  }
}