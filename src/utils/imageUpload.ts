// Image upload utilities
export interface UploadedImage {
  file: File;
  preview: string;
  name: string;
  size: number;
}

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPG, PNG ou WebP.'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Fichier trop volumineux. Maximum 5MB.'
    };
  }

  return { valid: true };
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Simulate image storage (in a real app, this would upload to Firebase Storage or similar)
export const storeImage = async (file: File): Promise<string> => {
  // Compress the image
  const compressedFile = await compressImage(file);
  
  // Create a blob URL for local storage simulation
  const imageUrl = URL.createObjectURL(compressedFile);
  
  // In a real implementation, you would upload to Firebase Storage:
  // const storageRef = ref(storage, `images/${generateImageId()}`);
  // const snapshot = await uploadBytes(storageRef, compressedFile);
  // return await getDownloadURL(snapshot.ref);
  
  return imageUrl;
};

export const deleteStoredImage = (imageUrl: string): void => {
  // Clean up blob URL
  if (imageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl);
  }
  
  // In a real implementation, you would delete from Firebase Storage:
  // const imageRef = ref(storage, imageUrl);
  // deleteObject(imageRef);
};