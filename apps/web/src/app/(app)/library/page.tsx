"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  BookOpen,
  FileIcon,
  Presentation,
  FileSpreadsheet,
  FileArchive,
  Clock,
  Eye
} from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const resourceTypeIcons: Record<string, any> = {
  PDF: FileText,
  EBOOK: BookOpen,
  WORKSHEET: FileSpreadsheet,
  PRESENTATION: Presentation,
  TEMPLATE: FileIcon,
  GUIDE: FileText,
  OTHER: FileArchive,
};

const resourceTypeColors: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  EBOOK: "bg-blue-100 text-blue-700",
  WORKSHEET: "bg-green-100 text-green-700",
  PRESENTATION: "bg-yellow-100 text-yellow-700",
  TEMPLATE: "bg-purple-100 text-purple-700",
  GUIDE: "bg-indigo-100 text-indigo-700",
  OTHER: "bg-gray-100 text-gray-700",
};

interface LibraryResource {
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
  downloads: number;
  uploadedAt: string;
}

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    subject: searchParams.get("subject") || "",
    grade: searchParams.get("grade") || "",
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch subjects and resource types
  useEffect(() => {
    Promise.all([
      api.get("/subjects"),
      api.get("/library/resource-types"),
    ]).then(([subjectsRes, typesRes]) => {
      setSubjects(subjectsRes.data);
      setResourceTypes(typesRes.data);
    });
  }, []);

  // Fetch resources
  useEffect(() => {
    fetchResources();
  }, [debouncedSearch, filters.type, filters.subject, filters.grade, pagination.page]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.type) params.append("type", filters.type);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.grade) params.append("grade", filters.grade);

      const response = await api.get(`/library/resources?${params}`);
      setResources(response.data.resources);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "Failed to load library resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: LibraryResource) => {
    setDownloading(resource.id);
    try {
      const response = await api.post(`/library/resources/${resource.id}/download`);
      
      // Open download URL in new tab
      window.open(response.data.downloadUrl, "_blank");
      
      toast({
        title: "Download started",
        description: `${resource.title} is being downloaded`,
      });
      
      // Refresh to update download count
      fetchResources();
    } catch (error) {
      console.error("Error downloading resource:", error);
      toast({
        title: "Download failed",
        description: "Unable to download resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      subject: "",
      grade: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Digital Library</h1>
          <p className="text-muted-foreground mt-2">
            Download educational resources, worksheets, and study materials
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                Showing {resources.length} of {pagination.total} resources
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No resources found</p>
              {activeFiltersCount > 0 && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resourceTypeIcons[resource.type] || FileIcon;
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${resourceTypeColors[resource.type] || "bg-gray-100"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {resource.title}
                          </CardTitle>
                          {resource.titleKh && (
                            <CardDescription className="line-clamp-1 mt-1">
                              {resource.titleKh}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(resource.fileSize)}</span>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{resource.downloads}</span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(resource.uploadedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {resource.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {resource.subject.name}
                        </Badge>
                      )}
                      {resource.grade && (
                        <Badge variant="outline" className="text-xs">
                          Grade {resource.grade}
                        </Badge>
                      )}
                      {resource.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleDownload(resource)}
                      disabled={downloading === resource.id}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloading === resource.id ? "Downloading..." : "Download"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={i}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {pagination.totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.totalPages })}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
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