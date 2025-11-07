import { Request, Response, NextFunction } from 'express';
import { postService } from './post.service';
import profileService from '../profile/profile.service.supabase';

export class PostController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        countryId, 
        categoryId, 
        title, 
        content,
        locationPlaceId,
        locationName,
        locationAddress,
        locationLat,
        locationLng
      } = req.body;
      const userId = req.user!.id;
      
      // Images from multer (if uploaded)
      const images = req.files ? (req.files as Express.Multer.File[]).map(f => `/uploads/${f.filename}`) : [];

      const post = await postService.createPost({
        authorId: userId,
        countryId,
        categoryId,
        title,
        content,
        images,
        locationPlaceId,
        locationName,
        locationAddress,
        locationLat: locationLat ? parseFloat(locationLat as string) : undefined,
        locationLng: locationLng ? parseFloat(locationLng as string) : undefined,
      });

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorId, countryId, categoryId, limit } = req.query;

      const posts = await postService.getAllPosts({
        authorId: authorId as string,
        countryId: countryId as string,
        categoryId: categoryId as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      // Fetch fresh profile data from Supabase for each author
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            const freshProfile = await profileService.getProfileByUserId(post.authorId);
            return {
              ...post,
              author: {
                ...post.author,
                profile: freshProfile ? {
                  firstName: freshProfile.firstName,
                  lastName: freshProfile.lastName,
                  photoUrl: freshProfile.photoUrl,
                } : post.author?.profile
              }
            };
          } catch (error) {
            console.error(`Failed to fetch profile for user ${post.authorId}:`, error);
            return post;
          }
        })
      );

      res.json({
        success: true,
        data: enrichedPosts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: { code: 'POST_NOT_FOUND', message: 'Post not found' },
        });
      }

      // Fetch fresh profile data from Supabase for author
      try {
        const freshProfile = await profileService.getProfileByUserId(post.authorId);
        if (freshProfile) {
          post.author = {
            ...post.author,
            profile: {
              firstName: freshProfile.firstName,
              lastName: freshProfile.lastName,
              photoUrl: freshProfile.photoUrl,
            }
          };
        }
      } catch (error) {
        console.error(`Failed to fetch author profile:`, error);
      }

      // Fetch fresh profile data for all commenters
      if (post.comments && post.comments.length > 0) {
        post.comments = await Promise.all(
          post.comments.map(async (comment: any) => {
            try {
              const freshProfile = await profileService.getProfileByUserId(comment.userId);
              return {
                ...comment,
                user: {
                  ...comment.user,
                  profile: freshProfile ? {
                    firstName: freshProfile.firstName,
                    lastName: freshProfile.lastName,
                    photoUrl: freshProfile.photoUrl,
                  } : comment.user?.profile
                }
              };
            } catch (error) {
              console.error(`Failed to fetch commenter profile:`, error);
              return comment;
            }
          })
        );
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async like(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await postService.likePost(userId, id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user!.id;

      const comment = await postService.addComment(userId, id, content);

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await postService.deletePost(id, userId);

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { countryId, categoryId, title, content } = req.body;

      const updatedPost = await postService.updatePost(
        id,
        userId,
        { countryId, categoryId, title, content }
      );

      res.json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      const result = await postService.getAllPostsForAdmin(page, limit, search);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await postService.deletePostByAdmin(id);

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();

