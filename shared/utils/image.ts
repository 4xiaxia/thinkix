import type { DataURL, ImageItem } from '@/shared/types/image';


export async function loadImageElement(
  dataURL: DataURL
): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = dataURL;
  });
}

export async function buildImageItem(
  image: HTMLImageElement,
  dataURL: DataURL,
  maxWidth: number
): Promise<ImageItem> {
  const width = image.width > maxWidth ? maxWidth : image.width;
  const height = (width / image.width) * image.height;
  return {
    url: dataURL,
    width,
    height,
  };
}


export async function fileToDataURL(file: File): Promise<DataURL> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as DataURL);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}


export function isSupportedImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}


export async function loadImageFromFile(
  file: File,
  maxWidth: number
): Promise<ImageItem> {
  if (!isSupportedImageType(file.type)) {
    throw new Error('Unsupported file type');
  }

  const dataURL = await fileToDataURL(file);
  const imageElement = await loadImageElement(dataURL);
  return buildImageItem(imageElement, dataURL, maxWidth);
}
