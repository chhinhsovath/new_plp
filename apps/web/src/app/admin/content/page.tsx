"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  FileText,
  Filter,
  MoreVertical,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  nameKh: string;
  description: string;
  gradeLevel: string;
  lessonsCount: number;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  titleKh: string;
  subjectId: string;
  subjectName: string;
  orderIndex: number;
  exercisesCount: number;
  createdAt: string;
}

export default function ContentManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTab, setActiveTab] = useState("subjects");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [subjectsRes, lessonsRes] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/lessons"),
      ]);

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData.lessons || []);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          nameKh: formData.get("nameKh"),
          description: formData.get("description"),
          gradeLevel: formData.get("gradeLevel"),
        }),
      });

      if (response.ok) {
        setShowCreateSubject(false);
        fetchContent();
      }
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          titleKh: formData.get("titleKh"),
          subjectId: formData.get("subjectId"),
          content: formData.get("content"),
          orderIndex: parseInt(formData.get("orderIndex") as string),
        }),
      });

      if (response.ok) {
        setShowCreateLesson(false);
        fetchContent();
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      const response = await fetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchContent();
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchContent();
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const gradeLevels = [
    { value: "PRIMARY", label: "Primary School" },
    { value: "MIDDLE", label: "Middle School" },
    { value: "HIGH", label: "High School" },
  ];

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subject.nameKh.includes(searchQuery);
    const matchesGrade = selectedGrade === "all" || subject.gradeLevel === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.titleKh.includes(searchQuery);
    const matchesSubject = selectedSubject === "all" || lesson.subjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Management</h1>
        <p className="text-gray-600">
          Manage subjects, lessons, and exercises
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subjects</CardTitle>
                <Dialog open={showCreateSubject} onOpenChange={setShowCreateSubject}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Subject</DialogTitle>
                      <DialogDescription>
                        Add a new subject to the platform
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubject} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Subject Name (English)</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div>
                        <Label htmlFor="nameKh">Subject Name (Khmer)</Label>
                        <Input id="nameKh" name="nameKh" required />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" rows={3} />
                      </div>
                      <div>
                        <Label htmlFor="gradeLevel">Grade Level</Label>
                        <Select name="gradeLevel" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeLevels.map(grade => (
                              <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowCreateSubject(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Subject</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All grades</SelectItem>
                    {gradeLevels.map(grade => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subjects Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-gray-600">{subject.nameKh}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {gradeLevels.find(g => g.value === subject.gradeLevel)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{subject.lessonsCount} lessons</TableCell>
                      <TableCell>{new Date(subject.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lessons</CardTitle>
                <Dialog open={showCreateLesson} onOpenChange={setShowCreateLesson}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Lesson</DialogTitle>
                      <DialogDescription>
                        Add a new lesson to a subject
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateLesson} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Lesson Title (English)</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="titleKh">Lesson Title (Khmer)</Label>
                        <Input id="titleKh" name="titleKh" required />
                      </div>
                      <div>
                        <Label htmlFor="subjectId">Subject</Label>
                        <Select name="subjectId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map(subject => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" name="content" rows={4} />
                      </div>
                      <div>
                        <Label htmlFor="orderIndex">Order</Label>
                        <Input id="orderIndex" name="orderIndex" type="number" defaultValue="1" required />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowCreateLesson(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Lesson</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lessons Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exercises</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-gray-600">{lesson.titleKh}</p>
                        </div>
                      </TableCell>
                      <TableCell>{lesson.subjectName}</TableCell>
                      <TableCell>{lesson.exercisesCount} exercises</TableCell>
                      <TableCell>#{lesson.orderIndex}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Exercises Tab */}
        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Exercise management coming soon</p>
                <p className="text-sm mt-2">
                  Create and manage different types of exercises for lessons
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}