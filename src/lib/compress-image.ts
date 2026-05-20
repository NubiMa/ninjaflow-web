/**
 * Client-side image compression utility.
 * Uses browser Canvas API — no external dependencies.
 * Reduces images to ~800x800px at quality 0.75 before AI submission.
 */

export interface CompressedImage {
  base64: string;
  mimeType: string;
  sizeKB: number;
}

export async function compressImage(
  file: File,
  maxDimension = 600,
  quality = 0.6
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate scaled dimensions
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));

          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            // Strip the data:image/jpeg;base64, prefix
            const base64 = dataUrl.split(",")[1];
            resolve({
              base64,
              mimeType: "image/jpeg",
              sizeKB: Math.round(blob.size / 1024),
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal memuat gambar"));
    };

    img.src = url;
  });
}

export async function captureVideoFrame(
  video: HTMLVideoElement,
  quality = 0.6
): Promise<CompressedImage> {
  const canvas = document.createElement("canvas");
  const maxDimension = 600;

  let { videoWidth: width, videoHeight: height } = video;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(video, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Frame capture failed"));

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          resolve({
            base64,
            mimeType: "image/jpeg",
            sizeKB: Math.round(blob.size / 1024),
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      quality
    );
  });
}
