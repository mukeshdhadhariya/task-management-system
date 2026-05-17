import path from "path";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary";

const cleanFileName = (name: string) =>
  name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

export const makeBlobName = (taskId: string, originalName: string) => {
  const ext = path.extname(originalName).toLowerCase() || ".pdf";
  const safeName = cleanFileName(path.basename(originalName, ext));
  // use Cloudinary public_id style but keep path-like structure
  return `tasks/${taskId}/${Date.now()}-${randomUUID()}-${safeName}`;
};
export const uploadPdfToCloudinary = async (
  buffer: Buffer,
  publicId: string,
  mimeType: string
) => {
  return new Promise<{ publicId: string; secureUrl: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "raw",
        overwrite: false,
      },
      (error: unknown, result: unknown) => {
        if (error) {
          const msg = typeof error === "object" && error && "message" in (error as any) ? (error as any).message : "Cloudinary upload error";
          return reject(new Error(String(msg)));
        }

        if (!result || typeof result !== "object") return reject(new Error("Invalid upload result"));

        const res = result as Record<string, unknown>;
        const public_id = typeof res.public_id === "string" ? res.public_id : undefined;
        const secure_url = typeof res.secure_url === "string" ? res.secure_url : undefined;

        if (!public_id || !secure_url) return reject(new Error("Invalid upload result"));

        resolve({ publicId: public_id, secureUrl: secure_url });
      }
    );

    // stream the buffer into Cloudinary
    Readable.from(buffer).pipe(uploadStream as NodeJS.WritableStream);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  // resource_type raw for non-image files (pdf)
  await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
};