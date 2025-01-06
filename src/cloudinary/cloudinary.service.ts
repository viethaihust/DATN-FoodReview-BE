import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './types/cloudinary-response';
import * as sharp from 'sharp';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  private optimizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width: 2560,
        fit: 'inside',
      })
      .jpeg({ quality: 100 })
      .toBuffer();
  }

  private uploadStream(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const resourceType = file.mimetype.startsWith('video/')
        ? 'video'
        : 'image';

      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    if (resourceType === 'image') {
      const optimizedBuffer = await this.optimizeImage(file.buffer);
      file.buffer = optimizedBuffer;
    }

    return this.uploadStream(file);
  }

  async deleteFile(
    publicId: string,
    resourceType: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFiles(
    publicIds: string[],
    resourceTypes: string[],
  ): Promise<CloudinaryResponse[]> {
    const deletePromises = publicIds.map((publicId, index) => {
      return this.deleteFile(publicId, resourceTypes[index]);
    });
    return Promise.all(deletePromises);
  }
}
