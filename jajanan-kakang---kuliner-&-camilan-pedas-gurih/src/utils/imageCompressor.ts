/**
 * Client-side image compressor for food menu and store photos.
 * Compresses local device photos into an optimized Base64 Data URI (~30-60KB)
 * that fits cleanly into Firebase Firestore documents for instantaneous real-time sync.
 */
export async function compressImageFile(file: File, maxWidth = 640, maxHeight = 480, quality = 0.82): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa gambar (JPG, PNG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompres'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas context unavailable
          const rawUrl = reader.result as string;
          resolve({ dataUrl: rawUrl, sizeKb: Math.round(rawUrl.length / 1024) });
          return;
        }

        // Draw image onto canvas with high smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data url
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({ dataUrl, sizeKb });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
