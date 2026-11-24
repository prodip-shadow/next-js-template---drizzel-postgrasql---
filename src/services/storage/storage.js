import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { STORAGE_CONFIG } from "@/lib/config";
import { AppError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const MIME_EXTENSION_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CLOUDINARY_UPLOAD_TIMEOUT_MS = 15000;

function resolveStorageProvider() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  const providedCount = [cloudName, apiKey, apiSecret].filter(Boolean).length;

  if (providedCount === 3) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return "cloudinary";
  }

  if (providedCount > 0) {
    logger.warn(
      "Incomplete Cloudinary configuration detected. Falling back to local storage.",
      {
        hasCloudName: Boolean(cloudName),
        hasApiKey: Boolean(apiKey),
        hasApiSecret: Boolean(apiSecret),
      }
    );
  }

  return "local";
}

const ACTIVE_PROVIDER = resolveStorageProvider();

export function getActiveStorageProvider() {
  return ACTIVE_PROVIDER;
}

function sanitizeFolderName(folder) {
  const raw = String(folder || STORAGE_CONFIG.defaultFolder);
  if (raw.includes("..")) {
    throw new ValidationError("Invalid storage folder name.");
  }

  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return cleaned || STORAGE_CONFIG.defaultFolder;
}

function hasValidMagicBytes(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

export function validateImageFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new ValidationError("Please provide a valid image file.");
  }

  if (file.size <= 0) {
    throw new ValidationError("Uploaded file is empty.");
  }

  if (file.size > STORAGE_CONFIG.maxImageSizeBytes) {
    const maxMb = Math.round(STORAGE_CONFIG.maxImageSizeBytes / (1024 * 1024));
    throw new ValidationError(`Image size must not exceed ${maxMb}MB.`);
  }

  if (!STORAGE_CONFIG.allowedImageMimeTypes.includes(file.type)) {
    throw new ValidationError("Only JPEG, PNG, and WebP images are allowed.");
  }
}

async function readAndVerifyImageBuffer(file) {
  validateImageFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!hasValidMagicBytes(buffer, file.type)) {
    throw new ValidationError("Invalid image file signature.");
  }

  return buffer;
}

async function uploadToCloudinary(buffer, safeFolder, uniqueId) {
  const folderPath = `${STORAGE_CONFIG.cloudinaryFolderPrefix}/${safeFolder}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        public_id: uniqueId,
        resource_type: "image",
        overwrite: false,
        timeout: CLOUDINARY_UPLOAD_TIMEOUT_MS,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result?.public_id) {
          logger.error("Cloudinary upload failed", {
            folder: folderPath,
            message: error?.message || "Unknown Cloudinary error",
          });
          reject(new AppError("Failed to upload image. Please try again.", 502, "STORAGE_ERROR"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          provider: "cloudinary",
        });
      }
    );

    stream.end(buffer);
  });
}

async function uploadToLocal(buffer, safeFolder, uniqueId, ext) {
  const filename = `${uniqueId}.${ext}`;
  const baseDir = path.resolve(process.cwd(), STORAGE_CONFIG.uploadDir);
  const targetDir = path.join(baseDir, safeFolder);
  await fs.mkdir(targetDir, { recursive: true });

  const filePath = path.join(targetDir, filename);
  await fs.writeFile(filePath, buffer);

  return {
    url: `${STORAGE_CONFIG.publicPrefix}/${safeFolder}/${filename}`,
    publicId: `${safeFolder}/${filename}`,
    provider: "local",
  };
}

export async function storeImageFile(file, folder = STORAGE_CONFIG.defaultFolder) {
  const safeFolder = sanitizeFolderName(folder);
  const buffer = await readAndVerifyImageBuffer(file);
  const ext = MIME_EXTENSION_MAP[file.type] || "bin";
  const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

  if (ACTIVE_PROVIDER === "cloudinary") {
    return uploadToCloudinary(buffer, safeFolder, uniqueId);
  }

  return uploadToLocal(buffer, safeFolder, uniqueId, ext);
}

async function deleteFromLocal(publicIdOrUrl) {
  let relativePath = publicIdOrUrl;
  if (relativePath?.startsWith(`${STORAGE_CONFIG.publicPrefix}/`)) {
    relativePath = relativePath.slice(STORAGE_CONFIG.publicPrefix.length + 1);
  }

  if (!relativePath) return false;

  const baseDir = path.resolve(process.cwd(), STORAGE_CONFIG.uploadDir);
  const targetPath = path.resolve(baseDir, relativePath);

  if (!targetPath.startsWith(baseDir + path.sep)) {
    return false;
  }

  try {
    await fs.unlink(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function deleteFromCloudinary(publicId) {
  if (!publicId || ACTIVE_PROVIDER !== "cloudinary") {
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    return result?.result === "ok" || result?.result === "not found";
  } catch (error) {
    logger.error("Cloudinary delete failed", {
      publicId,
      message: error?.message || "Unknown Cloudinary error",
    });
    return false;
  }
}

export async function deleteStoredFile(fileRef) {
  if (!fileRef) return false;

  if (typeof fileRef === "string") {
    return deleteFromLocal(fileRef);
  }

  const { url, publicId, provider } = fileRef;
  const resolvedProvider =
    provider || (url?.startsWith(`${STORAGE_CONFIG.publicPrefix}/`) ? "local" : null);

  if (resolvedProvider === "cloudinary") {
    return deleteFromCloudinary(publicId);
  }

  if (resolvedProvider === "local") {
    return deleteFromLocal(publicId || url);
  }

  return false;
}

/**
 * Safely replaces an image:
 * 1. Uploads the new image.
 * 2. Runs `persistFn(uploaded)` to update the database.
 * 3. Cleans up the newly uploaded image if the DB update fails.
 * 4. Deletes the previous image only after the DB update succeeds.
 */
export async function replaceStoredImage({
  file,
  folder = STORAGE_CONFIG.defaultFolder,
  previousImage = null,
  persistFn,
}) {
  const uploaded = await storeImageFile(file, folder);

  try {
    const result = await persistFn(uploaded);

    if (previousImage?.publicId || previousImage?.url) {
      await deleteStoredFile(previousImage).catch((err) => {
        logger.warn("Failed to cleanup previous image after replacement", {
          message: err?.message,
        });
      });
    }

    return { uploaded, result };
  } catch (error) {
    await deleteStoredFile(uploaded).catch((err) => {
      logger.warn("Failed to rollback newly uploaded image after DB error", {
        message: err?.message,
      });
    });
    throw error;
  }
}
