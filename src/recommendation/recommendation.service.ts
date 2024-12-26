import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TfIdf } from 'natural';
import { ReviewPostsService } from 'src/review-posts/review-posts.service';
import { ReviewPost } from 'src/review-posts/schema/reviewPost.schema';
import { UserInteractionService } from 'src/user-interaction/user-interaction.service';
import { Recommendation } from './schema/recommendation.schema';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly userInteractionService: UserInteractionService,
    private readonly reviewPostsService: ReviewPostsService,
    @InjectModel(ReviewPost.name) private postModel: Model<ReviewPost>,
    @InjectModel(Recommendation.name)
    private recommendationModel: Model<Recommendation>,
  ) {}

  private preprocessText(text: string): string[] {
    const normalizedText = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const tokens = normalizedText.split(/\s+/);
    return tokens.filter((token) => token.length > 0);
  }

  private getPostVector(post: ReviewPost): number[] {
    const cleanedTitle = this.preprocessText(post.title);
    const cleanedContent = this.preprocessText(post.content);

    const allTerms = cleanedTitle.concat(cleanedContent);
    const localTfIdf = new TfIdf();
    localTfIdf.addDocument(allTerms.join(' '));

    const vector: number[] = [];
    allTerms.forEach((term) => {
      const tfidfScore = localTfIdf.tfidf(term, 0);
      vector.push(tfidfScore || 0);
    });

    return this.normalizeVector(vector);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
    return vector.map((val) => (magnitude ? val / magnitude : 0));
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    // Calculate dot product
    const dotProduct = vecA.reduce(
      (sum, value, index) => sum + value * vecB[index],
      0,
    );

    // Calculate magnitudes
    const magnitudeA = Math.sqrt(
      vecA.reduce((sum, value) => sum + value ** 2, 0),
    );
    const magnitudeB = Math.sqrt(
      vecB.reduce((sum, value) => sum + value ** 2, 0),
    );

    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  async calculateCosineSimilarity(
    postId1: string,
    postId2: string,
  ): Promise<number> {
    const post1 = await this.postModel.findById(postId1).exec();
    const post2 = await this.postModel.findById(postId2).exec();

    if (!post1 || !post2) {
      throw new Error('Posts not found');
    }

    const vectorA = this.getPostVector(post1);
    const vectorB = this.getPostVector(post2);

    console.log('vectorA', vectorA);

    return this.cosineSimilarity(vectorA, vectorB);
  }

  //   async recommendPosts(userId: string) {
  //     const interactedPostIds =
  //       await this.userInteractionService.getUserInteractions(userId);

  //     const allPosts = await this.postModel.find().exec();

  //     const filteredPosts = allPosts.filter(
  //       (post) =>
  //         !interactedPostIds.some(
  //           (interactedId) => interactedId.toString() === post._id.toString(),
  //         ),
  //     );

  //     if (filteredPosts.length === 0) {
  //       return this.postModel.find().limit(5).exec();
  //     }

  //     const userPosts =
  //       await this.reviewPostsService.findManyByIds(interactedPostIds);
  //     const similarities = userPosts.flatMap((userPost) =>
  //       filteredPosts.map((post) => ({
  //         post,
  //         similarity: this.calculateCosineSimilarity(userPost, post),
  //       })),
  //     );

  //     similarities.sort((a, b) => b.similarity - a.similarity);
  //     const topRecommendations = similarities.slice(0, 5);

  //     const recommendationDocuments = topRecommendations.map((item) => ({
  //       userId: new Types.ObjectId(userId),
  //       postId: item.post._id,
  //       similarity: item.similarity || 0,
  //     }));

  //     await this.recommendationModel.insertMany(recommendationDocuments);

  //     return topRecommendations.map((item) => ({
  //       post: item.post,
  //       similarity: item.similarity,
  //     }));
  //   }
}
