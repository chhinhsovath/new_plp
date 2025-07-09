"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Send,
  Mic,
  MicOff,
  Play,
  Pause,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AssessmentTakePageProps {
  params: {
    assessmentId: string;
    attemptId: string;
  };
}

interface Question {
  id: string;
  question: any;
  order: number;
  points: number;
}

interface AssessmentData {
  attempt: {
    id: string;
    startedAt: string;
  };
  questions: Question[];
}

export default function AssessmentTakePage({ params }: AssessmentTakePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Load assessment data from the start endpoint response
    const loadAssessment = async () => {
      try {
        // In a real app, this data would be passed from the previous page or fetched again
        const response = await api.get(`/assessments/${params.assessmentId}`);
        // For now, we'll use mock data
        setAssessmentData({
          attempt: {
            id: params.attemptId,
            startedAt: new Date().toISOString(),
          },
          questions: response.data.questions || generateMockQuestions(response.data.type),
        });
      } catch (error) {
        console.error("Error loading assessment:", error);
        notFound();
      }
    };

    loadAssessment();
  }, [params]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track time spent on each question
  useEffect(() => {
    setQuestionStartTime(Date.now());
    
    return () => {
      if (assessmentData && currentQuestion) {
        const timeOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
        setTimeSpent((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeOnQuestion,
        }));
      }
    };
  }, [currentQuestionIndex]);

  const generateMockQuestions = (type: string): Question[] => {
    // Generate mock questions based on assessment type
    if (type === "EGRA") {
      return [
        {
          id: "1",
          order: 1,
          points: 10,
          question: {
            type: "letter_recognition",
            text: "Point to each letter and say its name",
            letters: ["ក", "ខ", "គ", "ឃ", "ង", "ច", "ឆ", "ជ", "ឈ", "ញ"],
          },
        },
        {
          id: "2",
          order: 2,
          points: 20,
          question: {
            type: "word_reading",
            text: "Read these words aloud",
            words: ["មាន", "ទៅ", "មក", "ធ្វើ", "និង", "ជា", "នៅ", "ពី", "ដែល", "គឺ"],
          },
        },
        {
          id: "3",
          order: 3,
          points: 30,
          question: {
            type: "passage_reading",
            text: "Read this passage aloud",
            passage: "នៅថ្ងៃអាទិត្យ ខ្ញុំទៅលេងផ្ទះលោកតា។ លោកតាមានសួនច្បារមួយនៅខាងក្រោយផ្ទះ។",
          },
        },
      ];
    }

    // Default questions for other types
    return [
      {
        id: "1",
        order: 1,
        points: 10,
        question: {
          type: "multiple_choice",
          text: "What is 5 + 3?",
          options: ["6", "7", "8", "9"],
          correctAnswer: 2,
        },
      },
      {
        id: "2",
        order: 2,
        points: 10,
        question: {
          type: "short_answer",
          text: "Explain the water cycle in your own words.",
        },
      },
    ];
  };

  const currentQuestion = assessmentData?.questions[currentQuestionIndex];
  const totalQuestions = assessmentData?.questions.length || 0;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (answer: any) => {
    setAnswers({
      ...answers,
      [currentQuestion!.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return;

    try {
      await api.post(
        `/assessments/attempts/${params.attemptId}/questions/${currentQuestion.id}/answer`,
        {
          answer: answers[currentQuestion.id],
          timeSpent: timeSpent[currentQuestion.id] || 0,
        }
      );

      if (currentQuestionIndex < totalQuestions - 1) {
        handleNext();
      } else {
        // Last question - complete assessment
        await handleCompleteAssessment();
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAssessment = async () => {
    setSubmitting(true);
    try {
      const response = await api.post(`/assessments/attempts/${params.attemptId}/complete`);
      
      toast({
        title: "Assessment Completed!",
        description: `Your score: ${Math.round(response.data.score)}%`,
      });

      router.push(`/assessments/${params.assessmentId}/results/${params.attemptId}`);
    } catch (error) {
      console.error("Error completing assessment:", error);
      toast({
        title: "Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { question } = currentQuestion;
    const answer = answers[currentQuestion.id];

    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.text}</p>
            <RadioGroup value={answer?.toString()} onValueChange={(value) => handleAnswerChange(parseInt(value))}>
              {question.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "short_answer":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.text}</p>
            <Textarea
              value={answer || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[150px]"
            />
          </div>
        );

      case "letter_recognition":
      case "word_reading":
        return (
          <div className="space-y-6">
            <p className="text-lg font-medium">{question.text}</p>
            <div className="grid grid-cols-5 gap-4">
              {(question.letters || question.words)?.map((item: string, index: number) => (
                <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <span className="text-2xl font-bold">{item}</span>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
            {isRecording && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Recording in progress... Read each item clearly.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "passage_reading":
        return (
          <div className="space-y-6">
            <p className="text-lg font-medium">{question.text}</p>
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed">{question.passage}</p>
              </CardContent>
            </Card>
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return <p>Unknown question type</p>;
    }
  };

  if (!assessmentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setShowExitDialog(true)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>

            <div className="flex items-center gap-6">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-2 mt-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
              <Badge variant="secondary">{currentQuestion?.points} points</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-3xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {assessmentData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[assessmentData.questions[index].id]
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleCompleteAssessment}
              disabled={submitting || !answers[currentQuestion!.id]}
            >
              {submitting ? "Submitting..." : "Complete Assessment"}
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion!.id]}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Assessment?</DialogTitle>
            <DialogDescription>
              Your progress will be saved, but leaving now will mark this attempt as incomplete.
              You can resume later or start a new attempt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Assessment
            </Button>
            <Button variant="destructive" onClick={() => router.push("/assessments")}>
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}