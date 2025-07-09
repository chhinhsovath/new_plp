"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Share2,
  RotateCcw,
  Home,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface AssessmentResultsPageProps {
  params: {
    assessmentId: string;
    attemptId: string;
  };
}

interface ResultsData {
  id: string;
  startedAt: string;
  completedAt: string;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  responses: {
    id: string;
    questionId: string;
    answer: any;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  assessment: {
    id: string;
    title: string;
    titleKh?: string;
    type: string;
    questions: {
      id: string;
      question: any;
      correctAnswer: any;
      points: number;
      order: number;
    }[];
  };
}

export default function AssessmentResultsPage({ params }: AssessmentResultsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [params]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch the complete results from the API
      // For now, using mock data
      const mockResults: ResultsData = {
        id: params.attemptId,
        startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        score: 85,
        totalPoints: 100,
        earnedPoints: 85,
        responses: [
          {
            id: "1",
            questionId: "1",
            answer: 2,
            isCorrect: true,
            timeSpent: 45,
          },
          {
            id: "2",
            questionId: "2",
            answer: "The water cycle involves evaporation, condensation, and precipitation.",
            isCorrect: true,
            timeSpent: 120,
          },
        ],
        assessment: {
          id: params.assessmentId,
          title: "Grade 3 Science Assessment",
          type: "PROFICIENCY_TEST",
          questions: [
            {
              id: "1",
              question: {
                type: "multiple_choice",
                text: "What is 5 + 3?",
                options: ["6", "7", "8", "9"],
              },
              correctAnswer: 2,
              points: 10,
              order: 1,
            },
            {
              id: "2",
              question: {
                type: "short_answer",
                text: "Explain the water cycle in your own words.",
              },
              correctAnswer: "Water evaporates, forms clouds, and falls as rain",
              points: 10,
              order: 2,
            },
          ],
        },
      };

      setResults(mockResults);

      // Trigger confetti for high scores
      if (mockResults.score >= 80) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Error",
        description: "Failed to load results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: "A", color: "text-green-600", message: "Excellent!" };
    if (score >= 80) return { grade: "B", color: "text-blue-600", message: "Great job!" };
    if (score >= 70) return { grade: "C", color: "text-yellow-600", message: "Good effort!" };
    if (score >= 60) return { grade: "D", color: "text-orange-600", message: "Keep practicing!" };
    return { grade: "F", color: "text-red-600", message: "Need improvement" };
  };

  const calculateTimeTaken = () => {
    if (!results) return "0:00";
    const start = new Date(results.startedAt).getTime();
    const end = new Date(results.completedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Assessment Results - ${results?.assessment.title}`,
        text: `I scored ${results?.score}% on the ${results?.assessment.title}!`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share your results with others.",
      });
    }
  };

  if (loading || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gradeInfo = getGrade(results.score);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Results Summary */}
        <Card className="overflow-hidden">
          <div className={cn(
            "h-2",
            results.score >= 80 ? "bg-green-500" :
            results.score >= 60 ? "bg-yellow-500" :
            "bg-red-500"
          )} />
          <CardHeader className="text-center pb-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-3xl">Assessment Complete!</CardTitle>
            <CardDescription className="text-lg">
              {results.assessment.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Score Display */}
            <div>
              <div className={cn("text-6xl font-bold mb-2", gradeInfo.color)}>
                {results.score}%
              </div>
              <p className="text-xl text-muted-foreground">{gradeInfo.message}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div>
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-semibold">{results.earnedPoints}/{results.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Points Earned</p>
              </div>
              <div>
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-semibold">{calculateTimeTaken()}</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
              <div>
                <div className={cn("text-4xl font-bold mb-2", gradeInfo.color)}>
                  {gradeInfo.grade}
                </div>
                <p className="text-sm text-muted-foreground">Grade</p>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => router.push(`/assessments/${params.assessmentId}`)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        {showDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
              <CardDescription>
                Review your answers and see where you can improve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {results.assessment.questions.map((question, index) => {
                const response = results.responses.find(r => r.questionId === question.id);
                const isCorrect = response?.isCorrect || false;

                return (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white",
                        isCorrect ? "bg-green-600" : "bg-red-600"
                      )}>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          Question {index + 1}: {question.question.text}
                        </p>
                        
                        {question.question.type === "multiple_choice" && (
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Your answer:</span>{" "}
                              {question.question.options[response?.answer] || "Not answered"}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Correct answer:</span>{" "}
                                {question.question.options[question.correctAnswer]}
                              </p>
                            )}
                          </div>
                        )}

                        {question.question.type === "short_answer" && (
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Your answer:</span>{" "}
                              {response?.answer || "Not answered"}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{question.points} points</span>
                          <span>Time: {response?.timeSpent || 0}s</span>
                        </div>
                      </div>
                    </div>
                    {index < results.assessment.questions.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/assessments">
            <Button variant="outline">
              Back to Assessments
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}