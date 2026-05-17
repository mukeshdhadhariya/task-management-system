import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apierror";
import { asyncHandler } from "../utils/asyncHandler";
import { makeBlobName, uploadPdfToCloudinary, deleteFromCloudinary } from "../services/document.service";

export const uploadTaskDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const rawTaskId = req.params.taskId;
    if (!rawTaskId || Array.isArray(rawTaskId)) {
      throw new ApiError(400, "Invalid task id");
    }
    const taskId = rawTaskId;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new ApiError(400, "At least one PDF file is required");
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { attachments: true },
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    const isOwner = task.assignedToId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "You cannot modify this task");
    }

    const MAX_FILES = 3;
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB per file
    const ALLOWED_MIMES = ["application/pdf"];

    const totalAfterUpload = task.attachments.length + files.length;
    if (totalAfterUpload > MAX_FILES) {
      throw new ApiError(400, `You can attach up to ${MAX_FILES} documents only`);
    }

    // Validate files before uploading
    for (const file of files) {
      if (!ALLOWED_MIMES.includes(file.mimetype)) {
        throw new ApiError(400, `Only PDF files are allowed`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new ApiError(400, `Each file must be <= ${MAX_FILE_SIZE} bytes`);
      }
    }

    type UploadedItem = {
      publicId: string;
      url: string;
      originalName: string;
      mimeType: string;
      size: number;
    };

    let uploaded: UploadedItem[] = [];

    try {
      uploaded = await Promise.all(
        files.map(async (file) => {
          const publicId = makeBlobName(taskId, file.originalname);
          const result = await uploadPdfToCloudinary(file.buffer, publicId, file.mimetype);

          return {
            publicId: result.publicId,
            url: result.secureUrl,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          } as UploadedItem;
        })
      );

      const attachments = await prisma.$transaction(
        uploaded.map((item) =>
          prisma.attachment.create({
            data: {
              taskId,
              blobName: item.publicId,
              originalName: item.originalName,
              mimeType: item.mimeType,
              size: item.size,
              url: item.url,
            },
          })
        )
      );

      return res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        data: attachments,
      });
    } catch (error) {
      // cleanup any uploaded blobs if DB save failed or upload partially succeeded
      await Promise.all(
        uploaded.map((item) => deleteFromCloudinary(item.publicId).catch(() => undefined))
      );
      throw error;
    }
  }
);

export const downloadTaskDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const { taskId, attachmentId } = req.params as {
      taskId: string;
      attachmentId: string;
    };

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        taskId,
      },
      include: {
        task: true,
      },
    });

    if (!attachment) {
      throw new ApiError(404, "Document not found");
    }

    const isOwner = attachment.task.assignedToId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "You cannot access this document");
    }

    // Cloudinary stores a public URL in `attachment.url`.
    // Redirect the client to the secure Cloudinary URL for download.
    return res.redirect(302, attachment.url);
  }
);