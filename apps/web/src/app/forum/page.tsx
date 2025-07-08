"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Search,
  Filter,
  Plus,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  User
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  subject: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  views: number;
  upvotes: number;
  answers: number;
  hasAcceptedAnswer: boolean;
  tags: string[];
}

export default function ForumPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchPosts();
  }, [selectedSubject, sortBy]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== "all") params.append("subject", selectedSubject);
      if (searchQuery) params.append("search", searchQuery);
      params.append("sort", sortBy);

      const response = await fetch(`/api/forum/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const displayPosts = loading ? [] : posts;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Forum</h1>
            <p className="text-gray-600">Ask questions, share knowledge, and help each other learn</p>
          </div>
          <Button asChild>
            <Link href="/forum/new">
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex gap-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  <SelectItem value="khmer">Khmer</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="unanswered">Unanswered</SelectItem>
                  <SelectItem value="votes">Most votes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Questions</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          <TabsTrigger value="my-questions">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {displayPosts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
          
          {displayPosts.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No questions found. Be the first to ask!</p>
                <Button asChild className="mt-4">
                  <Link href="/forum/new">Ask a Question</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unanswered">
          {displayPosts
            .filter(post => post.answers === 0)
            .map((post) => (
              <ForumPostCard key={post.id} post={post} />
            ))}
        </TabsContent>

        <TabsContent value="my-questions">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">Sign in to see your questions</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ForumPostCard({ post }: { post: ForumPost }) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const subjectColors: Record<string, string> = {
    math: "bg-blue-100 text-blue-700",
    english: "bg-green-100 text-green-700",
    khmer: "bg-purple-100 text-purple-700",
    science: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Stats sidebar */}
          <div className="flex flex-col items-center gap-2 text-center min-w-[60px]">
            <div>
              <p className="text-2xl font-semibold">{post.answers}</p>
              <p className="text-xs text-gray-600">answers</p>
            </div>
            <div>
              <p className="text-lg font-medium">{post.upvotes}</p>
              <p className="text-xs text-gray-600">votes</p>
            </div>
            <div>
              <p className="text-sm">{post.views}</p>
              <p className="text-xs text-gray-600">views</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <Link href={`/forum/posts/${post.id}`}>
                <h3 className="text-lg font-semibold hover:text-primary">
                  {post.title}
                  {post.hasAcceptedAnswer && (
                    <CheckCircle className="inline-block w-4 h-4 ml-2 text-green-600" />
                  )}
                </h3>
              </Link>
              <Badge 
                variant="secondary" 
                className={subjectColors[post.subject] || ""}
              >
                {post.subject}
              </Badge>
            </div>

            <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-3 h-3" />
                <span>{post.authorName}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}