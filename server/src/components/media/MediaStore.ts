export interface ImageMeta {
  url: string;
  ratio: number | null;
}

export type ImageMetas = Record<string, ImageMeta>;

export interface NoteImage {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface MediaStore {
  getImagesForNote(noteId: string): Promise<ImageMetas>;
  listImages(noteId: string): Promise<NoteImage[]>;
  uploadImage(
    noteId: string,
    filename: string,
    data: Buffer,
  ): Promise<NoteImage>;
  deleteImage(imageId: string): Promise<void>;
}
