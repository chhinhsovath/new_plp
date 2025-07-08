"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
  };
  dueDate: string;
  totalPoints: number;
  createdAt: string;
  _count: {
    submissions: number;
    exercises: number;
    resources: number;
  };
  classEnrollmentCount: number;
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, classFilter, typeFilter, statusFilter]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.class.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter((assignment) => assignment.class.id === classFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((assignment) => assignment.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = dueDate < now;
        const isFullySubmitted = assignment._count.submissions === assignment.classEnrollmentCount;
        
        switch (statusFilter) {
          case "active":
            return !isOverdue && !isFullySubmitted;
          case "overdue":
            return isOverdue && !isFullySubmitted;
          case "completed":
            return isFullySubmitted;
          default:
            return true;
        }
      });
    }

    setFilteredAssignments(filtered);
  };

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now;
    const submissionRate = assignment.classEnrollmentCount > 0
      ? (assignment._count.submissions / assignment.classEnrollmentCount) * 100
      : 0;

    if (submissionRate === 100) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
  };

  const getUniqueClasses = () => {
    const classMap = new Map();
    assignments.forEach((assignment) => {
      classMap.set(assignment.class.id, assignment.class);
    });
    return Array.from(classMap.values());
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "HOMEWORK": return "Homework";
      case "QUIZ": return "Quiz";
      case "EXAM": return "Exam";
      case "PROJECT": return "Project";
      case "PRACTICE": return "Practice";
      default: return type;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assignments</h1>
            <p className="text-gray-600">
              Manage assignments across all your classes
            </p>
          </div>
          <Button asChild>
            <Link href="/teacher/assignments/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {getUniqueClasses().map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="HOMEWORK">Homework</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="EXAM">Exam</SelectItem>
              <SelectItem value="PROJECT">Project</SelectItem>
              <SelectItem value="PRACTICE">Practice</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignments Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm || classFilter !== "all" || typeFilter !== "all" || statusFilter !== "all"
                ? "No assignments found matching your filters"
                : "You haven't created any assignments yet"}
            </p>
            {!searchTerm && classFilter === "all" && typeFilter === "all" && statusFilter === "all" && (
              <Button asChild>
                <Link href="/teacher/assignments/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Assignment
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const submissionRate = assignment.classEnrollmentCount > 0
              ? Math.round((assignment._count.submissions / assignment.classEnrollmentCount) * 100)
              : 0;
            
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {assignment.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {assignment.class.name} - {assignment.class.subject.name}
                      </p>
                    </div>
                    {getStatusBadge(assignment)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {assignment.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">
                        {getTypeLabel(assignment.type)}
                      </Badge>
                      <span className="text-gray-600">
                        {assignment.totalPoints} points
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {assignment._count.submissions} / {assignment.classEnrollmentCount} submitted
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{assignment._count.exercises} exercises</span>
                        {assignment._count.resources > 0 && (
                          <>
                            <span>•</span>
                            <span>{assignment._count.resources} resources</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Submission Progress</span>
                        <span>{submissionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            submissionRate === 100
                              ? "bg-green-600"
                              : submissionRate > 50
                              ? "bg-blue-600"
                              : "bg-yellow-600"
                          )}
                          style={{ width: `${submissionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/teacher/assignments/${assignment.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/teacher/assignments/${assignment.id}/grade`}>
                          Grade
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}