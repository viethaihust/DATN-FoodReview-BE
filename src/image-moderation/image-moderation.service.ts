import { Injectable, BadRequestException } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';

@Injectable()
export class ImageModerationService {
  private client: ImageAnnotatorClient;

  private async getClient() {
    if (!this.client) {
      try {
        this.client = new ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
      } catch (error) {
        throw new BadRequestException(
          'Failed to initialize Google Cloud Vision client.',
        );
      }
    }
    return this.client;
  }

  async analyzeImage(file: Express.Multer.File): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (file.mimetype.startsWith('video/')) {
        return true;
      }

      const [result] = await client.safeSearchDetection(file.buffer);
      const detections = result.safeSearchAnnotation;

      if (!detections) {
        throw new BadRequestException('Failed to analyze image.');
      }

      const { adult, racy, violence } = detections;

      if (
        violence === 'LIKELY' ||
        violence === 'VERY_LIKELY' ||
        adult === 'LIKELY' ||
        adult === 'VERY_LIKELY' ||
        racy === 'LIKELY' ||
        racy === 'VERY_LIKELY'
      ) {
        return false; // Unsafe content
      }

      return true; // Safe content
    } catch (error) {
      throw new BadRequestException(`Error analyzing image: ${error.message}`);
    }
  }
}
