"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  Plus,
  Edit,
  Trash,
  Video,
  Download,
  Mail,
  Search,
  UserPlus,
  ClipboardList,
  BarChart3,
} from "lucide-react";

interface Student {
  id: string;
  enrollment: {
    id: string;
    enrolledAt: string;
    status: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  submissions: {
    id: string;
    assignmentId: string;
    score: number | null;
    graded: boolean;
  }[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  _count: {
    submissions: number;
  };
}

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  grade: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  status: string;
  _count: {
    enrollments: number;
    assignments: number;
  };
  schedules: Schedule[];
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "assignments") {
      fetchAssignments();
    }
  }, [activeTab, classId]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassDetails(data.class);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleAddStudent = async () => {
    if (!studentEmail) return;
    
    setAddingStudent(true);
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentEmail }),
      });

      if (response.ok) {
        setShowAddStudentDialog(false);
        setStudentEmail("");
        fetchStudents();
        fetchClassDetails(); // Update enrollment count
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student");
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) return;

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students/${enrollmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchStudents();
        fetchClassDetails(); // Update enrollment count
      }
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      case "UPCOMING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading class details...</p>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Class not found</p>
      </div>
    );
  }

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{classDetails.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{classDetails.subject.name}</span>
              <span>•</span>
              <span>{classDetails.grade}</span>
              <span>•</span>
              <Badge className={getStatusColor(classDetails.status)}>
                {classDetails.status.toLowerCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/teacher/classes/${classId}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Class
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/teacher/live/${classId}`}>
                <Video className="w-4 h-4 mr-2" />
                Start Live Session
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">
            Students ({classDetails._count.enrollments})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments ({classDetails._count.assignments})
          </TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classDetails._count.enrollments} / {classDetails.maxStudents}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {classDetails.maxStudents - classDetails._count.enrollments} spots available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classDetails._count.assignments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Duration</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{new Date(classDetails.startDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">to</p>
                  <p>{new Date(classDetails.endDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Class Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {classDetails.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/teacher/assignments/new?classId=${classId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/teacher/grades?classId=${classId}`}>
                    <Award className="w-4 h-4 mr-2" />
                    View Gradebook
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => setShowAddStudentDialog(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                <Button variant="outline" className="justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Class
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Roster</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[250px]"
                    />
                  </div>
                  <Button onClick={() => setShowAddStudentDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Average Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const gradedSubmissions = student.submissions.filter(s => s.graded && s.score !== null);
                    const avgGrade = gradedSubmissions.length > 0
                      ? (gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length).toFixed(1)
                      : "N/A";
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {new Date(student.enrollment.enrolledAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{student.submissions.length}</TableCell>
                        <TableCell>{avgGrade}%</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/teacher/students/${student.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.enrollment.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Assignments</CardTitle>
                <Button asChild>
                  <Link href={`/teacher/assignments/new?classId=${classId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.title}
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{assignment.totalPoints}</TableCell>
                      <TableCell>
                        {assignment._count.submissions} / {classDetails._count.enrollments}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/teacher/assignments/${assignment.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/teacher/assignments/${assignment.id}/grade`}>
                              Grade
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {classDetails.schedules.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No schedule set for this class
                </p>
              ) : (
                <div className="space-y-4">
                  {classDetails.schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{DAYS_OF_WEEK[schedule.dayOfWeek]}</p>
                        <p className="text-sm text-gray-600">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {schedule.room}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Performance analytics coming soon
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Attendance tracking coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student to Class</DialogTitle>
            <DialogDescription>
              Enter the student's email address to add them to this class.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="student@example.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddStudentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={addingStudent}>
              {addingStudent ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}