export interface CompressedResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  percentageSaved: number;
  wasCompressed: boolean;
}

/**
 * Estimates byte size from a base64 data URL, accounting for padding.
 */
export const estimateBase64Size = (dataUrl: string): number => {
  const base64Part = dataUrl.split(',')[1];
  if (!base64Part) return 0;
  const padding = (base64Part.match(/=+$/) || [''])[0].length;
  return Math.round((base64Part.length * 3) / 4) - padding;
};

/**
 * Compresses a base64 image for clinic use (prescriptions, patient photos).
 * Always outputs JPEG — source images are camera/scanner captures, never transparent.
 * Rejects on invalid input. Resolves with original on load/draw failure.
 */
export const compressImage = (
  dataUrl: string,
  maxSize = 1280,
  quality = 0.75
): Promise<CompressedResult> => {
  return new Promise((resolve, reject) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
      reject(new Error('compressImage: dataUrl must be a non-empty string'));
      return;
    }

    if (!dataUrl.startsWith('data:image/')) {
      reject(new Error('compressImage: invalid data URL — must start with "data:image/"'));
      return;
    }

    const originalSize = estimateBase64Size(dataUrl);
    const fallback: CompressedResult = {
      dataUrl,
      originalSize,
      compressedSize: originalSize,
      percentageSaved: 0,
      wasCompressed: false,
    };

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('compressImage: timed out waiting for image to load'));
      }
    }, 10_000);

    const img = new Image();

    img.onerror = (event) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      console.error('compressImage: failed to load image', event);
      resolve(fallback);
    };

    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      try {
        let { width, height } = img;

        // Only downscale, never upscale
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          } else {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('compressImage: could not get 2D canvas context');
          resolve(fallback);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSize = estimateBase64Size(compressedDataUrl);

        if (compressedSize >= originalSize) {
          resolve(fallback);
          return;
        }

        const percentageSaved =
          originalSize > 0
            ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
            : 0;

        resolve({
          dataUrl: compressedDataUrl,
          originalSize,
          compressedSize,
          percentageSaved,
          wasCompressed: true,
        });
      } catch (err) {
        console.error('compressImage: canvas processing error', err);
        resolve(fallback);
      }
    };

    img.src = dataUrl;
  });
};

/**
 * Formats bytes into human-readable string.
 */
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 0) return 'Invalid size';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};