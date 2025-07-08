"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  GraduationCap,
  MessageSquare,
  Activity,
  TrendingUp,
  TrendingDown,
  School,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeStudents: number;
  totalSubjects: number;
  totalLessons: number;
  totalExercises: number;
  forumPosts: number;
  monthlyRevenue: number;
  revenueChange: number;
  userGrowth: number;
  engagementRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeStudents: 0,
    totalSubjects: 0,
    totalLessons: 0,
    totalExercises: 0,
    forumPosts: 0,
    monthlyRevenue: 0,
    revenueChange: 0,
    userGrowth: 0,
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
    },
    {
      title: "Content Management",
      description: "Manage subjects, lessons, and exercises",
      icon: BookOpen,
      href: "/admin/content",
      color: "text-green-600",
    },
    {
      title: "Forum Moderation",
      description: "Moderate forum posts and answers",
      icon: MessageSquare,
      href: "/admin/forum",
      color: "text-purple-600",
    },
    {
      title: "Payment History",
      description: "View payment transactions",
      icon: DollarSign,
      href: "/admin/payments",
      color: "text-yellow-600",
    },
    {
      title: "Analytics",
      description: "View detailed analytics and reports",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-indigo-600",
    },
    {
      title: "Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage your platform and monitor performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stats.userGrowth > 0 ? "text-green-600" : "text-red-600"}>
                {stats.userGrowth > 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                {Math.abs(stats.userGrowth)}%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.activeStudents / stats.totalUsers) * 100)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stats.revenueChange > 0 ? "text-green-600" : "text-red-600"}>
                {stats.revenueChange > 0 ? "+" : ""}{stats.revenueChange}%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily active users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subjects</span>
              <span className="font-medium">{stats.totalSubjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lessons</span>
              <span className="font-medium">{stats.totalLessons}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Exercises</span>
              <span className="font-medium">{stats.totalExercises}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Forum Posts</span>
              <span className="font-medium">{stats.forumPosts}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">5 new users registered today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">12 forum posts created</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">3 new lessons published</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">8 payments processed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}