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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Award,
  Search,
  Filter,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
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
  submission?: {
    id: string;
    submittedAt: string;
    score: number | null;
    graded: boolean;
  };
  _count: {
    exercises: number;
    resources: number;
  };
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, classFilter, statusFilter]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/student/assignments");
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
          assignment.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.class.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter((assignment) => assignment.class.id === classFilter);
    }

    // Status filter
    const now = new Date();
    switch (statusFilter) {
      case "pending":
        filtered = filtered.filter(
          (assignment) => !assignment.submission && !isPast(new Date(assignment.dueDate))
        );
        break;
      case "overdue":
        filtered = filtered.filter(
          (assignment) => !assignment.submission && isPast(new Date(assignment.dueDate))
        );
        break;
      case "submitted":
        filtered = filtered.filter((assignment) => assignment.submission && !assignment.submission.graded);
        break;
      case "graded":
        filtered = filtered.filter((assignment) => assignment.submission?.graded);
        break;
    }

    setFilteredAssignments(filtered);
  };

  const getUniqueClasses = () => {
    const classMap = new Map();
    assignments.forEach((assignment) => {
      classMap.set(assignment.class.id, assignment.class);
    });
    return Array.from(classMap.values());
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission) {
      if (assignment.submission.graded) {
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Graded
          </Badge>
        );
      }
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      );
    }

    const dueDate = new Date(assignment.dueDate);
    if (isPast(dueDate)) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getDueDateText = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isPast(date)) {
      return `Overdue by ${formatDistanceToNow(date)}`;
    }
    
    if (isToday(date)) {
      return `Due today at ${format(date, "h:mm a")}`;
    }
    
    if (isTomorrow(date)) {
      return `Due tomorrow at ${format(date, "h:mm a")}`;
    }
    
    return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
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

  const stats = {
    pending: assignments.filter(a => !a.submission && !isPast(new Date(a.dueDate))).length,
    overdue: assignments.filter(a => !a.submission && isPast(new Date(a.dueDate))).length,
    submitted: assignments.filter(a => a.submission && !a.submission.graded).length,
    graded: assignments.filter(a => a.submission?.graded).length,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
        <p className="text-gray-600">
          View and submit your assignments across all classes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter("pending")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Assignments to complete
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter("overdue")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter("submitted")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting grades
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter("graded")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graded}</div>
            <p className="text-xs text-muted-foreground">
              View your scores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
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
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-gray-500">
              {searchTerm || classFilter !== "all"
                ? "No assignments found matching your filters"
                : `No ${statusFilter} assignments`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
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

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className={cn(
                        isPast(new Date(assignment.dueDate)) && !assignment.submission && "text-red-600 font-medium"
                      )}>
                        {getDueDateText(assignment.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>
                        {assignment._count.exercises} exercises
                        {assignment._count.resources > 0 && (
                          <> • {assignment._count.resources} resources</>
                        )}
                      </span>
                    </div>
                    {assignment.submission && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">
                          Submitted {format(new Date(assignment.submission.submittedAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    )}
                    {assignment.submission?.graded && assignment.submission.score !== null && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-medium">
                          Score: {assignment.submission.score}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {assignment.submission ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/assignments/${assignment.id}/submission`}>
                          View Submission
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant={isPast(new Date(assignment.dueDate)) ? "destructive" : "default"}
                        asChild
                      >
                        <Link href={`/assignments/${assignment.id}`}>
                          {isPast(new Date(assignment.dueDate)) ? "Submit Late" : "Start Assignment"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}