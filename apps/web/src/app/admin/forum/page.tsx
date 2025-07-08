"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  subject: string;
  createdAt: string;
  views: number;
  upvotes: number;
  answersCount: number;
  reported: boolean;
  hidden: boolean;
}

interface ForumReport {
  id: string;
  postId: string;
  postTitle: string;
  reportedBy: string;
  reason: string;
  description: string;
  createdAt: string;
  resolved: boolean;
}

export default function ForumModerationPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      const [postsRes, reportsRes] = await Promise.all([
        fetch("/api/admin/forum/posts"),
        fetch("/api/admin/forum/reports"),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePostVisibility = async (postId: string, hidden: boolean) => {
    try {
      const response = await fetch(`/api/admin/forum/posts/${postId}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });

      if (response.ok) {
        fetchForumData();
      }
    } catch (error) {
      console.error("Error toggling post visibility:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/admin/forum/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchForumData();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/forum/reports/${reportId}/resolve`, {
        method: "PUT",
      });

      if (response.ok) {
        fetchForumData();
      }
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const reportedPosts = posts.filter(post => post.reported);
  const hiddenPosts = posts.filter(post => post.hidden);
  const unresolvedReports = reports.filter(report => !report.resolved);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Forum Moderation</h1>
        <p className="text-gray-600">
          Monitor and moderate forum content
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Posts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reportedPosts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hidden Posts</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {hiddenPosts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unresolvedReports.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">All Posts</TabsTrigger>
          <TabsTrigger value="reported">
            Reported ({reportedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports ({unresolvedReports.length})
          </TabsTrigger>
        </TabsList>

        {/* All Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Forum Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {post.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{post.authorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{post.views} views</p>
                          <p>{post.answersCount} answers</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {post.reported && (
                            <Badge variant="destructive" className="text-xs">
                              Reported
                            </Badge>
                          )}
                          {post.hidden && (
                            <Badge variant="secondary" className="text-xs">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/forum/posts/${post.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Post
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTogglePostVisibility(post.id, post.hidden)}
                            >
                              {post.hidden ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Show Post
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Hide Post
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reported Posts Tab */}
        <TabsContent value="reported">
          <Card>
            <CardHeader>
              <CardTitle>Reported Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {reportedPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reported posts
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportedPosts.map((post) => {
                      const postReports = reports.filter(r => r.postId === post.id);
                      return (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="font-medium truncate">{post.title}</p>
                              <p className="text-sm text-gray-600 truncate">
                                {post.content}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{post.authorName}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {postReports.length} reports
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {post.hidden ? (
                              <Badge variant="secondary">Hidden</Badge>
                            ) : (
                              <Badge variant="outline">Visible</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/forum/posts/${post.id}`}>
                                  View
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePostVisibility(post.id, post.hidden)}
                              >
                                {post.hidden ? "Show" : "Hide"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reports to review
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <p className="font-medium truncate">{report.postTitle}</p>
                        </TableCell>
                        <TableCell>{report.reportedBy}</TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {report.reason}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {report.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {report.resolved ? (
                            <Badge variant="secondary">Resolved</Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!report.resolved && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/forum/posts/${report.postId}`}>
                                  View Post
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleResolveReport(report.id)}
                              >
                                Resolve
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}