import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentService {
  async getAllComments(page: number = 1, limit: number = 10, search: string = '', userId?: string) {
    try {
      const skip = (page - 1) * limit;
      const where = {
        ...(search
          ? {
              OR: [
                { content: { contains: search, mode: 'insensitive' as const } },
                { user: { email: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {}),
        ...(userId ? { userId } : {}),
      };

      const comments = await prisma.comment.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: {
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
          post: {
            select: {
              id: true,
              title: true,
              content: true,
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
              category: {
                select: {
                  name: true,
                },
              },
              country: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Sadece post'u olan yorumları filtrele
      const validComments = comments.filter(comment => comment.post !== null);
      
      const totalComments = await prisma.comment.count({ where });

      return {
        data: validComments,
        meta: {
          total: totalComments,
          page,
          limit,
          totalPages: Math.ceil(totalComments / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Eğer hata varsa, basit bir sorgu ile sadece temel bilgileri getir
      const comments = await prisma.comment.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Post bilgilerini manuel olarak ekle
      const commentsWithPosts = await Promise.all(
        comments.map(async (comment) => {
          try {
            const post = await prisma.post.findUnique({
              where: { id: comment.postId },
              select: {
                id: true,
                title: true,
                content: true,
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
                category: {
                  select: {
                    name: true,
                  },
                },
                country: {
                  select: {
                    name: true,
                  },
                },
              },
            });
            
            return {
              ...comment,
              post: post || null,
            };
          } catch (error) {
            console.error(`Error fetching post for comment ${comment.id}:`, error);
            return {
              ...comment,
              post: null,
            };
          }
        })
      );
      
      // Sadece post'u olan yorumları döndür
      const filteredComments = commentsWithPosts.filter(comment => comment.post !== null);
      
      const totalComments = await prisma.comment.count({ where });

      return {
        data: filteredComments,
        meta: {
          total: totalComments,
          page,
          limit,
          totalPages: Math.ceil(totalComments / limit),
        },
      };
    }
  }

  async getCommentById(id: string) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
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
        post: {
          select: {
            id: true,
            title: true,
            content: true,
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
            category: {
              select: {
                name: true,
              },
            },
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return comment;
  }

  async deleteComment(id: string) {
    await prisma.comment.delete({
      where: { id },
    });
    return { message: 'Comment deleted successfully' };
  }
}

export const commentService = new CommentService();
