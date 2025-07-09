"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Trophy,
  Clock,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  Star,
  Target,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PDCourse {
  id: string;
  title: string;
  titleKh?: string;
  description: string;
  duration: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  _count: {
    modules: number;
    enrollments: number;
  };
  isEnrolled?: boolean;
  enrollmentProgress?: number;
}

interface Enrollment {
  id: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  course: PDCourse;
}

interface Certificate {
  id: string;
  issuedAt: string;
  certificateUrl: string;
  certificate: {
    course: {
      title: string;
      duration: number;
    };
  };
}

const levelColors = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  ADVANCED: "bg-red-100 text-red-700",
};

const levelIcons = {
  BEGINNER: "🌱",
  INTERMEDIATE: "🌿",
  ADVANCED: "🌳",
};

export default function ProfessionalDevelopmentPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<PDCourse[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [stats, setStats] = useState({
    totalHours: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0,
  });

  useEffect(() => {
    fetchData();
  }, [levelFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter) params.append("level", levelFilter);

      const [coursesRes, enrollmentsRes, certificatesRes] = await Promise.all([
        api.get(`/pd/courses?${params}`),
        api.get("/pd/enrollments"),
        api.get("/pd/certificates"),
      ]);

      setCourses(coursesRes.data.courses);
      setEnrollments(enrollmentsRes.data);
      setCertificates(certificatesRes.data);

      // Calculate stats
      const completedCourses = enrollmentsRes.data.filter((e: Enrollment) => e.completedAt).length;
      const inProgressCourses = enrollmentsRes.data.filter((e: Enrollment) => !e.completedAt).length;
      const totalHours = enrollmentsRes.data.reduce((acc: number, e: Enrollment) => {
        return acc + (e.course.duration * (e.progress / 100));
      }, 0);

      setStats({
        totalHours: Math.round(totalHours),
        completedCourses,
        inProgressCourses,
        certificates: certificatesRes.data.length,
      });
    } catch (error) {
      console.error("Error fetching PD data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post(`/pd/courses/${courseId}/enroll`);
      await fetchData(); // Refresh data
      router.push(`/professional-development/courses/${courseId}`);
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Professional Development</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Enhance your teaching skills with our comprehensive training programs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalHours}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-900">{stats.completedCourses}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-orange-900">{stats.inProgressCourses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Certificates</p>
                <p className="text-3xl font-bold text-purple-900">{stats.certificates}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Available Courses</h2>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={levelColors[course.level]}>
                      {levelIcons[course.level]} {course.level}
                    </Badge>
                    {course.isEnrolled && (
                      <Badge variant="secondary">Enrolled</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  {course.titleKh && (
                    <CardDescription className="text-base mt-1">
                      {course.titleKh}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course._count.modules} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course._count.enrollments}</span>
                    </div>
                  </div>

                  {course.isEnrolled && course.enrollmentProgress !== undefined && (
                    <div className="space-y-2">
                      <Progress value={course.enrollmentProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(course.enrollmentProgress)}% complete
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => 
                      course.isEnrolled 
                        ? router.push(`/professional-development/courses/${course.id}`)
                        : handleEnroll(course.id)
                    }
                  >
                    {course.isEnrolled ? "Continue Learning" : "Enroll Now"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Courses Tab */}
        <TabsContent value="enrolled" className="space-y-6">
          <h2 className="text-2xl font-semibold">My Courses</h2>
          
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet
                </p>
                <Button onClick={() => document.querySelector('[data-value="courses"]')?.click()}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            {enrollment.course.title}
                          </h3>
                          <Badge className={levelColors[enrollment.course.level]} variant="secondary">
                            {enrollment.course.level}
                          </Badge>
                          {enrollment.completedAt && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          Enrolled {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/professional-development/courses/${enrollment.course.id}`)}
                      >
                        {enrollment.completedAt ? "Review" : "Continue"}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <h2 className="text-2xl font-semibold">My Certificates</h2>
          
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete courses to earn certificates
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {cert.certificate.course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Earned {formatDistanceToNow(new Date(cert.issuedAt), { addSuffix: true })}
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                        View Certificate
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}