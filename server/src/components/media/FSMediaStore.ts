import fs from "fs/promises";
import path from "path";
import { ImageMeta, ImageMetas, MediaStore, NoteImage } from "./MediaStore";

const MEDIA_DIR_NAME = "media";

export function createFSMediaStore(mtHome: string): MediaStore {
  const mediaPath = path.join(mtHome, MEDIA_DIR_NAME);

  async function ensureMediaDir(): Promise<void> {
    try {
      await fs.mkdir(mediaPath, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
  }

  async function getImagesForNote(noteId: string): Promise<ImageMetas> {
    const result: ImageMetas = {};

    try {
      const files = await fs.readdir(mediaPath);
      const prefix = `${noteId}__`;

      for (const f of files) {
        if (f.startsWith(prefix)) {
          const meta: ImageMeta = {
            url: `/media/${f}`,
            ratio: null,
          };
          result[f] = meta;
        }
      }
    } catch (err) {
      // Media directory might not exist, return empty result
    }

    return result;
  }

  async function listImages(noteId: string): Promise<NoteImage[]> {
    const result: NoteImage[] = [];

    try {
      const files = await fs.readdir(mediaPath);
      const prefix = `${noteId}__`;

      for (const file of files) {
        if (file.startsWith(prefix)) {
          const filePath = path.join(mediaPath, file);
          const stat = await fs.stat(filePath);

          result.push({
            id: file,
            name: file,
            url: `/media/${file}`,
            created_at: stat.birthtime.toISOString(),
          });
        }
      }
    } catch (err) {
      // Media directory might not exist, return empty result
    }

    return result;
  }

  async function uploadImage(
    noteId: string,
    filename: string,
    data: Buffer,
  ): Promise<NoteImage> {
    await ensureMediaDir();

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fullFilename = `${noteId}__${sanitizedFilename}`;
    const filePath = path.join(mediaPath, fullFilename);

    await fs.writeFile(filePath, data);
    const stat = await fs.stat(filePath);

    return {
      id: fullFilename,
      name: fullFilename,
      url: `/media/${fullFilename}`,
      created_at: stat.birthtime.toISOString(),
    };
  }

  async function deleteImage(imageId: string): Promise<void> {
    const filePath = path.join(mediaPath, imageId);
    await fs.unlink(filePath);
  }

  return {
    getImagesForNote,
    listImages,
    uploadImage,
    deleteImage,
  };
}
