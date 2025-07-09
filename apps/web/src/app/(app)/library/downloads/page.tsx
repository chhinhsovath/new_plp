"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  BookOpen,
  FileIcon,
  Presentation,
  FileSpreadsheet,
  FileArchive,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";

const resourceTypeIcons: Record<string, any> = {
  PDF: FileText,
  EBOOK: BookOpen,
  WORKSHEET: FileSpreadsheet,
  PRESENTATION: Presentation,
  TEMPLATE: FileIcon,
  GUIDE: FileText,
  OTHER: FileArchive,
};

interface ResourceDownload {
  id: string;
  downloadedAt: string;
  resource: {
    id: string;
    title: string;
    titleKh?: string;
    description?: string;
    type: string;
    fileUrl: string;
    fileSize: number;
    subject?: {
      id: string;
      name: string;
      code: string;
    };
    grade?: string;
    tags: string[];
  };
}

export default function DownloadHistoryPage() {
  const [downloads, setDownloads] = useState<ResourceDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedDownloads, setGroupedDownloads] = useState<Record<string, ResourceDownload[]>>({});

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const response = await api.get("/library/downloads");
      const downloadData = response.data;
      setDownloads(downloadData);

      // Group downloads by date
      const grouped = downloadData.reduce((acc: Record<string, ResourceDownload[]>, download: ResourceDownload) => {
        const date = format(new Date(download.downloadedAt), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(download);
        return acc;
      }, {});

      setGroupedDownloads(grouped);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMMM d, yyyy");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/library">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Download History</h1>
            </div>
            <p className="text-muted-foreground">
              View and re-download your previously downloaded resources
            </p>
          </div>
          <Link href="/library">
            <Button>
              Browse Library
            </Button>
          </Link>
        </div>

        {/* Downloads List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No downloads yet</p>
              <Link href="/library">
                <Button>Browse Library</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDownloads).map(([date, dateDownloads]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {getDateLabel(date)}
                </h3>
                
                <div className="grid gap-4">
                  {dateDownloads.map((download) => {
                    const Icon = resourceTypeIcons[download.resource.type] || FileIcon;
                    return (
                      <Card key={download.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-muted rounded-lg">
                                <Icon className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">
                                  {download.resource.title}
                                </h4>
                                {download.resource.titleKh && (
                                  <p className="text-sm text-muted-foreground">
                                    {download.resource.titleKh}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span>{formatFileSize(download.resource.fileSize)}</span>
                                  <span>
                                    Downloaded {formatDistanceToNow(new Date(download.downloadedAt), { addSuffix: true })}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Badge variant="secondary" className="text-xs">
                                    {download.resource.type}
                                  </Badge>
                                  {download.resource.subject && (
                                    <Badge variant="outline" className="text-xs">
                                      {download.resource.subject.name}
                                    </Badge>
                                  )}
                                  {download.resource.grade && (
                                    <Badge variant="outline" className="text-xs">
                                      Grade {download.resource.grade}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={download.resource.fileUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                Re-download
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}