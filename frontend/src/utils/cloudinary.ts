type TransformOpts = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  dpr?: 'auto' | number; // Device pixel ratio for retina displays
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  aspectRatio?: string; // e.g., '16:9', '1:1'
  blur?: number;
  sharpen?: boolean;
};

export interface CloudinaryUploadResponse {
  public_id?: string;
  secure_url: string;
  [key: string]: unknown;
}

function parseCloudinaryUploadResponse(payload: string): CloudinaryUploadResponse {
  const parsed = JSON.parse(payload) as Partial<CloudinaryUploadResponse>;

  if (!parsed.secure_url || typeof parsed.secure_url !== 'string') {
    throw new Error('Cloudinary upload response did not include a secure URL.');
  }

  return parsed as CloudinaryUploadResponse;
}

/**
 * Transform Cloudinary image URLs with optimizations
 * @param url - Original Cloudinary URL
 * @param opts - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function transformCloudinary(url: string, opts: TransformOpts = {}): string {
  if (!url || !url.includes('/image/upload/')) return url;
  
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good', // Better default quality
    format = 'auto',       // Auto-selects WebP/AVIF
    dpr = 'auto',         // Auto device pixel ratio
    gravity,
    aspectRatio,
    blur,
    sharpen = false,
  } = opts;
  
  const parts = url.split('/image/upload/');
  const transforms: string[] = [];
  
  // Dimensions
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (aspectRatio) transforms.push(`ar_${aspectRatio}`);
  
  // Cropping and positioning
  if (crop) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  
  // Quality and format (always optimize)
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  
  // DPR for retina displays
  if (dpr) transforms.push(`dpr_${dpr}`);
  
  // Effects
  if (blur) transforms.push(`e_blur:${blur}`);
  if (sharpen) transforms.push('e_sharpen');
  
  // Additional optimizations
  transforms.push('fl_progressive'); // Progressive JPEG
  transforms.push('fl_preserve_transparency'); // Preserve PNG transparency
  
  const t = transforms.join(',');
  return `${parts[0]}/image/upload/${t}/${parts[1]}`;
}

/**
 * Preset transformations for common use cases
 */
export const cloudinaryPresets = {
  thumbnail: (url: string) => transformCloudinary(url, {
    width: 150,
    height: 150,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:eco',
  }),
  
  card: (url: string) => transformCloudinary(url, {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
  }),
  
  hero: (url: string) => transformCloudinary(url, {
    width: 1200,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:best',
  }),
  
  profile: (url: string) => transformCloudinary(url, {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
  }),
  
  gallery: (url: string) => transformCloudinary(url, {
    width: 800,
    crop: 'limit',
    quality: 'auto:good',
  }),
};

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Upload timed out. Please check your connection and try again with a smaller file.');
    }
    throw error;
  }
}

export async function uploadToCloudinary(
  file: File | Blob, 
  options?: { 
    folder?: string; 
    publicId?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<CloudinaryUploadResponse> {
  // Validate file before upload (security check)
  if (file instanceof File) {
    const { validateImageFile, isValidImageByContent } = await import('@/lib/file-validation');
    
    try {
      validateImageFile(file);
      
      // Additional check: validate by content (magic numbers)
      const isValidImage = await isValidImageByContent(file);
      if (!isValidImage) {
        throw new Error('File content does not match image format. This file may be corrupted or not a real image.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`File validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary is not configured. Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_API_KEY.');
  }

  // Determine public_id BEFORE requesting signature (important for signature validation)
  let finalPublicId = options?.publicId;
  if (!finalPublicId && file instanceof File && file.name) {
    // Auto-generate public_id from filename (remove extension, sanitize)
    finalPublicId = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars
      .substring(0, 100); // Limit length
  }

  // Build query string with ALL upload parameters so they're included in the signature
  const signatureParams = new URLSearchParams();
  if (options?.folder) signatureParams.append('folder', options.folder);
  if (finalPublicId) signatureParams.append('public_id', finalPublicId);
  
  const signatureUrl = `/api/cloudinary/signature${signatureParams.toString() ? '?' + signatureParams.toString() : ''}`;
  const sigRes = await fetchWithTimeout(signatureUrl, { credentials: 'include' }, 30000);
  if (!sigRes.ok) {
    throw new Error('Could not get upload signature. Please try again.');
  }
  const { signature, timestamp } = await sigRes.json();

  // Build form with exact same parameters that were signed
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  if (options?.folder) form.append('folder', options.folder);
  if (finalPublicId) form.append('public_id', finalPublicId);
  form.append('signature', signature);

  // Use XMLHttpRequest if progress callback provided, otherwise use fetch
  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && options.onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          options.onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(parseCloudinaryUploadResponse(xhr.responseText));
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
            reject(errorResponse);
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });
      
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });
      
      xhr.timeout = 120000; // 2 minute timeout
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(form);
    });
  } else {
    // Fallback to fetch without progress
    const uploadRes = await fetchWithTimeout(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: form,
      },
      120000 // 2 minute timeout for large files
    );
    if (!uploadRes.ok) {
      let errorResponse: unknown = null;
      try {
        errorResponse = await uploadRes.json();
      } catch {}
      throw errorResponse || new Error('Upload failed.');
    }
    return parseCloudinaryUploadResponse(await uploadRes.text());
  }
}
