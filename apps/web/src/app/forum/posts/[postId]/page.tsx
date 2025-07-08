"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ThumbsUp, 
  MessageCircle, 
  CheckCircle,
  Clock,
  User,
  Eye,
  Share2,
  Bookmark,
  Flag
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
  tags: string[];
  answers: Answer[];
}

interface Answer {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  upvotes: number;
  isAccepted: boolean;
  isAuthor?: boolean;
}

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
    fetchUserVotes();
    if (user) {
      fetchCurrentUserId();
    }
  }, [params.postId, user]);

  const fetchCurrentUserId = async () => {
    try {
      const response = await fetch("/api/user/current");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.userId);
      }
    } catch (error) {
      console.error("Error fetching current user ID:", error);
    }
  };

  const fetchPost = async () => {
    try {
      // Fetch post details
      const postRes = await fetch(`/api/forum/posts/${params.postId}`);
      if (!postRes.ok) throw new Error("Failed to fetch post");
      const postData = await postRes.json();

      // Fetch answers
      const answersRes = await fetch(`/api/forum/posts/${params.postId}/answers`);
      if (!answersRes.ok) throw new Error("Failed to fetch answers");
      const answersData = await answersRes.json();

      // Combine data
      setPost({
        ...postData.post,
        answers: answersData.answers.map((answer: any) => ({
          ...answer,
          isAuthor: answer.authorId === postData.post.authorId,
        })),
      });
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${params.postId}/votes`);
      if (response.ok) {
        const data = await response.json();
        setUserVotes(data.votes || {});
      }
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/forum/posts/${params.postId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answerContent }),
      });

      if (response.ok) {
        setAnswerContent("");
        fetchPost(); // Refresh to show new answer
      }
    } catch (error) {
      console.error("Error posting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (type: "post" | "answer", id: string) => {
    const voteKey = `${type}-${id}`;
    const hasVoted = userVotes[voteKey];
    
    try {
      const endpoint = type === "post" 
        ? `/api/forum/posts/${id}/vote`
        : `/api/forum/answers/${id}/vote`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: hasVoted ? "remove" : "upvote" }),
      });

      if (response.ok) {
        // Toggle vote
        setUserVotes(prev => ({ ...prev, [voteKey]: !hasVoted }));
        
        // Update UI optimistically
        if (type === "post" && post) {
          setPost({ ...post, upvotes: post.upvotes + (hasVoted ? -1 : 1) });
        } else if (type === "answer" && post) {
          setPost({
            ...post,
            answers: post.answers.map(answer =>
              answer.id === id
                ? { ...answer, upvotes: answer.upvotes + (hasVoted ? -1 : 1) }
                : answer
            ),
          });
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/forum/answers/${answerId}/accept`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (post) {
          setPost({
            ...post,
            answers: post.answers.map(answer =>
              answer.id === answerId
                ? { ...answer, isAccepted: data.accepted }
                : { ...answer, isAccepted: false }
            ),
          });
        }
      }
    } catch (error) {
      console.error("Error accepting answer:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Less than an hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Post not found</p>
      </div>
    );
  }

  const subjectColors: Record<string, string> = {
    math: "bg-blue-100 text-blue-700",
    english: "bg-green-100 text-green-700",
    khmer: "bg-purple-100 text-purple-700",
    science: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/forum" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Forum
        </Link>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold flex-1">{post.title}</h1>
              <Badge 
                variant="secondary" 
                className={subjectColors[post.subject] || ""}
              >
                {post.subject}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views} views</span>
              </div>
            </div>

            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={userVotes[`post-${post.id}`] ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote("post", post.id)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {post.upvotes}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4 mr-1" />
              Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {post.answers.length} {post.answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {post.answers.map((answer) => (
          <Card key={answer.id} className={answer.isAccepted ? "border-green-500" : ""}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {answer.isAccepted && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Accepted Answer</span>
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{answer.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{answer.authorName}</span>
                      {answer.authorName.includes("Teacher") && (
                        <Badge variant="secondary" className="ml-1 text-xs">Teacher</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(answer.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={userVotes[`answer-${answer.id}`] ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote("answer", answer.id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {answer.upvotes}
                    </Button>
                    {currentUserId === post.authorId && !answer.isAuthor && (
                      <Button
                        variant={answer.isAccepted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAcceptAnswer(answer.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {answer.isAccepted ? "Accepted" : "Accept"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Answer form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Answer</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Share your knowledge and help others learn..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                rows={6}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Be respectful, helpful, and make sure to explain your answer clearly.
                </p>
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={!answerContent.trim() || submitting}
                >
                  {submitting ? "Posting..." : "Post Answer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}