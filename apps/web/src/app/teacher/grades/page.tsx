"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download,
  Upload,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertCircle,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Class {
  id: string;
  name: string;
  subject: {
    name: string;
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Assignment {
  id: string;
  title: string;
  totalPoints: number;
  dueDate: string;
}

interface Grade {
  studentId: string;
  assignmentId: string;
  score: number | null;
  percentage: number | null;
  submittedAt: string | null;
  gradedAt: string | null;
}

interface GradebookData {
  class: Class;
  students: Student[];
  assignments: Assignment[];
  grades: { [key: string]: Grade };
}

export default function TeacherGradebookPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradebookData, setGradebookData] = useState<GradebookData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gradebook");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchGradebookData(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes);
        if (data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradebookData = async (classId: string) => {
    try {
      const response = await fetch(`/api/teacher/gradebook/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setGradebookData(data);
      }
    } catch (error) {
      console.error("Error fetching gradebook data:", error);
    }
  };

  const getGradeKey = (studentId: string, assignmentId: string) => {
    return `${studentId}-${assignmentId}`;
  };

  const getGrade = (studentId: string, assignmentId: string) => {
    if (!gradebookData) return null;
    return gradebookData.grades[getGradeKey(studentId, assignmentId)];
  };

  const calculateStudentAverage = (studentId: string) => {
    if (!gradebookData) return 0;
    
    const studentGrades = gradebookData.assignments
      .map(assignment => getGrade(studentId, assignment.id))
      .filter(grade => grade && grade.percentage !== null);
    
    if (studentGrades.length === 0) return 0;
    
    const sum = studentGrades.reduce((acc, grade) => acc + (grade?.percentage || 0), 0);
    return Math.round(sum / studentGrades.length);
  };

  const calculateAssignmentAverage = (assignmentId: string) => {
    if (!gradebookData) return 0;
    
    const assignmentGrades = gradebookData.students
      .map(student => getGrade(student.id, assignmentId))
      .filter(grade => grade && grade.percentage !== null);
    
    if (assignmentGrades.length === 0) return 0;
    
    const sum = assignmentGrades.reduce((acc, grade) => acc + (grade?.percentage || 0), 0);
    return Math.round(sum / assignmentGrades.length);
  };

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return "text-gray-400";
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (percentage: number | null) => {
    if (percentage === null) return "-";
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const exportGradebook = () => {
    // In real implementation, generate CSV/Excel file
    console.log("Exporting gradebook...");
  };

  const filteredStudents = gradebookData?.students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate class statistics
  const calculateClassStats = () => {
    if (!gradebookData) return null;

    const allGrades = gradebookData.students.flatMap(student =>
      gradebookData.assignments.map(assignment => getGrade(student.id, assignment.id))
    ).filter(grade => grade && grade.percentage !== null);

    if (allGrades.length === 0) return null;

    const percentages = allGrades.map(g => g?.percentage || 0);
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const sorted = [...percentages].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const gradeDistribution = {
      A: percentages.filter(p => p >= 90).length,
      B: percentages.filter(p => p >= 80 && p < 90).length,
      C: percentages.filter(p => p >= 70 && p < 80).length,
      D: percentages.filter(p => p >= 60 && p < 70).length,
      F: percentages.filter(p => p < 60).length,
    };

    return {
      average: Math.round(avg),
      median: Math.round(median),
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      gradeDistribution,
      totalGrades: allGrades.length,
    };
  };

  const stats = calculateClassStats();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-500">Loading gradebook...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gradebook</h1>
            <p className="text-gray-600">
              View and manage student grades across your classes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportGradebook}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Class Selection and Search */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {!selectedClassId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Select a class to view the gradebook</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="gradebook">
            {gradebookData && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
                            Student
                          </TableHead>
                          {gradebookData.assignments.map((assignment) => (
                            <TableHead key={assignment.id} className="text-center min-w-[120px]">
                              <div>
                                <p className="font-medium truncate max-w-[120px]">
                                  {assignment.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {assignment.totalPoints} pts
                                </p>
                                <p className="text-xs text-gray-500">
                                  Avg: {calculateAssignmentAverage(assignment.id)}%
                                </p>
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="text-center sticky right-0 bg-white">
                            Average
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          const average = calculateStudentAverage(student.id);
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="sticky left-0 bg-white font-medium">
                                <div>
                                  <p>{student.firstName} {student.lastName}</p>
                                  <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                              </TableCell>
                              {gradebookData.assignments.map((assignment) => {
                                const grade = getGrade(student.id, assignment.id);
                                
                                return (
                                  <TableCell key={assignment.id} className="text-center">
                                    {grade ? (
                                      <div className={cn("font-medium", getGradeColor(grade.percentage))}>
                                        {grade.percentage !== null ? (
                                          <>
                                            <p>{grade.percentage}%</p>
                                            <p className="text-xs">
                                              {grade.score}/{assignment.totalPoints}
                                            </p>
                                          </>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center sticky right-0 bg-white">
                                <div className={cn("font-bold", getGradeColor(average))}>
                                  <p>{average}%</p>
                                  <p className="text-sm">{getGradeLetter(average)}</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.average}%</div>
                      <p className="text-xs text-muted-foreground">
                        Grade: {getGradeLetter(stats.average)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Median Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.median}%</div>
                      <p className="text-xs text-muted-foreground">
                        Middle value
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                      <Award className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.highest}%</div>
                      <p className="text-xs text-muted-foreground">
                        Best performance
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats.lowest}%</div>
                      <p className="text-xs text-muted-foreground">
                        Needs attention
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Grade Distribution */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                      const percentage = (count / stats.totalGrades) * 100;
                      
                      return (
                        <div key={grade} className="flex items-center gap-4">
                          <div className="w-12 text-lg font-bold">{grade}</div>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-8 relative">
                              <div
                                className={cn(
                                  "h-8 rounded-full flex items-center justify-end px-3 text-white text-sm font-medium",
                                  grade === "A" && "bg-green-600",
                                  grade === "B" && "bg-blue-600",
                                  grade === "C" && "bg-yellow-600",
                                  grade === "D" && "bg-orange-600",
                                  grade === "F" && "bg-red-600"
                                )}
                                style={{ width: `${percentage}%` }}
                              >
                                {count}
                              </div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm text-gray-600">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Performance */}
            {gradebookData && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Student Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-center">Average</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                        <TableHead className="text-center">Assignments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const average = calculateStudentAverage(student.id);
                        const completedAssignments = gradebookData.assignments.filter(
                          assignment => getGrade(student.id, assignment.id)?.score !== null
                        ).length;
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn("font-bold", getGradeColor(average))}>
                                {average}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={cn(
                                average >= 90 && "bg-green-100 text-green-800",
                                average >= 80 && average < 90 && "bg-blue-100 text-blue-800",
                                average >= 70 && average < 80 && "bg-yellow-100 text-yellow-800",
                                average >= 60 && average < 70 && "bg-orange-100 text-orange-800",
                                average < 60 && "bg-red-100 text-red-800"
                              )}>
                                {getGradeLetter(average)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {average >= 80 ? (
                                <TrendingUp className="w-4 h-4 text-green-600 mx-auto" />
                              ) : average >= 60 ? (
                                <Minus className="w-4 h-4 text-yellow-600 mx-auto" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {completedAssignments} / {gradebookData.assignments.length}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Progress Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Generate detailed progress reports for individual students or the entire class.
                  </p>
                  <Button className="w-full">Generate Progress Reports</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    View detailed analytics and trends for student performance over time.
                  </p>
                  <Button className="w-full">View Analytics</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Honor Roll Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Generate honor roll lists based on grade criteria and attendance.
                  </p>
                  <Button className="w-full">Generate Honor Roll</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    At-Risk Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Identify students who need additional support based on their grades.
                  </p>
                  <Button className="w-full">View At-Risk Report</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}