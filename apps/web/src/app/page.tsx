import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, Brain } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Welcome to Primary Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Interactive educational content for primary school students in Cambodia
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Interactive Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engaging lessons in Khmer, English, Math, and Science with 40+ exercise types
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Parent Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your children's progress and manage multiple student accounts
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="w-12 h-12 text-yellow-600 mb-4" />
              <CardTitle>Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn points, badges, and rewards to make learning fun and motivating
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Adaptive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalized learning paths that adapt to each student's progress
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Subject Areas */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">Subject Areas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/subjects/khmer" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🇰🇭</div>
                <CardTitle>Khmer</CardTitle>
                <CardDescription>Reading, writing, and language skills</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/subjects/math" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🔢</div>
                <CardTitle>Mathematics</CardTitle>
                <CardDescription>Numbers, operations, and problem solving</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/subjects/english" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🔤</div>
                <CardTitle>English</CardTitle>
                <CardDescription>Language learning and communication</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/subjects/science" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🔬</div>
                <CardTitle>Science</CardTitle>
                <CardDescription>Explore the natural world</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}