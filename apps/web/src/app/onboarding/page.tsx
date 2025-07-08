"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Users, BookOpen } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [role, setRole] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role || (role === "STUDENT" && !grade)) return;

    setLoading(true);
    try {
      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          grade: role === "STUDENT" ? grade : null,
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to PLP!</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">
              I am a...
            </Label>
            <RadioGroup value={role} onValueChange={setRole}>
              <div className="grid gap-4">
                <label
                  htmlFor="student"
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    role === "STUDENT" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="STUDENT" id="student" />
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Student</p>
                    <p className="text-sm text-gray-600">I want to learn and practice</p>
                  </div>
                </label>

                <label
                  htmlFor="parent"
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    role === "PARENT" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="PARENT" id="parent" />
                  <Users className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Parent</p>
                    <p className="text-sm text-gray-600">I want to manage my children's accounts</p>
                  </div>
                </label>

                <label
                  htmlFor="teacher"
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    role === "TEACHER" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="TEACHER" id="teacher" />
                  <BookOpen className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Teacher</p>
                    <p className="text-sm text-gray-600">I want to track student progress</p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {role === "STUDENT" && (
            <div>
              <Label htmlFor="grade" className="text-base font-semibold mb-2 block">
                Select your grade
              </Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Choose your grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grade 1</SelectItem>
                  <SelectItem value="2">Grade 2</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="6">Grade 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!role || (role === "STUDENT" && !grade) || loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Setting up..." : "Continue to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}