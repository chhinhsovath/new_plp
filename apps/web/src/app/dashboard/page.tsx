"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trophy, Clock, TrendingUp, Users, UserPlus, FileText, BarChart, MessageSquare, CreditCard, Video } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/users/me");
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-600 mt-2">
          {userData?.role === "STUDENT" && `Grade ${userData?.studentProfile?.grade} Student`}
          {userData?.role === "PARENT" && "Parent Account"}
          {userData?.role === "TEACHER" && "Teacher Account"}
        </p>
      </div>

      {userData?.role === "STUDENT" && (
        <StudentDashboard userData={userData} />
      )}
      {userData?.role === "PARENT" && (
        <ParentDashboard userData={userData} />
      )}
      {userData?.role === "TEACHER" && (
        <TeacherDashboard userData={userData} />
      )}
    </div>
  );
}

function StudentDashboard({ userData }: { userData: any }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.studentProfile?.points || 0}</div>
            <p className="text-xs text-muted-foreground">Level {userData?.studentProfile?.level || 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.studentProfile?.streak || 0} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/subjects" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <BookOpen className="h-8 w-8 mb-2 text-blue-600" />
                <h3 className="font-semibold">Browse Subjects</h3>
                <p className="text-sm text-gray-600 mt-1">Explore courses</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assignments" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <FileText className="h-8 w-8 mb-2 text-red-600" />
                <h3 className="font-semibold">Assignments</h3>
                <p className="text-sm text-gray-600 mt-1">View & submit</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/progress" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <BarChart className="h-8 w-8 mb-2 text-green-600" />
                <h3 className="font-semibold">My Progress</h3>
                <p className="text-sm text-gray-600 mt-1">Track learning</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/forum" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <MessageSquare className="h-8 w-8 mb-2 text-purple-600" />
                <h3 className="font-semibold">Forum</h3>
                <p className="text-sm text-gray-600 mt-1">Ask questions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Additional Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
        <Link href="/live" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Video className="h-8 w-8 mb-2 text-orange-600" />
                <h3 className="font-semibold">Live Classes</h3>
                <p className="text-sm text-gray-600 mt-1">Join live sessions</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payment/manage" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CreditCard className="h-8 w-8 mb-2 text-indigo-600" />
                <h3 className="font-semibold">Subscription</h3>
                <p className="text-sm text-gray-600 mt-1">Manage plan</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href="/subjects/math">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Mathematics - Addition
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Choose a subject to practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <Link href="/subjects/khmer">Khmer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/subjects/math">Math</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/subjects/english">English</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/subjects/science">Science</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ParentDashboard({ userData }: { userData: any }) {
  const [children, setChildren] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/users/children");
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoadingChildren(false);
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="children">Children ({children.length})</TabsTrigger>
        <TabsTrigger value="progress">Progress</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{children.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/dashboard/add-child">Add Child Account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/reports">View Progress Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="children">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Children</CardTitle>
              <CardDescription>Manage your children's accounts</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/add-child">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Child
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingChildren ? (
              <p>Loading...</p>
            ) : children.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No children added yet.</p>
                <Button asChild>
                  <Link href="/dashboard/add-child">Add Your First Child</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {child.firstName} {child.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Grade {child.studentProfile?.grade} • 
                          Level {child.studentProfile?.level} • 
                          {child.studentProfile?.points} points
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Progress
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="progress">
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <p className="text-muted-foreground">Add children to see their progress.</p>
            ) : (
              <p className="text-muted-foreground">Progress tracking coming soon...</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function TeacherDashboard({ userData }: { userData: any }) {
  // Redirect to teacher dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/teacher';
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Redirecting to Teacher Dashboard...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please wait...</p>
        </CardContent>
      </Card>
    </div>
  );
}