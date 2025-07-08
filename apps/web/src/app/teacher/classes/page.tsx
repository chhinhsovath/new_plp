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
  Users, 
  BookOpen, 
  Calendar,
  Search,
  Filter,
  Edit,
  Archive,
  Eye,
} from "lucide-react";

interface Class {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  subject: {
    id: string;
    name: string;
  };
  grade: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "ARCHIVED" | "UPCOMING";
  _count: {
    enrollments: number;
    assignments: number;
    schedules: number;
  };
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, statusFilter, gradeFilter]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cls) =>
          cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((cls) => cls.status === statusFilter);
    }

    // Grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter((cls) => cls.grade === gradeFilter);
    }

    setFilteredClasses(filtered);
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

  const getUniqueGrades = () => {
    const grades = new Set(classes.map((cls) => cls.grade));
    return Array.from(grades).sort();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Classes</h1>
            <p className="text-gray-600">
              Manage your classes and track student progress
            </p>
          </div>
          <Button asChild>
            <Link href="/teacher/classes/new">
              <Plus className="w-4 h-4 mr-2" />
              Create New Class
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {getUniqueGrades().map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || gradeFilter !== "all"
                ? "No classes found matching your filters"
                : "You haven't created any classes yet"}
            </p>
            {!searchTerm && statusFilter === "all" && gradeFilter === "all" && (
              <Button asChild>
                <Link href="/teacher/classes/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Class
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{cls.name}</CardTitle>
                    <p className="text-sm text-gray-600">{cls.subject.name}</p>
                  </div>
                  <Badge className={getStatusColor(cls.status)}>
                    {cls.status.toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {cls.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{cls._count.enrollments} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{cls._count.assignments} assignments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{cls._count.schedules} sessions/week</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Grade {cls.grade}</span>
                  <span>•</span>
                  <span>
                    {new Date(cls.startDate).toLocaleDateString()} - 
                    {new Date(cls.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/teacher/classes/${cls.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/teacher/classes/${cls.id}/edit`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}