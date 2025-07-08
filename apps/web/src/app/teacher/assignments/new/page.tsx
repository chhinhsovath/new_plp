"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Plus, 
  X, 
  Save,
  FileText,
  Link2,
  Upload,
  Trash,
} from "lucide-react";
import { exerciseComponents } from "@/components/exercises";

interface Class {
  id: string;
  name: string;
  subject: {
    id: string;
    name: string;
  };
}

interface Exercise {
  id: string;
  type: string;
  question: string;
  points: number;
  data: any;
}

interface Resource {
  id: string;
  type: "file" | "link";
  name: string;
  url: string;
}

const ASSIGNMENT_TYPES = [
  { value: "HOMEWORK", label: "Homework" },
  { value: "QUIZ", label: "Quiz" },
  { value: "EXAM", label: "Exam" },
  { value: "PROJECT", label: "Project" },
  { value: "PRACTICE", label: "Practice" },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClassId = searchParams.get("classId");
  
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: preselectedClassId || "",
    type: "HOMEWORK",
    instructions: "",
  });
  const [dueDate, setDueDate] = useState<Date>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      type: "MULTIPLE_CHOICE",
      question: "",
      points: 10,
      data: {
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    };
    setExercises([...exercises, newExercise]);
    setActiveTab("exercises");
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleResourceUpload = async (files: File[]) => {
    // In a real implementation, upload files to storage
    // For now, create mock resources
    const newResources = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      type: "file" as const,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setResources([...resources, ...newResources]);
  };

  const addResourceLink = () => {
    const url = prompt("Enter resource URL:");
    if (url) {
      const name = prompt("Enter resource name:") || "Resource Link";
      setResources([...resources, {
        id: Date.now().toString(),
        type: "link",
        name,
        url,
      }]);
    }
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const calculateTotalPoints = () => {
    return exercises.reduce((sum, ex) => sum + ex.points, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dueDate) {
      alert("Please select a due date");
      return;
    }

    if (exercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: dueDate.toISOString(),
          totalPoints: calculateTotalPoints(),
          exercises: exercises.map(({ id, ...ex }) => ex),
          resources: resources.map(({ id, ...r }) => r),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/teacher/assignments/${data.assignment.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Assignment</h1>
        <p className="text-gray-600">
          Build an assignment with exercises and resources for your students
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="exercises">
              Exercises ({exercises.length})
            </TabsTrigger>
            <TabsTrigger value="resources">
              Resources ({resources.length})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Chapter 5 Homework"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, classId: value })
                      }
                    >
                      <SelectTrigger>
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
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Assignment Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the assignment..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Detailed instructions for students..."
                    rows={5}
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Exercises</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Points: {calculateTotalPoints()}
                    </p>
                  </div>
                  <Button type="button" onClick={addExercise}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {exercises.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No exercises added yet</p>
                    <p className="text-sm mt-2">
                      Click "Add Exercise" to start building your assignment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {exercises.map((exercise, index) => (
                      <Card key={exercise.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Question {index + 1}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={exercise.points}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    points: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-20"
                              />
                              <span className="text-sm text-gray-600">points</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(exercise.id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Exercise Type</Label>
                            <Select
                              value={exercise.type}
                              onValueChange={(value) =>
                                updateExercise(exercise.id, {
                                  type: value,
                                  data: getDefaultDataForType(value),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(exerciseComponents).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace(/_/g, " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Question</Label>
                            <Textarea
                              placeholder="Enter your question..."
                              value={exercise.question}
                              onChange={(e) =>
                                updateExercise(exercise.id, {
                                  question: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>

                          {/* Exercise-specific configuration */}
                          {renderExerciseConfig(exercise, (data) =>
                            updateExercise(exercise.id, { data })
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resources & Materials</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addResourceLink}
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Upload Files</Label>
                    <FileUpload
                      onUpload={handleResourceUpload}
                      accept="*/*"
                      maxSize={10 * 1024 * 1024} // 10MB
                      multiple
                    />
                  </div>

                  {resources.length > 0 && (
                    <div className="space-y-2">
                      <Label>Attached Resources</Label>
                      <div className="space-y-2">
                        {resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {resource.type === "file" ? (
                                <FileText className="w-5 h-5 text-gray-600" />
                              ) : (
                                <Link2 className="w-5 h-5 text-gray-600" />
                              )}
                              <div>
                                <p className="font-medium">{resource.name}</p>
                                {resource.type === "link" && (
                                  <p className="text-xs text-gray-500">
                                    {resource.url}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(resource.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/teacher/assignments")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Assignment"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Helper functions
function getDefaultDataForType(type: string): any {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return { options: ["", "", "", ""], correctAnswer: 0 };
    case "TRUE_FALSE":
      return { correctAnswer: true };
    case "FILL_IN_GAPS":
      return { text: "", gaps: [] };
    case "SHORT_ANSWER":
      return { correctAnswer: "" };
    case "LONG_ANSWER":
      return { sampleAnswer: "", rubric: "" };
    case "MATCHING":
      return { pairs: [] };
    case "DRAG_DROP":
      return { items: [], targets: [] };
    default:
      return {};
  }
}

function renderExerciseConfig(exercise: Exercise, updateData: (data: any) => void) {
  const { type, data } = exercise;

  switch (type) {
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-3">
          <Label>Options</Label>
          {data.options.map((option: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...data.options];
                  newOptions[index] = e.target.value;
                  updateData({ ...data, options: newOptions });
                }}
              />
              <input
                type="radio"
                name={`correct-${exercise.id}`}
                checked={data.correctAnswer === index}
                onChange={() => updateData({ ...data, correctAnswer: index })}
              />
            </div>
          ))}
        </div>
      );

    case "TRUE_FALSE":
      return (
        <div>
          <Label>Correct Answer</Label>
          <Select
            value={data.correctAnswer.toString()}
            onValueChange={(value) =>
              updateData({ ...data, correctAnswer: value === "true" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case "SHORT_ANSWER":
      return (
        <div>
          <Label>Correct Answer</Label>
          <Input
            placeholder="Enter the correct answer"
            value={data.correctAnswer || ""}
            onChange={(e) =>
              updateData({ ...data, correctAnswer: e.target.value })
            }
          />
        </div>
      );

    case "LONG_ANSWER":
      return (
        <div className="space-y-3">
          <div>
            <Label>Sample Answer (for teacher reference)</Label>
            <Textarea
              placeholder="Enter a sample answer..."
              value={data.sampleAnswer || ""}
              onChange={(e) =>
                updateData({ ...data, sampleAnswer: e.target.value })
              }
              rows={3}
            />
          </div>
          <div>
            <Label>Grading Rubric</Label>
            <Textarea
              placeholder="Enter grading criteria..."
              value={data.rubric || ""}
              onChange={(e) =>
                updateData({ ...data, rubric: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}