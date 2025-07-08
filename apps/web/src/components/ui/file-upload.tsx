"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Music, 
  Video,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { validateFile, getFileType } from "@/lib/upload";

interface FileUploadProps {
  accept?: string[];
  maxFiles?: number;
  maxSize?: number;
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  className?: string;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export function FileUpload({
  accept,
  maxFiles = 5,
  onUpload,
  onRemove,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validate files
    const validFiles: UploadedFile[] = [];
    
    for (const file of acceptedFiles) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          progress: 0,
          status: 'pending',
        });
      } else {
        // Show error for invalid file
        validFiles.push({
          file,
          progress: 0,
          status: 'error',
          error: validation.error,
        });
      }
    }
    
    if (validFiles.length === 0) return;
    
    // Add files to state
    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    
    // Upload valid files
    const filesToUpload = validFiles.filter(f => f.status === 'pending').map(f => f.file);
    if (filesToUpload.length > 0) {
      setUploading(true);
      try {
        await onUpload(filesToUpload);
        // Update status to completed
        setFiles(prev => prev.map(f => 
          filesToUpload.includes(f.file) 
            ? { ...f, status: 'completed' as const }
            : f
        ));
      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map(f => 
          filesToUpload.includes(f.file) 
            ? { ...f, status: 'error' as const, error: 'Upload failed' }
            : f
        ));
      } finally {
        setUploading(false);
      }
    }
  }, [maxFiles, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? Object.fromEntries(accept.map(type => [type, []])) : undefined,
    maxFiles,
    disabled: disabled || uploading,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    onRemove?.(index);
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file.type);
    switch (type) {
      case 'image': return <Image className="w-8 h-8" />;
      case 'audio': return <Music className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      default: return <FileText className="w-8 h-8" />;
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          or click to browse from your computer
        </p>
        {accept && (
          <p className="text-xs text-gray-500">
            Accepted formats: {accept.join(', ')}
          </p>
        )}
        {maxFiles > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            Maximum {maxFiles} files
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((uploadedFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                <div className="text-gray-500">
                  {getFileIcon(uploadedFile.file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>
                  {uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(uploadedFile.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploadedFile.status === 'uploading'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {uploadedFile.status === 'uploading' && (
                <Progress value={uploadedFile.progress} className="mt-2 h-1" />
              )}
            </Card>
          ))}
        </div>
      )}

      {uploading && (
        <Alert className="mt-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <AlertDescription>
            Uploading files... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}