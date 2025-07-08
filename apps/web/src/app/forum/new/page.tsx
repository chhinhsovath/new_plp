"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, X, Plus, HelpCircle, Paperclip } from "lucide-react";

export default function NewForumPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.content || !formData.subject) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attachments: uploadedFiles.map(f => f.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create post");
        return;
      }

      const post = await response.json();
      router.push(`/forum/posts/${post.id}`);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("purpose", "forum");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    setUploadedFiles(prev => [...prev, ...data.files]);
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/forum" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Forum
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Get help from other students and teachers in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Question Title</Label>
              <Input
                id="title"
                placeholder="What's your question? Be specific."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <p className="text-sm text-gray-600">
                Write a clear title that summarizes your question
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khmer">Khmer</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Question Details</Label>
              <Textarea
                id="content"
                placeholder="Provide more details about your question. What have you tried? Where are you stuck?"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
              />
              <p className="text-sm text-gray-600">
                Include any relevant information that might help others understand your question
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Add up to 5 tags to help others find your question
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments (optional)
                </div>
              </Label>
              <FileUpload
                accept={["image/*", "application/pdf"]}
                maxFiles={3}
                onUpload={handleFileUpload}
                onRemove={handleFileRemove}
                disabled={loading}
              />
              <p className="text-sm text-gray-600">
                You can attach up to 3 images or PDF files (max 5MB each)
              </p>
            </div>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900">Tips for getting good answers:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Search to see if your question has already been asked</li>
                      <li>Be specific and include all relevant details</li>
                      <li>Show what you've already tried</li>
                      <li>Check your spelling and grammar</li>
                      <li>Be respectful and patient</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Posting..." : "Post Question"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}