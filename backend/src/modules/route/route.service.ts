import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RouteService {
  async createRoute(data: {
    userId: string;
    title: string;
    description?: string;
    startLocation: string;
    endLocation: string;
    startCoordinates: { lat: number; lng: number };
    endCoordinates: { lat: number; lng: number };
    googleMapsUrl?: string;
    directionsData?: any;
  }) {
    const route = await prisma.route.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        startCoordinates: data.startCoordinates,
        endCoordinates: data.endCoordinates,
        googleMapsUrl: data.googleMapsUrl,
        directionsData: data.directionsData,
      },
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
    });

    return route;
  }

  async getAllRoutes(filters?: {
    userId?: string;
    limit?: number;
  }) {
    const routes = await prisma.route.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        isPublic: true,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        startLocation: true,
        endLocation: true,
        startCoordinates: true,
        endCoordinates: true,
        googleMapsUrl: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 50, // Default limit to 50
    });

    return routes;
  }

  async getRouteById(id: string) {
    try {
      const route = await prisma.route.findUnique({
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
          comments: {
            include: {
              user: {
                select: {
                  id: true,
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
            take: 50, // Limit to 50 comments for speed
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      // Increment view count asynchronously (don't wait)
      if (route) {
        prisma.route.update({
          where: { id },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        }).catch(err => console.error('Error incrementing view count:', err));
      }

      return route;
    } catch (error) {
      console.error('Error in getRouteById:', error);
      throw error;
    }
  }

  async getUserRoutes(userId: string) {
    const routes = await prisma.route.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return routes;
  }

  async addComment(userId: string, routeId: string, content: string) {
    const comment = await prisma.routeComment.create({
      data: {
        userId,
        routeId,
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
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    return comment;
  }

  async deleteRoute(id: string, userId: string) {
    const route = await prisma.route.findUnique({
      where: { id },
    });

    if (!route || route.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.route.delete({
      where: { id },
    });

    return { success: true };
  }

  async updateRoute(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      isPublic?: boolean;
    }
  ) {
    const route = await prisma.route.findUnique({
      where: { id },
    });

    if (!route || route.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updatedRoute = await prisma.route.update({
      where: { id },
      data,
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
    });

    return updatedRoute;
  }
}

export const routeService = new RouteService();

