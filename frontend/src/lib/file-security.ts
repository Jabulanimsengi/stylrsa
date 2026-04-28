// File validation and security utilities
import { fileValidation } from './file-validation';

// MIME type whitelist for different file categories
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
] as const;

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo' // .avi
] as const;

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// File extension validation
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

export interface FileSecurityOptions {
  maxSize?: number;
  allowedTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  requireExtensionMatch?: boolean;
}

/**
 * Comprehensive file validation for upload security
 */
export function validateUploadFile(
  file: File,
  category: 'image' | 'video' = 'image'
): FileValidationResult {
  // Use existing validation as base
  const baseValidation = fileValidation.validateFile(file, category);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const options: FileSecurityOptions = category === 'image' 
    ? {
        maxSize: MAX_IMAGE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        requireExtensionMatch: true
      }
    : {
        maxSize: MAX_VIDEO_SIZE,
        allowedTypes: ALLOWED_VIDEO_TYPES,
        allowedExtensions: ALLOWED_VIDEO_EXTENSIONS,
        requireExtensionMatch: true
      };

  return validateFileSecurely(file, options);
}

/**
 * Enhanced file validation with security checks
 */
export function validateFileSecurely(
  file: File,
  options: FileSecurityOptions
): FileValidationResult {
  const {
    maxSize = MAX_IMAGE_SIZE,
    allowedTypes = ALLOWED_IMAGE_TYPES,
    allowedExtensions = ALLOWED_IMAGE_EXTENSIONS,
    requireExtensionMatch = true
  } = options;

  // 1. File size validation
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum allowed: ${formatFileSize(maxSize)}`
    };
  }

  // 2. MIME type validation
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // 3. File extension validation
  const fileExtension = getFileExtension(file.name).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
    };
  }

  // 4. MIME type and extension consistency check
  if (requireExtensionMatch && !isMimeTypeExtensionMatch(file.type, fileExtension)) {
    return {
      isValid: false,
      error: 'File type and extension do not match'
    };
  }

  // 5. Filename sanitization
  const sanitizedName = sanitizeFileName(file.name);

  // 6. Additional security checks
  const securityCheck = performAdditionalSecurityChecks(file);
  if (!securityCheck.isValid) {
    return securityCheck;
  }

  return {
    isValid: true,
    sanitizedName
  };
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove directory traversal attempts
  let sanitized = fileName.replace(/[/\\:*?"<>|]/g, '');
  
  // Remove leading/trailing spaces and dots
  sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - ext.length - 1);
    sanitized = truncatedName + ext;
  }
  
  // Ensure it's not empty after sanitization
  if (!sanitized || sanitized === '') {
    const timestamp = Date.now();
    sanitized = `file_${timestamp}`;
  }
  
  return sanitized;
}

/**
 * Get file extension including the dot
 */
function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot);
}

/**
 * Check if MIME type matches file extension
 */
function isMimeTypeExtensionMatch(mimeType: string, extension: string): boolean {
  const mimeToExtension: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/quicktime': ['.mov'],
    'video/x-msvideo': ['.avi']
  };

  const validExtensions = mimeToExtension[mimeType];
  return validExtensions ? validExtensions.includes(extension) : false;
}

/**
 * Additional security checks
 */
function performAdditionalSecurityChecks(file: File): FileValidationResult {
  // Check for suspicious filenames
  const suspiciousPatterns = [
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.sh$/i,
    /\.scr$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'Potentially dangerous file type detected'
      };
    }
  }

  // Check for zero-byte files
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Empty files are not allowed'
    };
  }

  return { isValid: true };
}

/**
 * Format file size for human readability
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Content sanitization for user-generated content
 */
export function sanitizeUserContent(content: string): string {
  // Remove potentially dangerous HTML tags and attributes
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
    /onmouseover=/gi
  ];

  let sanitized = content;
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Limit length to prevent DoS
  const maxLength = 10000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }

  return sanitized;
}

/**
 * Rate limiting for file uploads (client-side tracking)
 */
class UploadRateLimiter {
  private uploads: Map<string, number[]> = new Map();
  private readonly maxUploadsPerMinute = 10;
  private readonly windowMs = 60 * 1000; // 1 minute

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userUploads = this.uploads.get(userId) || [];
    
    // Remove old uploads outside the window
    const recentUploads = userUploads.filter(time => now - time < this.windowMs);
    
    if (recentUploads.length >= this.maxUploadsPerMinute) {
      return false;
    }

    // Record this upload
    recentUploads.push(now);
    this.uploads.set(userId, recentUploads);
    
    return true;
  }

  getRemainingUploads(userId: string): number {
    const now = Date.now();
    const userUploads = this.uploads.get(userId) || [];
    const recentUploads = userUploads.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxUploadsPerMinute - recentUploads.length);
  }
}

export const uploadRateLimiter = new UploadRateLimiter();
