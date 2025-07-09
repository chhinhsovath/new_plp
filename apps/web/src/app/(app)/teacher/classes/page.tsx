"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { BilingualHeading, BilingualText } from "@/components/ui/bilingual-text";
import { FormattedNumber } from "@/components/ui/formatted-number";
import { FormattedDate } from "@/components/ui/formatted-date";
import {
  Users,
  Plus,
  Settings,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Upload,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Class {
  id: string;
  name: string;
  grade: number;
  subject?: string;
  schedule: string;
  room?: string;
  academicYear: string;
  createdAt: string;
  stats: {
    totalStudents: number;
    activeStudents: number;
    averageProgress: number;
    averageScore: number;
    completedLessons: number;
    upcomingLessons: number;
  };
  students: Student[];
  recentActivity?: {
    date: string;
    type: string;
    count: number;
  }[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt: string;
  status: "active" | "inactive";
}

export default function ClassManagementPage() {
  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockClasses: Class[] = [
        {
          id: "1",
          name: "Grade 5A - Mathematics",
          grade: 5,
          subject: "Mathematics",
          schedule: "Mon, Wed, Fri - 8:00 AM",
          room: "Room 201",
          academicYear: "2024-2025",
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            totalStudents: 28,
            activeStudents: 25,
            averageProgress: 72,
            averageScore: 85,
            completedLessons: 15,
            upcomingLessons: 5,
          },
          students: generateMockStudents(28),
          recentActivity: generateRecentActivity(),
        },
        {
          id: "2",
          name: "Grade 5B - Science",
          grade: 5,
          subject: "Science",
          schedule: "Tue, Thu - 10:00 AM",
          room: "Lab 1",
          academicYear: "2024-2025",
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            totalStudents: 26,
            activeStudents: 24,
            averageProgress: 68,
            averageScore: 82,
            completedLessons: 12,
            upcomingLessons: 8,
          },
          students: generateMockStudents(26),
          recentActivity: generateRecentActivity(),
        },
        {
          id: "3",
          name: "Grade 6A - English",
          grade: 6,
          subject: "English",
          schedule: "Mon, Wed, Fri - 2:00 PM",
          room: "Room 305",
          academicYear: "2024-2025",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          stats: {
            totalStudents: 30,
            activeStudents: 28,
            averageProgress: 65,
            averageScore: 78,
            completedLessons: 10,
            upcomingLessons: 10,
          },
          students: generateMockStudents(30),
          recentActivity: generateRecentActivity(),
        },
      ];

      setClasses(mockClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async () => {
    if (!newClassName || !newClassGrade) {
      toast({
        title: "Missing Information",
        description: "Please provide class name and grade",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call would go here
      console.log("Creating class:", { newClassName, newClassGrade, newClassSubject });
      
      toast({
        title: "Class Created",
        description: `${newClassName} has been created successfully`,
      });
      
      setIsCreateDialogOpen(false);
      setNewClassName("");
      setNewClassGrade("");
      setNewClassSubject("");
      
      // Refresh classes
      await fetchClasses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addStudentToClass = async (classId: string) => {
    if (!studentEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide student email",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call would go here
      console.log("Adding student:", studentEmail, "to class:", classId);
      
      toast({
        title: "Student Added",
        description: `Student has been added to the class`,
      });
      
      setIsAddStudentDialogOpen(false);
      setStudentEmail("");
      
      // Refresh classes
      await fetchClasses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteClass = async (classId: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      try {
        // API call would go here
        console.log("Deleting class:", classId);
        
        toast({
          title: "Class Deleted",
          description: "The class has been deleted successfully",
        });
        
        // Refresh classes
        await fetchClasses();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete class. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <ClassManagementSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <BilingualHeading
            en="Class Management"
            km="ការគ្រប់គ្រងថ្នាក់"
            level={1}
            className="mb-2"
          />
          <BilingualText
            en="Manage your classes and student enrollments"
            km="គ្រប់គ្រងថ្នាក់រៀន និងការចុះឈ្មោះសិស្សរបស់អ្នក"
            className="text-lg text-muted-foreground"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              <BilingualText en="Create Class" km="បង្កើតថ្នាក់" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <BilingualText en="Create New Class" km="បង្កើតថ្នាក់ថ្មី" />
              </DialogTitle>
              <DialogDescription>
                <BilingualText
                  en="Enter the details for your new class"
                  km="បញ្ចូលព័ត៌មានលម្អិតសម្រាប់ថ្នាក់ថ្មីរបស់អ្នក"
                />
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="className">
                  <BilingualText en="Class Name" km="ឈ្មោះថ្នាក់" />
                </Label>
                <Input
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder={isKhmer ? "ឧទាហរណ៍៖ ថ្នាក់ទី៥ក" : "e.g., Grade 5A"}
                />
              </div>
              <div>
                <Label htmlFor="grade">
                  <BilingualText en="Grade Level" km="កម្រិតថ្នាក់" />
                </Label>
                <Select value={newClassGrade} onValueChange={setNewClassGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder={isKhmer ? "ជ្រើសរើសថ្នាក់" : "Select grade"} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        <FormattedNumber value={grade} type="grade" />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">
                  <BilingualText en="Subject (Optional)" km="មុខវិជ្ជា (ស្រេចចិត្ត)" />
                </Label>
                <Input
                  id="subject"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  placeholder={isKhmer ? "ឧទាហរណ៍៖ គណិតវិទ្យា" : "e.g., Mathematics"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <BilingualText en="Cancel" km="បោះបង់" />
              </Button>
              <Button onClick={createClass}>
                <BilingualText en="Create Class" km="បង្កើតថ្នាក់" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{cls.name}</CardTitle>
                  <CardDescription>
                    {cls.schedule} • {cls.room}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <FormattedNumber value={cls.grade} type="grade" />
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText en="Students" km="សិស្ស" />
                  </p>
                  <p className="text-xl font-semibold">
                    <FormattedNumber value={cls.stats.totalStudents} />
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText en="Active" km="សកម្ម" />
                  </p>
                  <p className="text-xl font-semibold">
                    <FormattedNumber value={cls.stats.activeStudents} />
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText en="Avg Progress" km="វឌ្ឍនភាពមធ្យម" />
                  </p>
                  <p className="text-xl font-semibold">
                    <FormattedNumber value={cls.stats.averageProgress} type="percentage" />
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <BilingualText en="Avg Score" km="ពិន្ទុមធ្យម" />
                  </p>
                  <p className="text-xl font-semibold">
                    <FormattedNumber value={cls.stats.averageScore} type="percentage" />
                  </p>
                </div>
              </div>

              <Progress value={cls.stats.averageProgress} className="h-2" />

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedClass(cls)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <BilingualText en="Manage" km="គ្រប់គ្រង" />
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/teacher/classes/${cls.id}`)}
                >
                  <BilingualText en="View Details" km="មើលព័ត៌មានលម្អិត" />
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Management Dialog */}
      {selectedClass && (
        <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedClass.name}</DialogTitle>
              <DialogDescription>
                <BilingualText
                  en="Manage students and class settings"
                  km="គ្រប់គ្រងសិស្ស និងការកំណត់ថ្នាក់"
                />
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="students" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="students">
                  <BilingualText en="Students" km="សិស្ស" />
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <BilingualText en="Activity" km="សកម្មភាព" />
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <BilingualText en="Settings" km="ការកំណត់" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    <FormattedNumber value={selectedClass.stats.totalStudents} />{" "}
                    <BilingualText en="students enrolled" km="សិស្សបានចុះឈ្មោះ" />
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsAddStudentDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    <BilingualText en="Add Student" km="បន្ថែមសិស្ស" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedClass.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {student.status === "active" ? (
                          <BilingualText en="Active" km="សកម្ម" />
                        ) : (
                          <BilingualText en="Inactive" km="អសកម្ម" />
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <BilingualText en="Recent class activity" km="សកម្មភាពថ្នាក់ថ្មីៗ" />
                </p>
                <div className="space-y-2">
                  {selectedClass.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          <FormattedNumber value={activity.count} /> {activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <FormattedDate date={activity.date} format="relative" />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>
                      <BilingualText en="Class Schedule" km="កាលវិភាគថ្នាក់" />
                    </Label>
                    <Input value={selectedClass.schedule} readOnly />
                  </div>
                  <div>
                    <Label>
                      <BilingualText en="Room" km="បន្ទប់" />
                    </Label>
                    <Input value={selectedClass.room} readOnly />
                  </div>
                  <div>
                    <Label>
                      <BilingualText en="Academic Year" km="ឆ្នាំសិក្សា" />
                    </Label>
                    <Input value={selectedClass.academicYear} readOnly />
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      <BilingualText en="Export Data" km="នាំចេញទិន្នន័យ" />
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteClass(selectedClass.id);
                        setSelectedClass(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <BilingualText en="Delete Class" km="លុបថ្នាក់" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <BilingualText en="Add Student to Class" km="បន្ថែមសិស្សទៅថ្នាក់" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentEmail">
                <BilingualText en="Student Email" km="អ៊ីមែលសិស្ស" />
              </Label>
              <Input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder={isKhmer ? "បញ្ចូលអ៊ីមែលសិស្ស" : "Enter student email"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
              <BilingualText en="Cancel" km="បោះបង់" />
            </Button>
            <Button onClick={() => selectedClass && addStudentToClass(selectedClass.id)}>
              <BilingualText en="Add Student" km="បន្ថែមសិស្ស" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassManagementSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-6 w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

function generateMockStudents(count: number): Student[] {
  const firstNames = ["Sophea", "Dara", "Sokha", "Pisey", "Vanna", "Srey", "Bopha", "Ratha"];
  const lastNames = ["Kim", "Chen", "Nguyen", "Sok", "Chan", "Lee", "Touch", "Heng"];

  return Array.from({ length: count }, (_, i) => ({
    id: `student-${i + 1}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`,
    email: `student${i + 1}@school.edu`,
    avatar: `https://ui-avatars.com/api/?name=Student+${i + 1}&background=random`,
    enrolledAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.1 ? "active" : "inactive",
  }));
}

function generateRecentActivity() {
  const activities = [
    { type: "lessons completed", count: Math.floor(Math.random() * 10) + 5 },
    { type: "exercises submitted", count: Math.floor(Math.random() * 50) + 20 },
    { type: "assessments taken", count: Math.floor(Math.random() * 5) + 1 },
  ];

  return activities.map((activity, i) => ({
    ...activity,
    date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}