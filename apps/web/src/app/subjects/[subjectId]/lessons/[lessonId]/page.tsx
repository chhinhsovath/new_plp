"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, CheckCircle, Play, FileText, Headphones, PenTool } from "lucide-react";

interface Exercise {
  id: string;
  type: string;
  title: string;
  instructions: string;
  points: number;
  completed?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  titleKh: string;
  description: string;
  exercises: Exercise[];
  totalPoints: number;
  earnedPoints: number;
}

const exerciseTypeIcons: Record<string, any> = {
  MULTIPLE_CHOICE: FileText,
  FILL_IN_GAPS: PenTool,
  LISTENING: Headphones,
  DRAG_DROP: Play,
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonDetails();
  }, [params.lessonId]);

  const fetchLessonDetails = async () => {
    try {
      // Mock data for demonstration
      const mockLesson: Lesson = {
        id: params.lessonId as string,
        title: "Addition with Single Digits",
        titleKh: "ការបូកលេខមួយខ្ទង់",
        description: "Learn to add single-digit numbers through interactive exercises",
        exercises: [
          {
            id: "1",
            type: "MULTIPLE_CHOICE",
            title: "Choose the correct answer",
            instructions: "What is 2 + 3?",
            points: 10,
            completed: true,
          },
          {
            id: "2",
            type: "FILL_IN_GAPS",
            title: "Fill in the missing number",
            instructions: "Complete the equation: 4 + ___ = 7",
            points: 15,
            completed: true,
          },
          {
            id: "3",
            type: "DRAG_DROP",
            title: "Match the numbers",
            instructions: "Drag the correct answer to each equation",
            points: 20,
            completed: false,
          },
          {
            id: "4",
            type: "LISTENING",
            title: "Listen and answer",
            instructions: "Listen to the problem and select the answer",
            points: 25,
            completed: false,
          },
        ],
        totalPoints: 70,
        earnedPoints: 25,
      };
      setLesson(mockLesson);
    } catch (error) {
      console.error("Error fetching lesson details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lesson not found</p>
      </div>
    );
  }

  const completedExercises = lesson.exercises.filter(e => e.completed).length;
  const progress = Math.round((completedExercises / lesson.exercises.length) * 100);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link 
          href={`/subjects/${params.subjectId}`} 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Lessons
        </Link>

        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{lesson.titleKh}</p>
        <p className="text-gray-600 mb-6">{lesson.description}</p>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Exercises</p>
                <p className="text-lg font-medium">{completedExercises} of {lesson.exercises.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Points Earned</p>
                <p className="text-lg font-medium">{lesson.earnedPoints} / {lesson.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          {lesson.exercises.map((exercise, index) => {
            const Icon = exerciseTypeIcons[exercise.type] || BookOpen;
            return (
              <Card key={exercise.id} className={exercise.completed ? "border-green-200" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${exercise.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}
                      `}>
                        {exercise.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Exercise {index + 1}: {exercise.title}
                        </CardTitle>
                        <CardDescription>{exercise.instructions}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={exercise.completed ? "default" : "secondary"}>
                        {exercise.points} points
                      </Badge>
                      {exercise.completed && (
                        <p className="text-xs text-green-600 mt-1">Completed</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{exercise.type.replace(/_/g, " ")}</Badge>
                    <Button 
                      variant={exercise.completed ? "secondary" : "default"}
                      size="sm"
                      disabled
                    >
                      {exercise.completed ? "Review" : "Start Exercise"}
                    </Button>
                  </div>
                  {!exercise.completed && index === completedExercises && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        ⚠️ Interactive exercises coming soon! For now, you can view the lesson content.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">What you'll learn:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Basic addition concepts</li>
                  <li>Adding single-digit numbers</li>
                  <li>Using visual aids for addition</li>
                  <li>Problem-solving strategies</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Skills practiced:</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Mental Math</Badge>
                  <Badge variant="secondary">Problem Solving</Badge>
                  <Badge variant="secondary">Number Recognition</Badge>
                  <Badge variant="secondary">Critical Thinking</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tips for success:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Take your time with each exercise</li>
                  <li>Use your fingers or objects to count if needed</li>
                  <li>Check your work before submitting</li>
                  <li>Practice makes perfect!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/subjects/${params.subjectId}`}>
            Back to Lessons
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/learn/${params.subjectId}/${params.lessonId}`}>
            Start Learning
          </Link>
        </Button>
      </div>
    </div>
  );
}