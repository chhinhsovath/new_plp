"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, TrendingUp } from "lucide-react";

interface Subject {
  id: string;
  code: string;
  name: string;
  nameKh: string;
  description: string;
  icon: string;
  lessons?: number;
  progress?: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subjects</h1>
        <p className="text-gray-600">Choose a subject to start learning</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.code}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{subject.icon}</span>
                  {subject.progress !== undefined && (
                    <Badge variant="secondary">{subject.progress}%</Badge>
                  )}
                </div>
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription className="text-sm">
                  {subject.nameKh}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{subject.lessons || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>All grades</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Learning Tips</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium">Study Daily</h3>
              <p className="text-sm text-gray-600">15-30 minutes per day is better than long sessions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium">Track Progress</h3>
              <p className="text-sm text-gray-600">Complete exercises to earn points and level up</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium">Set Goals</h3>
              <p className="text-sm text-gray-600">Aim to complete one lesson per day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}