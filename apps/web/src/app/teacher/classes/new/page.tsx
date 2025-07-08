"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Clock, MapPin } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

export default function CreateClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subjectId: "",
    grade: "",
    maxStudents: "30",
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:00",
        room: "",
      },
    ]);
  };

  const updateSchedule = (index: number, field: keyof Schedule, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxStudents: parseInt(formData.maxStudents),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          schedules,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/teacher/classes/${data.class.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create class");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Class</h1>
        <p className="text-gray-600">
          Set up a new class for your students
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mathematics 7A"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subjectId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grade Level *</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) =>
                      setFormData({ ...formData, grade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxStudents">Maximum Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStudents: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this class will cover..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Class Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) =>
                          startDate ? date < startDate : false
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Schedule</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSchedule}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No schedule added yet. Click "Add Schedule" to set class times.
                </p>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Schedule {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSchedule(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Day of Week</Label>
                          <Select
                            value={schedule.dayOfWeek.toString()}
                            onValueChange={(value) =>
                              updateSchedule(index, "dayOfWeek", parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem
                                  key={day.value}
                                  value={day.value.toString()}
                                >
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Room/Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="e.g., Room 201"
                              value={schedule.room}
                              onChange={(e) =>
                                updateSchedule(index, "room", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Start Time</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) =>
                                updateSchedule(index, "startTime", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) =>
                                updateSchedule(index, "endTime", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teacher/classes")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}