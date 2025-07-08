"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, Trophy, Lock, CheckCircle } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  titleKh: string;
  description: string;
  duration: number;
  order: number;
  exercises?: number;
  completed?: boolean;
  progress?: number;
  locked?: boolean;
}

interface Subject {
  id: string;
  name: string;
  nameKh: string;
  icon: string;
  lessons: Lesson[];
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("1");

  useEffect(() => {
    fetchSubjectDetails();
  }, [params.subjectId, selectedGrade]);

  const fetchSubjectDetails = async () => {
    try {
      const response = await fetch(`/api/subjects/${params.subjectId}?grade=${selectedGrade}`);
      if (response.ok) {
        const data = await response.json();
        // Add some mock data for demonstration
        const lessonsWithStatus = data.lessons?.map((lesson: Lesson, index: number) => ({
          ...lesson,
          exercises: 10 + Math.floor(Math.random() * 10),
          completed: index < 2,
          progress: index === 0 ? 100 : index === 1 ? 60 : 0,
          locked: index > 2,
        })) || [];
        setSubject({ ...data, lessons: lessonsWithStatus });
      }
    } catch (error) {
      console.error("Error fetching subject details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading lessons...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Subject not found</p>
      </div>
    );
  }

  const completedLessons = subject.lessons.filter(l => l.completed).length;
  const totalLessons = subject.lessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/subjects" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Subjects
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{subject.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{subject.name}</h1>
            <p className="text-xl text-gray-600">{subject.nameKh}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Badge variant="secondary">Grade {selectedGrade}</Badge>
          <select 
            value={selectedGrade} 
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 5, 6].map(grade => (
              <option key={grade} value={grade}>Grade {grade}</option>
            ))}
          </select>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedLessons} of {totalLessons} lessons</span>
            </div>
            <Progress value={overallProgress} className="mb-2" />
            <p className="text-xs text-gray-600">{overallProgress}% Complete</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {subject.lessons.map((lesson, index) => (
          <Card 
            key={lesson.id} 
            className={`transition-all ${lesson.locked ? 'opacity-60' : 'hover:shadow-lg'}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                    ${lesson.completed ? 'bg-green-500' : lesson.progress ? 'bg-blue-500' : 'bg-gray-400'}
                  `}>
                    {lesson.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">
                      {lesson.title}
                      {lesson.locked && <Lock className="inline-block w-4 h-4 ml-2 text-gray-400" />}
                    </CardTitle>
                    <CardDescription className="text-base">{lesson.titleKh}</CardDescription>
                    <p className="text-sm text-gray-600 mt-2">{lesson.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {lesson.completed && (
                    <Badge variant="default" className="bg-green-500">Completed</Badge>
                  )}
                  {!lesson.completed && lesson.progress > 0 && (
                    <Badge variant="secondary">In Progress</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{lesson.exercises} exercises</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration} mins</span>
                  </div>
                  {lesson.completed && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>100 points earned</span>
                    </div>
                  )}
                </div>
                <Button 
                  asChild 
                  variant={lesson.locked ? "outline" : lesson.completed ? "secondary" : "default"}
                  disabled={lesson.locked}
                >
                  <Link href={`/subjects/${params.subjectId}/lessons/${lesson.id}`}>
                    {lesson.locked ? "Locked" : lesson.completed ? "Review" : "Start Lesson"}
                  </Link>
                </Button>
              </div>
              {lesson.progress > 0 && !lesson.completed && (
                <div className="mt-4">
                  <Progress value={lesson.progress} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">{lesson.progress}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}