"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, X } from "lucide-react";
import { validateFile } from "@/lib/upload";

interface AvatarUploadProps {
  currentImageUrl?: string;
  userName: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function AvatarUpload({
  currentImageUrl,
  userName,
  onUpload,
  onRemove,
  size = "md",
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);

      // Upload file
      const uploadedUrl = await onUpload(file);
      setImageUrl(uploadedUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setError("Failed to upload image");
      // Revert to previous image
      setImageUrl(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove || !imageUrl) return;

    setUploading(true);
    try {
      await onRemove();
      setImageUrl(undefined);
    } catch (error) {
      console.error("Error removing avatar:", error);
      setError("Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    const names = userName.split(" ");
    return names.map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="relative inline-block">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={imageUrl} alt={userName} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full w-8 h-8"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Camera className="w-4 h-4" />
        </Button>

        {imageUrl && onRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 rounded-full w-6 h-6"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
        
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}