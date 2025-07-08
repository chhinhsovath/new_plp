"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  Image,
  Music,
  FileText,
  Settings,
  CheckSquare,
  ToggleLeft,
  Grid3x3,
  Link2,
  Shuffle,
  Headphones,
  PenTool,
  Type,
  ListOrdered,
} from "lucide-react";

const exerciseTypes = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: CheckSquare },
  { value: "TRUE_FALSE", label: "True/False", icon: ToggleLeft },
  { value: "FILL_IN_GAPS", label: "Fill in the Gaps", icon: Type },
  { value: "DRAG_DROP", label: "Drag & Drop", icon: Grid3x3 },
  { value: "MATCHING", label: "Matching", icon: Link2 },
  { value: "SORTING", label: "Sorting", icon: ListOrdered },
  { value: "SHORT_ANSWER", label: "Short Answer", icon: PenTool },
  { value: "LONG_ANSWER", label: "Essay", icon: FileText },
  { value: "LISTENING", label: "Listening", icon: Headphones },
  { value: "DRAWING", label: "Drawing", icon: PenTool },
];

export default function ExerciseBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exerciseType, setExerciseType] = useState("MULTIPLE_CHOICE");
  const [preview, setPreview] = useState(false);
  
  // Basic exercise data
  const [exerciseData, setExerciseData] = useState({
    title: "",
    titleKh: "",
    instructions: "",
    instructionsKh: "",
    points: 10,
    difficulty: "MEDIUM",
    lessonId: "",
    subjectId: "",
  });

  // Exercise content based on type
  const [content, setContent] = useState<any>({
    question: "",
    questionKh: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  // File attachments
  const [attachments, setAttachments] = useState<any[]>([]);

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("purpose", "exercise");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    setAttachments(prev => [...prev, ...data.files]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...exerciseData,
          type: exerciseType,
          content,
          attachments: attachments.map(a => a.id),
        }),
      });

      if (response.ok) {
        const exercise = await response.json();
        router.push(`/admin/exercises/${exercise.id}`);
      }
    } catch (error) {
      console.error("Error saving exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderExerciseBuilder = () => {
    switch (exerciseType) {
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Textarea
                value={content.question}
                onChange={(e) => setContent({ ...content, question: e.target.value })}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>
            <div>
              <Label>Question (Khmer)</Label>
              <Textarea
                value={content.questionKh}
                onChange={(e) => setContent({ ...content, questionKh: e.target.value })}
                placeholder="សំណួររបស់អ្នក..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              {content.options.map((option: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...content.options];
                      newOptions[index] = e.target.value;
                      setContent({ ...content, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant={content.correctAnswer === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContent({ ...content, correctAnswer: index })}
                  >
                    Correct
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContent({ ...content, options: [...content.options, ""] })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
          </div>
        );

      case "TRUE_FALSE":
        return (
          <div className="space-y-4">
            <div>
              <Label>Statement</Label>
              <Textarea
                value={content.statement || ""}
                onChange={(e) => setContent({ ...content, statement: e.target.value })}
                placeholder="Enter your statement..."
                rows={3}
              />
            </div>
            <div>
              <Label>Statement (Khmer)</Label>
              <Textarea
                value={content.statementKh || ""}
                onChange={(e) => setContent({ ...content, statementKh: e.target.value })}
                placeholder="សេចក្តីថ្លែងការណ៍របស់អ្នក..."
                rows={3}
              />
            </div>
            <div>
              <Label>Correct Answer</Label>
              <Select
                value={content.isTrue?.toString() || "true"}
                onValueChange={(value) => setContent({ ...content, isTrue: value === "true" })}
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
            <div>
              <Label>Explanation (optional)</Label>
              <Textarea
                value={content.explanation || ""}
                onChange={(e) => setContent({ ...content, explanation: e.target.value })}
                placeholder="Explain why this is true/false..."
                rows={2}
              />
            </div>
          </div>
        );

      case "SHORT_ANSWER":
        return (
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Textarea
                value={content.question || ""}
                onChange={(e) => setContent({ ...content, question: e.target.value })}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>
            <div>
              <Label>Acceptable Answers</Label>
              <div className="space-y-2">
                {(content.acceptableAnswers || [""]).map((answer: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...(content.acceptableAnswers || [])];
                        newAnswers[index] = e.target.value;
                        setContent({ ...content, acceptableAnswers: newAnswers });
                      }}
                      placeholder={`Acceptable answer ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newAnswers = content.acceptableAnswers.filter((_: any, i: number) => i !== index);
                        setContent({ ...content, acceptableAnswers: newAnswers });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent({ 
                    ...content, 
                    acceptableAnswers: [...(content.acceptableAnswers || []), ""] 
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Answer
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="caseSensitive"
                checked={content.caseSensitive || false}
                onChange={(e) => setContent({ ...content, caseSensitive: e.target.checked })}
              />
              <Label htmlFor="caseSensitive">Case sensitive</Label>
            </div>
          </div>
        );

      case "LISTENING":
        return (
          <div className="space-y-4">
            <div>
              <Label>Audio File</Label>
              <FileUpload
                accept={["audio/*"]}
                maxFiles={1}
                onUpload={handleFileUpload}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Question</Label>
              <Textarea
                value={content.question || ""}
                onChange={(e) => setContent({ ...content, question: e.target.value })}
                placeholder="What should students answer after listening?"
                rows={3}
              />
            </div>
            <div>
              <Label>Transcript (for teachers)</Label>
              <Textarea
                value={content.transcript || ""}
                onChange={(e) => setContent({ ...content, transcript: e.target.value })}
                placeholder="Full transcript of the audio..."
                rows={5}
              />
            </div>
          </div>
        );

      default:
        return (
          <Alert>
            <AlertDescription>
              Exercise builder for {exerciseType} is coming soon!
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exercise Builder</h1>
        <p className="text-gray-600">
          Create interactive exercises for your lessons
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Type Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Exercise Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exerciseTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setExerciseType(type.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      exerciseType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Builder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercise Details</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreview(!preview)}>
                  <Eye className="w-4 h-4 mr-1" />
                  {preview ? "Edit" : "Preview"}
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-1" />
                  {loading ? "Saving..." : "Save Exercise"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {renderExerciseBuilder()}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title (English)</Label>
                    <Input
                      id="title"
                      value={exerciseData.title}
                      onChange={(e) => setExerciseData({ ...exerciseData, title: e.target.value })}
                      placeholder="Exercise title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleKh">Title (Khmer)</Label>
                    <Input
                      id="titleKh"
                      value={exerciseData.titleKh}
                      onChange={(e) => setExerciseData({ ...exerciseData, titleKh: e.target.value })}
                      placeholder="ចំណងជើង..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={exerciseData.instructions}
                    onChange={(e) => setExerciseData({ ...exerciseData, instructions: e.target.value })}
                    placeholder="Instructions for students..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={exerciseData.points}
                      onChange={(e) => setExerciseData({ ...exerciseData, points: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={exerciseData.difficulty}
                      onValueChange={(value) => setExerciseData({ ...exerciseData, difficulty: value })}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label>Attachments</Label>
                  <FileUpload
                    accept={["image/*", "audio/*", "video/*", "application/pdf"]}
                    maxFiles={5}
                    onUpload={handleFileUpload}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Add images, audio, video, or PDF files to enhance your exercise
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.fileName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}