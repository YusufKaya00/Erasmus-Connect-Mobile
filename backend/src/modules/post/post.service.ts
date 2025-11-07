import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  async createPost(data: {
    authorId: string;
    countryId: string;
    categoryId: string;
    title: string;
    content: string;
    images?: string[];
    locationPlaceId?: string;
    locationName?: string;
    locationAddress?: string;
    locationLat?: number;
    locationLng?: number;
  }) {
    const post = await prisma.post.create({
      data: {
        authorId: data.authorId,
        countryId: data.countryId,
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        images: data.images || [],
        locationPlaceId: data.locationPlaceId,
        locationName: data.locationName,
        locationAddress: data.locationAddress,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
        country: true,
      },
    });

    return post;
  }

  async getAllPosts(filters?: {
    authorId?: string;
    countryId?: string;
    categoryId?: string;
    limit?: number;
  }) {
    const posts = await prisma.post.findMany({
      where: {
        ...(filters?.authorId && { authorId: filters.authorId }),
        ...(filters?.countryId && { countryId: filters.countryId }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
        country: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || undefined, // Apply limit if provided
    });

    return posts;
  }

  async getAllPostsForAdmin(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
            { author: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
          },
        },
        category: true,
        country: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPosts = await prisma.post.count({ where });

    return {
      data: posts,
      meta: {
        total: totalPosts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit),
      },
    };
  }

  async getPostById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        images: true,
        viewCount: true,
        likeCount: true,
        avgRating: true,
        isPublished: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        countryId: true,
        categoryId: true,
        // Select the new location fields
        locationPlaceId: true,
        locationName: true,
        locationAddress: true,
        locationLat: true,
        locationLng: true,
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
        country: true,
        likes: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            ratings: true,
          },
        },
      },
    });

    if (post) {
      // Increment view count
      await prisma.post.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    }

    return post;
  }

  async likePost(userId: string, postId: string) {
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      await prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return { liked: false };
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      await prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return { liked: true };
    }
  }

  async addComment(userId: string, postId: string, content: string) {
    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return comment;
  }

  async deletePost(id: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.post.delete({
      where: { id },
    });

    return { success: true };
  }

  async deletePostByAdmin(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    await prisma.post.delete({
      where: { id },
    });

    return { success: true };
  }
}

export const postService = new PostService();

