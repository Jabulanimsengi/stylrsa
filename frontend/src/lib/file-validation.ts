/**
 * Client-side file validation utilities
 * Validates files BEFORE uploading to prevent malicious uploads
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_UPLOAD = 10;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Validate a single image file
 */
export function validateImageFile(file: File): void {
  // Check if file exists
  if (!file) {
    throw new FileValidationError('No file provided');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
    );
  }

  // Check if file is empty
  if (file.size === 0) {
    throw new FileValidationError('File is empty');
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new FileValidationError(
      `Invalid file type "${file.type}". Allowed types: JPEG, PNG, WebP, GIF`
    );
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    throw new FileValidationError(
      `Invalid file extension. Allowed extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
    );
  }

  // Check for executable files disguised as images
  if (fileName.match(/\.(exe|bat|cmd|sh|dll|scr|vbs|js|jar)$/i)) {
    throw new FileValidationError('Executable files are not allowed');
  }
}

/**
 * Validate multiple image files
 */
export function validateImageFiles(files: File[]): void {
  if (!files || files.length === 0) {
    throw new FileValidationError('No files provided');
  }

  if (files.length > MAX_IMAGES_PER_UPLOAD) {
    throw new FileValidationError(
      `Too many files. Maximum ${MAX_IMAGES_PER_UPLOAD} images per upload.`
    );
  }

  // Validate each file
  files.forEach((file, index) => {
    try {
      validateImageFile(file);
    } catch (error) {
      if (error instanceof FileValidationError) {
        throw new FileValidationError(`File ${index + 1} (${file.name}): ${error.message}`);
      }
      throw error;
    }
  });

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = MAX_FILE_SIZE * files.length;
  
  if (totalSize > maxTotalSize) {
    throw new FileValidationError(
      `Total files size too large. Maximum total size is ${(maxTotalSize / 1024 / 1024).toFixed(0)}MB`
    );
  }
}

/**
 * Validate image file and read as data URL (for preview)
 * Returns a promise that resolves with the data URL
 */
export async function validateAndReadImageFile(file: File): Promise<string> {
  validateImageFile(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        // Additional validation: check if it's actually an image
        const img = new Image();
        img.onload = () => {
          // Image loaded successfully, it's valid
          resolve(result);
        };
        img.onerror = () => {
          reject(new FileValidationError('File is not a valid image'));
        };
        img.src = result;
      } else {
        reject(new FileValidationError('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new FileValidationError('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if a file is an image by checking magic numbers
 * This is more reliable than checking MIME types
 */
export async function isValidImageByContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      
      // Check magic numbers for common image formats
      
      // JPEG: FF D8 FF
      if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
        resolve(true);
        return;
      }
      
      // PNG: 89 50 4E 47
      if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
        resolve(true);
        return;
      }
      
      // GIF: 47 49 46 38
      if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) {
        resolve(true);
        return;
      }
      
      // WebP: 52 49 46 46 ... 57 45 42 50
      if (
        arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
        arr.length >= 12 &&
        arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50
      ) {
        resolve(true);
        return;
      }
      
      resolve(false);
    };
    
    reader.onerror = () => resolve(false);
    
    // Read first 12 bytes to check magic numbers
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters
    .replace(/\.{2,}/g, '_') // Prevent directory traversal (..)
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

export function validateFile(file: File, category: 'image' | 'video' = 'image') {
  try {
    if (category === 'image') {
      validateImageFile(file);
      return { isValid: true, sanitizedName: sanitizeFilename(file.name) };
    }

    if (!file) {
      throw new FileValidationError('No file provided');
    }
    if (file.size === 0) {
      throw new FileValidationError('File is empty');
    }
    return { isValid: true, sanitizedName: sanitizeFilename(file.name) };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid file',
    };
  }
}

export const fileValidation = {
  validateFile,
  validateImageFile,
  validateImageFiles,
  validateAndReadImageFile,
  isValidImageByContent,
  sanitizeFilename,
};
