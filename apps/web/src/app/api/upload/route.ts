import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateUniqueFileName, validateFile } from "@/lib/upload";

// In production, you would use a cloud storage service like AWS S3, Cloudinary, etc.
// For development, we'll use local file storage
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const purpose = formData.get("purpose") as string; // 'exercise', 'forum', 'profile'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    for (const file of files) {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Generate unique filename
      const uniqueFileName = generateUniqueFileName(file.name);
      const filePath = path.join(UPLOAD_DIR, uniqueFileName);
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);

      // Create file record in database
      const fileRecord = await prisma.file.create({
        data: {
          fileName: file.name,
          fileUrl: `/uploads/${uniqueFileName}`,
          fileType: file.type,
          fileSize: file.size,
          uploadedById: user.id,
          purpose: purpose || "general",
        },
      });

      uploadedFiles.push({
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        fileUrl: fileRecord.fileUrl,
        fileType: fileRecord.fileType,
        fileSize: fileRecord.fileSize,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get file record
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Check if user owns the file or is admin
    if (file.uploadedById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete file record (in production, also delete from cloud storage)
    await prisma.file.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}