import { Injectable, BadRequestException } from '@nestjs/common';
import * as vision from '@google-cloud/vision';

@Injectable()
export class ImageModerationService {
  private client: vision.ImageAnnotatorClient;

  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async analyzeImage(file: Express.Multer.File): Promise<boolean> {
    try {
      const [result] = await this.client.safeSearchDetection(file.buffer);
      const detections = result.safeSearchAnnotation;

      if (!detections) {
        throw new BadRequestException('Failed to analyze image.');
      }

      const { adult, violence, racy } = detections;

      if (
        adult === 'LIKELY' ||
        adult === 'VERY_LIKELY' ||
        racy === 'LIKELY' ||
        racy === 'VERY_LIKELY'
      ) {
        return false; // Unsafe content
      }

      return true; // Safe content
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new BadRequestException('Error processing the image.');
    }
  }
}
