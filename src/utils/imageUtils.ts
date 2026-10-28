/**
 * Image processing utilities for Anime Quest.
 * Compresses images selected from phone gallery into lightweight data URLs
 * suitable for Firestore persistence without exceeding document limits.
 */

export function isImageUrl(str?: string | null): boolean {
  if (!str) return false;
  return str.startsWith('data:image') || str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
}

export function compressImageFromFile(
  file: File,
  maxSize = 350,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Veuillez sélectionner un fichier image valide depuis votre galerie.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossible de lire le fichier sélectionné.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format d’image non supporté.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Erreur canvas 2D context.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
