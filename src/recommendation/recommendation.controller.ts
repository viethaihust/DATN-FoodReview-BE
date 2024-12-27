import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { RecommendationService } from './recommendation.service';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Public()
  @Get('/similar-between-posts/:postId1/:postId2')
  async getCosineSimilarity(
    @Param('postId1') postId1: string,
    @Param('postId2') postId2: string,
  ) {
    const similarity =
      await this.recommendationService.calculateCosineSimilarityBetweenPosts(
        postId1,
        postId2,
      );
    return { similarity };
  }

  @Public()
  @Get('/test')
  async getTest() {
    return this.recommendationService.calculateSimilaritiesForAllPosts();
  }

  @Public()
  @Get('/similar-posts/:id')
  async getSimilar(@Param('id') id: string) {
    return this.recommendationService.getSimilarPosts(id);
  }

  @Public()
  @Get('/for-user/:userId')
  async getRecommendations(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendationsForUser(userId);
  }
}
