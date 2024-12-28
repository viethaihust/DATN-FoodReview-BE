import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReviewPost } from 'src/review-posts/schema/reviewPost.schema';
import { UserInteractionService } from 'src/user-interaction/user-interaction.service';
import { Recommendation } from './schema/recommendation.schema';
import { ReviewPostsService } from 'src/review-posts/review-posts.service';
// import * as fs from 'fs';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectModel(ReviewPost.name) private postModel: Model<ReviewPost>,
    @InjectModel(Recommendation.name)
    private readonly recommendationModel: Model<Recommendation>,
    private readonly userInteractionService: UserInteractionService,
    private readonly reviewPostsService: ReviewPostsService,
  ) {}

  private globalVocabulary: Set<string> = new Set();
  private documentFrequencies: Map<string, number> = new Map();
  private termFrequencyVectors: Map<number, Map<string, number>> = new Map();

  private tokenize(text: string): string[] {
    return text
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .toLowerCase() // Convert to lowercase
      .split(/[^a-zA-Z0-9À-ỹ]+/u) // Tokenize using Unicode-aware regex for Vietnamese
      .filter((token) => token.trim().length > 0); // Filter out empty tokens
  }

  private buildVocabulary(posts: ReviewPost[]): void {
    this.globalVocabulary.clear();
    this.documentFrequencies.clear();

    posts.forEach((post, index) => {
      const tokens = new Set(this.tokenize(`${post.title} ${post.content}`));
      tokens.forEach((token) => {
        this.globalVocabulary.add(token);
        this.documentFrequencies.set(
          token,
          (this.documentFrequencies.get(token) || 0) + 1,
        );
      });
    });
  }

  private calculateTermFrequency(posts: ReviewPost[]): void {
    this.termFrequencyVectors.clear();

    posts.forEach((post, index) => {
      const tokens = this.tokenize(`${post.title} ${post.content}`);
      const termCount: Map<string, number> = new Map();

      tokens.forEach((token) => {
        termCount.set(token, (termCount.get(token) || 0) + 1);
      });

      const termFrequency: Map<string, number> = new Map();
      const totalTerms = tokens.length;

      termCount.forEach((count, token) => {
        termFrequency.set(token, count / totalTerms);
      });

      this.termFrequencyVectors.set(index, termFrequency);
    });
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, value) => sum + value * value, 0),
    );
    return magnitude === 0 ? vector : vector.map((value) => value / magnitude);
  }

  private calculateTfIdfVector(docIndex: number): number[] {
    const termFrequency = this.termFrequencyVectors.get(docIndex);
    if (!termFrequency) return [];

    const vector: number[] = Array.from(this.globalVocabulary).map((token) => {
      const tf = termFrequency.get(token) || 0;
      const df = this.documentFrequencies.get(token) || 1;
      const idf = Math.log(this.termFrequencyVectors.size / df);
      return tf * idf;
    });

    return this.normalizeVector(vector);
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce(
      (sum, value, index) => sum + value * (vectorB[index] || 0),
      0,
    );

    const magnitudeA = Math.sqrt(
      vectorA.reduce((sum, value) => sum + value * value, 0),
    );
    const magnitudeB = Math.sqrt(
      vectorB.reduce((sum, value) => sum + value * value, 0),
    );

    return magnitudeA && magnitudeB
      ? dotProduct / (magnitudeA * magnitudeB)
      : 0;
  }

  async calculateSimilaritiesForAllPosts(): Promise<void> {
    const allPosts: ReviewPost[] = await this.postModel.find().exec();

    // Build vocabulary and calculate term frequencies
    this.buildVocabulary(allPosts);
    this.calculateTermFrequency(allPosts);

    // Calculate TF-IDF vectors
    const tfIdfVectors = allPosts.map((_post, index) =>
      this.calculateTfIdfVector(index),
    );

    // Calculate cosine similarity and save recommendations
    for (let i = 0; i < tfIdfVectors.length; i++) {
      for (let j = i + 1; j < tfIdfVectors.length; j++) {
        const similarity = this.cosineSimilarity(
          tfIdfVectors[i],
          tfIdfVectors[j],
        );

        if (similarity > 0) {
          await this.recommendationModel.create({
            post1: allPosts[i]._id,
            post2: allPosts[j]._id,
            similarity,
          });
        }
      }
    }
  }

  async calculateCosineSimilarityBetweenPosts(
    postId1: string,
    postId2: string,
  ): Promise<number> {
    const allPosts: ReviewPost[] = await this.postModel.find().exec();
    const post1 = await this.postModel.findById(postId1).exec();
    const post2 = await this.postModel.findById(postId2).exec();

    if (!post1 || !post2) {
      throw new Error('One or both posts not found');
    }

    // Build vocabulary and term frequencies for the two posts
    this.buildVocabulary(allPosts);
    this.calculateTermFrequency(allPosts);

    const post1Index = allPosts.findIndex(
      (post) => post._id.toString() === post1._id.toString(),
    );

    const post2Index = allPosts.findIndex(
      (post) => post._id.toString() === post2._id.toString(),
    );

    // Calculate TF-IDF vectors for the posts
    const vectorA = this.calculateTfIdfVector(post1Index); // First post
    const vectorB = this.calculateTfIdfVector(post2Index); // Second post

    return this.cosineSimilarity(vectorA, vectorB);
  }

  async getSimilarPosts(postId: string): Promise<ReviewPost[]> {
    const allPosts: ReviewPost[] = await this.postModel.find().exec();
    const targetPost = await this.postModel.findById(postId).exec();

    if (!targetPost) {
      throw new Error('Target post not found');
    }

    // Build vocabulary and calculate term frequencies
    this.buildVocabulary(allPosts);
    this.calculateTermFrequency(allPosts);

    // Log all tokenized terms to a file
    // const termsLog = allPosts
    //   .map((post, index) => {
    //     const tokens = this.tokenize(`${post.title} ${post.content}`);
    //     return `Post ID: ${post._id}\nTokens: ${tokens.join(', ')}\n`;
    //   })
    //   .join('\n');

    // fs.writeFileSync('similar_posts_terms.log', termsLog);

    // Calculate the TF-IDF vector for the target post
    const targetIndex = allPosts.findIndex(
      (post) => post._id.toString() === postId,
    );

    const targetVector = this.calculateTfIdfVector(targetIndex);

    // Calculate cosine similarity with all other posts
    const similarities = allPosts
      .map((post, index) => {
        if (post._id.toString() === postId) return null; // Skip the target post
        const otherVector = this.calculateTfIdfVector(index);
        const similarity = this.cosineSimilarity(targetVector, otherVector);
        return { post: post, similarity };
      })
      .filter((result) => result !== null) as {
      post: ReviewPost;
      similarity: number;
    }[];

    const top = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return Promise.all(
      top.map(async (result) => {
        const populatedPost = await this.postModel
          .findById(result.post._id)
          .populate('userId', 'name image')
          .exec();
        return populatedPost;
      }),
    );
  }

  async getRecommendationsForUser(userId: string): Promise<ReviewPost[]> {
    const interactedPostIds =
      await this.userInteractionService.getUserInteractions(userId);

    if (interactedPostIds.length === 0) {
      return [];
    }

    const userInteractions =
      await this.reviewPostsService.findManyByIds(interactedPostIds);

    const allPosts: ReviewPost[] = await this.postModel.find().exec();

    const nonInteractedPosts = allPosts.filter(
      (post) =>
        !interactedPostIds.some(
          (interactedId) => interactedId.toString() === post._id.toString(),
        ),
    );

    // Build vocabulary and calculate term frequencies
    this.buildVocabulary(allPosts);
    this.calculateTermFrequency(allPosts);

    // Calculate similarity between non-interacted posts and interacted posts
    const recommendations = nonInteractedPosts.map((post) => {
      const postVector = this.calculateTfIdfVector(allPosts.indexOf(post));

      const highestSimilarity = Math.max(
        ...userInteractions.map((interaction) => {
          const interactedPost = allPosts.find(
            (p) => p._id.toString() === interaction._id.toString(),
          );
          if (!interactedPost) return 0;

          const interactedVector = this.calculateTfIdfVector(
            allPosts.indexOf(interactedPost),
          );
          return this.cosineSimilarity(postVector, interactedVector);
        }),
      );

      return { post, similarity: highestSimilarity };
    });

    // Sort by similarity in descending order and return the top 3 recommendations
    const topRecommendations = recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4);

    // Populate user details for the recommended posts
    return Promise.all(
      topRecommendations.map(async (recommendation) => {
        const populatedPost = await this.postModel
          .findById(recommendation.post._id)
          .populate('userId', 'name image')
          .exec();
        return populatedPost;
      }),
    );
  }
}
