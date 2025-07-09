"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";

interface SubjectProgressCardProps {
  subject: {
    id: string;
    name: string;
    nameKh?: string;
    icon: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    exercisesCompleted: number;
    totalExercises: number;
    averageScore?: number;
    lastActivity?: string;
    nextLesson?: {
      id: string;
      title: string;
    };
  };
  variant?: "default" | "compact";
  showActions?: boolean;
  className?: string;
}

export function SubjectProgressCard({
  subject,
  variant = "default",
  showActions = true,
  className,
}: SubjectProgressCardProps) {
  const isCompleted = subject.progress === 100;
  const isNearCompletion = subject.progress >= 80 && !isCompleted;

  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{subject.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold">{subject.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{subject.lessonsCompleted}/{subject.totalLessons} lessons</span>
                {subject.averageScore && (
                  <>
                    <span>•</span>
                    <span>{subject.averageScore}% avg</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{subject.progress}%</div>
              {subject.lastActivity && (
                <p className="text-xs text-muted-foreground">{subject.lastActivity}</p>
              )}
            </div>
          </div>
          <Progress value={subject.progress} className="h-2 mt-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      {isCompleted && (
        <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
      )}
      {isNearCompletion && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{subject.icon}</span>
            <div>
              <CardTitle className="text-xl">{subject.name}</CardTitle>
              {subject.nameKh && (
                <CardDescription className="text-base">{subject.nameKh}</CardDescription>
              )}
            </div>
          </div>
          <ProgressRing
            progress={subject.progress}
            size={80}
            strokeWidth={6}
            color={
              isCompleted ? "rgb(34, 197, 94)" : // green-500
              isNearCompletion ? "rgb(250, 204, 21)" : // yellow-400
              "rgb(59, 130, 246)" // blue-500
            }
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Lessons</p>
            <p className="text-2xl font-semibold">
              {subject.lessonsCompleted}/{subject.totalLessons}
            </p>
            <Progress 
              value={(subject.lessonsCompleted / subject.totalLessons) * 100} 
              className="h-1.5"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Exercises</p>
            <p className="text-2xl font-semibold">
              {subject.exercisesCompleted}/{subject.totalExercises}
            </p>
            <Progress 
              value={(subject.exercisesCompleted / subject.totalExercises) * 100} 
              className="h-1.5"
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            {subject.averageScore !== undefined && (
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span>{subject.averageScore}% avg score</span>
              </div>
            )}
            {subject.lastActivity && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{subject.lastActivity}</span>
              </div>
            )}
          </div>
          {isNearCompletion && (
            <Badge variant="secondary" className="bg-yellow-100">
              <TrendingUp className="h-3 w-3 mr-1" />
              Almost there!
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100">
              <Trophy className="h-3 w-3 mr-1" />
              Completed!
            </Badge>
          )}
        </div>

        {/* Next Lesson Preview */}
        {subject.nextLesson && !isCompleted && (
          <div className="p-3 border rounded-lg bg-background">
            <p className="text-sm font-medium mb-1">Next lesson:</p>
            <p className="text-sm text-muted-foreground">{subject.nextLesson.title}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link href={`/subjects/${subject.id}`} className="flex-1">
              <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                {isCompleted ? "Review" : "Continue Learning"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            {!isCompleted && (
              <Link href={`/subjects/${subject.id}/practice`}>
                <Button variant="outline" size="icon">
                  <Brain className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}