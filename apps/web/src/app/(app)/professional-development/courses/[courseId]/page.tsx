"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Download,
  ChevronLeft,
  Award,
  Lock,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PDCoursePageProps {
  params: {
    courseId: string;
  };
}

interface Module {
  id: string;
  title: string;
  titleKh?: string;
  content: any;
  order: number;
  duration: number;
  isCompleted?: boolean;
}

interface CourseDetails {
  id: string;
  title: string;
  titleKh?: string;
  description: string;
  duration: number;
  level: string;
  modules: Module[];
  certificate?: {
    id: string;
    templateUrl: string;
  };
  enrollment?: {
    enrolledAt: string;
    completedAt?: string;
    progress: number;
  };
}

export default function PDCoursePage({ params }: PDCoursePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingModule, setCompletingModule] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showModuleContent, setShowModuleContent] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pd/courses/${params.courseId}`);
      setCourse(response.data);
      
      // Set first incomplete module as current
      const firstIncomplete = response.data.modules.find((m: Module) => !m.isCompleted);
      if (firstIncomplete) {
        setCurrentModule(firstIncomplete);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = async (moduleId: string) => {
    setCompletingModule(moduleId);
    try {
      const response = await api.post(`/pd/modules/${moduleId}/complete`);
      
      await fetchCourse(); // Refresh course data
      
      toast({
        title: "Module completed!",
        description: `Progress: ${Math.round(response.data.progress)}%`,
      });

      // If course is completed, show certificate dialog
      if (response.data.progress === 100) {
        toast({
          title: "🎉 Congratulations!",
          description: "You've completed the course and earned a certificate!",
        });
      }

      // Move to next module
      const currentIndex = course!.modules.findIndex(m => m.id === moduleId);
      if (currentIndex < course!.modules.length - 1) {
        setCurrentModule(course!.modules[currentIndex + 1]);
      }
    } catch (error) {
      console.error("Error completing module:", error);
      toast({
        title: "Error",
        description: "Failed to complete module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingModule(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  const completedModules = course.modules.filter(m => m.isCompleted).length;
  const progressPercentage = course.enrollment?.progress || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/professional-development">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            {course.titleKh && (
              <p className="text-xl text-muted-foreground">{course.titleKh}</p>
            )}
          </div>
          <Badge className="text-base px-3 py-1">
            {course.level}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration} hours total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{completedModules} completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>
                Complete all modules to earn your certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module, index) => {
                  const isLocked = index > 0 && !course.modules[index - 1].isCompleted;
                  
                  return (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
                              module.isCompleted ? "bg-green-600" : 
                              isLocked ? "bg-gray-400" :
                              "bg-primary"
                            )}>
                              {module.isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : isLocked ? (
                                <Lock className="h-5 w-5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{module.title}</p>
                              {module.titleKh && (
                                <p className="text-sm text-muted-foreground">
                                  {module.titleKh}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{module.duration} min</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-13 pr-4 space-y-4">
                          {/* Module content preview */}
                          <div className="text-sm text-muted-foreground">
                            {module.content.description || "Interactive learning content"}
                          </div>
                          
                          {!isLocked && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setCurrentModule(module);
                                  setShowModuleContent(true);
                                }}
                                variant={module.isCompleted ? "outline" : "default"}
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                {module.isCompleted ? "Review Module" : "Start Module"}
                              </Button>
                              
                              {!module.isCompleted && (
                                <Button
                                  onClick={() => handleModuleComplete(module.id)}
                                  variant="outline"
                                  disabled={completingModule === module.id}
                                >
                                  {completingModule === module.id ? (
                                    "Completing..."
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round(progressPercentage)}%
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              
              <Progress value={progressPercentage} className="h-3" />
              
              <div className="text-sm text-muted-foreground text-center">
                {completedModules} of {course.modules.length} modules completed
              </div>

              {progressPercentage === 100 && course.certificate && (
                <Button className="w-full" variant="default">
                  <Award className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentModule && !currentModule.isCompleted && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowModuleContent(true)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Continue: {currentModule.title}
                </Button>
              )}
              
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {/* TODO: Show resources */}}
              >
                <FileText className="h-4 w-4 mr-2" />
                Course Resources
              </Button>
              
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {/* TODO: Show discussion */}}
              >
                <Users className="h-4 w-4 mr-2" />
                Discussion Forum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Content Dialog */}
      <Dialog open={showModuleContent} onOpenChange={setShowModuleContent}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentModule?.title}</DialogTitle>
            {currentModule?.titleKh && (
              <DialogDescription>{currentModule.titleKh}</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Module content would be rendered here based on content type */}
            <div className="prose prose-sm max-w-none">
              <p>Module content would be displayed here...</p>
              {/* This would render video, text, quizzes, etc. based on module.content */}
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowModuleContent(false)}>
                Close
              </Button>
              {currentModule && !currentModule.isCompleted && (
                <Button 
                  onClick={() => {
                    handleModuleComplete(currentModule.id);
                    setShowModuleContent(false);
                  }}
                  disabled={completingModule === currentModule.id}
                >
                  {completingModule === currentModule.id ? (
                    "Completing..."
                  ) : (
                    "Complete Module"
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}