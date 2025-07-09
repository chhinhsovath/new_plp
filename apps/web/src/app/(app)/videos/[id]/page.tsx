"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Eye, FileText, Share2, Bookmark } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface VideoPageProps {
  params: {
    id: string;
  };
}

export default function VideoPage({ params }: VideoPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [video, setVideo] = useState<any>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  
  const { updateProgress } = useVideoProgress({
    videoId: params.id,
    onComplete: () => {
      // Refresh video data to update completion status
      fetchVideo();
    },
  });

  useEffect(() => {
    fetchVideo();
    fetchRecommendedVideos();
  }, [params.id]);

  const fetchVideo = async () => {
    try {
      const response = await api.get(`/videos/${params.id}`);
      setVideo(response.data);
    } catch (error) {
      console.error("Error fetching video:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedVideos = async () => {
    try {
      const response = await api.get("/videos/recommended");
      setRecommendedVideos(response.data);
    } catch (error) {
      console.error("Error fetching recommended videos:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The video link has been copied to your clipboard.",
      });
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "Bookmark removed" : "Video bookmarked!",
      description: bookmarked 
        ? "The video has been removed from your bookmarks."
        : "You can find this video in your bookmarks.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    notFound();
  }

  const userProgress = video.videoProgress?.[0];
  const progressPercentage = userProgress ? (userProgress.watchedSeconds / video.duration) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="aspect-video">
            <VideoPlayer
              videoId={video.id}
              videoUrl={video.url}
              title={video.title}
              titleKh={video.titleKh}
              initialProgress={userProgress?.watchedSeconds || 0}
              onProgress={updateProgress}
              showControls
              className="w-full h-full"
            />
          </div>

          {/* Video Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{video.title}</CardTitle>
                  {video.titleKh && (
                    <CardDescription className="text-lg mt-1">{video.titleKh}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={bookmarked ? "default" : "outline"} 
                    size="icon"
                    onClick={toggleBookmark}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(video.duration / 60)} min</span>
                </div>
                <Badge variant="secondary">{video.subject.name}</Badge>
                {video.grade && <Badge variant="outline">Grade {video.grade}</Badge>}
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  {video.description && (
                    <div className="prose prose-sm max-w-none">
                      <p>{video.description}</p>
                    </div>
                  )}
                  
                  {video.lesson && (
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Part of lesson:</p>
                        <Link 
                          href={`/subjects/${video.subject.code}/lessons/${video.lesson.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {video.lesson.title}
                        </Link>
                      </div>
                    </div>
                  )}

                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="transcript">
                  {video.transcriptUrl ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Transcript available for this video
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={video.transcriptUrl} download>
                          <FileText className="h-4 w-4 mr-2" />
                          Download Transcript
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No transcript available for this video
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="resources">
                  <p className="text-sm text-muted-foreground">
                    No additional resources for this video
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          {userProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {userProgress.completed 
                    ? "You've completed this video! 🎉"
                    : `${Math.round(progressPercentage)}% watched`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Recommended Videos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended Videos</h3>
          <div className="space-y-3">
            {recommendedVideos.map((rec: any) => (
              <Link key={rec.id} href={`/videos/${rec.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-video relative mb-3 bg-muted rounded overflow-hidden">
                      {rec.thumbnailUrl ? (
                        <img 
                          src={rec.thumbnailUrl} 
                          alt={rec.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(rec.duration / 60)}:{(rec.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">{rec.title}</h4>
                    {rec.titleKh && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {rec.titleKh}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.subject.name} • {rec.views.toLocaleString()} views
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}