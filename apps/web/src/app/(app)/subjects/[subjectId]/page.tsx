"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  ChevronRight, 
  Play,
  FileText,
  Users,
  Star,
  Target,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SubjectPageProps {
  params: {
    subjectId: string;
  };
}

// Subject-specific colors and icons
const subjectThemes: Record<string, { color: string; icon: any; gradient: string }> = {
  math: { 
    color: "text-blue-600", 
    icon: "🔢", 
    gradient: "from-blue-50 to-blue-100" 
  },
  khmer: { 
    color: "text-red-600", 
    icon: "🇰🇭", 
    gradient: "from-red-50 to-red-100" 
  },
  english: { 
    color: "text-green-600", 
    icon: "🔤", 
    gradient: "from-green-50 to-green-100" 
  },
  science: { 
    color: "text-purple-600", 
    icon: "🔬", 
    gradient: "from-purple-50 to-purple-100" 
  },
  social_studies: { 
    color: "text-orange-600", 
    icon: "🌍", 
    gradient: "from-orange-50 to-orange-100" 
  },
  calm: { 
    color: "text-pink-600", 
    icon: "🎨", 
    gradient: "from-pink-50 to-pink-100" 
  },
};

export default function SubjectPage({ params }: SubjectPageProps) {
  const [subject, setSubject] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalVideos: 0,
    totalResources: 0,
  });

  useEffect(() => {
    fetchSubject();
  }, [params.subjectId, selectedGrade]);

  const fetchSubject = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/subjects/${params.subjectId}?grade=${selectedGrade}`);
      setSubject(response.data);

      // Fetch additional stats
      const [videosRes, resourcesRes] = await Promise.all([
        api.get(`/videos?subject=${response.data.id}&limit=1`),
        api.get(`/library/resources?subject=${response.data.id}&limit=1`),
      ]);

      setStats({
        totalLessons: response.data.lessons?.length || 0,
        completedLessons: 0, // TODO: Get from user progress
        totalVideos: videosRes.data.pagination?.total || 0,
        totalResources: resourcesRes.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching subject:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    notFound();
  }

  const theme = subjectThemes[subject.code] || subjectThemes.math;
  const progressPercentage = stats.totalLessons > 0 
    ? (stats.completedLessons / stats.totalLessons) * 100 
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className={cn("bg-gradient-to-br", theme.gradient, "pb-8")}>
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">{theme.icon}</div>
            <div>
              <h1 className={cn("text-4xl font-bold", theme.color)}>
                {subject.name}
              </h1>
              {subject.nameKh && (
                <p className="text-2xl text-muted-foreground mt-1">
                  {subject.nameKh}
                </p>
              )}
            </div>
          </div>

          {subject.description && (
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
              {subject.description}
            </p>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                    <p className="text-2xl font-bold">{stats.totalLessons}</p>
                  </div>
                  <BookOpen className={cn("h-8 w-8", theme.color)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Videos</p>
                    <p className="text-2xl font-bold">{stats.totalVideos}</p>
                  </div>
                  <Play className={cn("h-8 w-8", theme.color)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resources</p>
                    <p className="text-2xl font-bold">{stats.totalResources}</p>
                  </div>
                  <FileText className={cn("h-8 w-8", theme.color)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                  </div>
                  <Trophy className={cn("h-8 w-8", theme.color)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Grade Selector */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <Button
                key={grade}
                variant={selectedGrade === grade.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade(grade.toString())}
              >
                Grade {grade}
              </Button>
            ))}
          </div>

          <TabsContent value="lessons" className="space-y-4">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  Keep up the great work! You're making excellent progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressPercentage} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {stats.completedLessons} of {stats.totalLessons} lessons completed
                </p>
              </CardContent>
            </Card>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subject.lessons?.map((lesson: any, index: number) => (
                <Link key={lesson.id} href={`/subjects/${subject.code}/lessons/${lesson.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {lesson.title}
                          </CardTitle>
                          {lesson.titleKh && (
                            <CardDescription className="mt-1">
                              {lesson.titleKh}
                            </CardDescription>
                          )}
                        </div>
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                          index % 4 === 0 ? "bg-blue-500" :
                          index % 4 === 1 ? "bg-green-500" :
                          index % 4 === 2 ? "bg-purple-500" :
                          "bg-orange-500"
                        )}>
                          {index + 1}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration} min</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {(!subject.lessons || subject.lessons.length === 0) && (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No lessons available for Grade {selectedGrade} yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="videos">
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Video Lessons</p>
              <p className="text-muted-foreground mb-4">
                Watch educational videos for {subject.name}
              </p>
              <Link href={`/videos?subject=${subject.id}&grade=${selectedGrade}`}>
                <Button>
                  Browse Videos
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Learning Resources</p>
              <p className="text-muted-foreground mb-4">
                Download worksheets and study materials for {subject.name}
              </p>
              <Link href={`/library?subject=${subject.id}&grade=${selectedGrade}`}>
                <Button>
                  Browse Resources
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Community Forum</p>
              <p className="text-muted-foreground mb-4">
                Join discussions and ask questions about {subject.name}
              </p>
              <Link href={`/forum?subject=${subject.code}`}>
                <Button>
                  Visit Forum
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}