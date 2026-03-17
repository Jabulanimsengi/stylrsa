// backend/src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  getSignature(params?: Record<string, any>): { signature: string; timestamp: number;[key: string]: any } {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Build parameters object - include any params passed from frontend
    const paramsToSign: Record<string, any> = {
      timestamp: timestamp,
      ...params, // Include folder, public_id, etc. if provided
    };

    // Remove undefined values and empty strings
    Object.keys(paramsToSign).forEach(key => {
      if (paramsToSign[key] === undefined || paramsToSign[key] === '') {
        delete paramsToSign[key];
      }
    });

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string,
    );

    return {
      timestamp,
      signature,
      ...paramsToSign // Return the params so frontend knows what was signed
    };
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'salon-images',
          resource_type: 'image',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'salon-videos',
          resource_type: 'video',
          // Remove auto format - ensure MP4 for browser compatibility
          format: 'mp4',
          transformation: [
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'documents'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Allows PDFs, docs, etc.
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteVideo(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: 'video' }, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
}
