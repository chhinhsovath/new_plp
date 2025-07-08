"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  BarChart3,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  MessageSquare,
  FileText,
  Video,
  Plus,
} from "lucide-react";

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  activeAssignments: number;
  pendingGrading: number;
  upcomingClasses: number;
  averageClassProgress: number;
  recentSubmissions: number;
  forumActivity: number;
}

interface RecentActivity {
  id: string;
  type: "submission" | "question" | "grade" | "attendance";
  title: string;
  studentName: string;
  className: string;
  timestamp: string;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    pendingGrading: 0,
    upcomingClasses: 0,
    averageClassProgress: 0,
    recentSubmissions: 0,
    forumActivity: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/teacher/stats"),
        fetch("/api/teacher/activity"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Class",
      description: "Set up a new class",
      icon: Plus,
      href: "/teacher/classes/new",
      color: "text-blue-600",
    },
    {
      title: "Assignments",
      description: "Manage assignments",
      icon: ClipboardList,
      href: "/teacher/assignments",
      color: "text-green-600",
    },
    {
      title: "Grade Book",
      description: "View and update grades",
      icon: Award,
      href: "/teacher/grades",
      color: "text-yellow-600",
    },
    {
      title: "Schedule",
      description: "Class schedule",
      icon: Calendar,
      href: "/teacher/schedule",
      color: "text-purple-600",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "submission": return <FileText className="w-4 h-4" />;
      case "question": return <MessageSquare className="w-4 h-4" />;
      case "grade": return <Award className="w-4 h-4" />;
      case "attendance": return <Users className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your classes
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingGrading}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assignments to grade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageClassProgress}%</div>
            <Progress value={stats.averageClassProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.href} href={action.href}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 bg-gray-50 rounded-lg ${action.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{action.title}</h3>
                              <p className="text-sm text-gray-600">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Schedule</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/teacher/schedule">
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">9:00 AM</p>
                    <p className="text-xs text-gray-500">1 hour</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Mathematics - Grade 7A</p>
                    <p className="text-sm text-gray-600">Chapter 5: Algebra Basics</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/teacher/live/math-7a">
                      <Video className="w-4 h-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">11:00 AM</p>
                    <p className="text-xs text-gray-500">1 hour</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Science - Grade 8B</p>
                    <p className="text-sm text-gray-600">Lab: Chemical Reactions</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/teacher/live/science-8b">
                      <Video className="w-4 h-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">2:00 PM</p>
                    <p className="text-xs text-gray-500">1 hour</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">English - Grade 9C</p>
                    <p className="text-sm text-gray-600">Essay Writing Workshop</p>
                  </div>
                  <Badge variant="secondary">Upcoming</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {activity.studentName} • {activity.className}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>{stats.pendingGrading} assignments need grading</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{stats.recentSubmissions} new submissions today</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{stats.upcomingClasses} classes scheduled today</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{stats.forumActivity} new forum posts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}