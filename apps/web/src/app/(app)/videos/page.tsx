"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Eye, Filter, Grid, List, Play, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Video {
  id: string;
  title: string;
  titleKh?: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  views: number;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  grade: string;
  lesson?: {
    id: string;
    title: string;
  };
  videoProgress?: {
    watchedSeconds: number;
    completed: boolean;
  }[];
}

export default function VideosPage() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    subject: searchParams.get("subject") || "",
    grade: searchParams.get("grade") || "",
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch subjects for filter
  useEffect(() => {
    api.get("/subjects").then((res) => setSubjects(res.data));
  }, []);

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, [debouncedSearch, filters.subject, filters.grade, pagination.page]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.grade) params.append("grade", filters.grade);

      const response = await api.get(`/videos?${params}`);
      setVideos(response.data.videos);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = (video: Video) => {
    if (!video.videoProgress?.[0]) return 0;
    return (video.videoProgress[0].watchedSeconds / video.duration) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Video Library</h1>
          <p className="text-muted-foreground mt-2">
            Watch educational videos to enhance your learning
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              {/* Subject Filter */}
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters({ ...filters, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Grade Filter */}
              <Select
                value={filters.grade}
                onValueChange={(value) => setFilters({ ...filters, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {videos.length} of {pagination.total} videos
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video List */}
        {loading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-video" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {videos.map((video) => (
              <Link key={video.id} href={`/videos/${video.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="aspect-video relative bg-muted">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="object-cover w-full h-full rounded-t-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Play className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>

                      {/* Progress Bar */}
                      {video.videoProgress?.[0] && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <Progress 
                            value={getProgressPercentage(video)} 
                            className="h-1 rounded-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "p-4 space-y-2",
                      viewMode === "list" && "flex gap-4"
                    )}>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                        {video.titleKh && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {video.titleKh}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{video.views}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {video.subject.name}
                          </Badge>
                          {video.grade && (
                            <Badge variant="outline" className="text-xs">
                              Grade {video.grade}
                            </Badge>
                          )}
                        </div>

                        {video.lesson && (
                          <p className="text-xs text-muted-foreground">
                            <BookOpen className="inline h-3 w-3 mr-1" />
                            {video.lesson.title}
                          </p>
                        )}

                        {video.videoProgress?.[0]?.completed && (
                          <Badge variant="default" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: i + 1 })}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}