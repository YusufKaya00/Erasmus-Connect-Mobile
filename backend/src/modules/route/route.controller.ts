import { Request, Response } from 'express';
import { routeService } from './route.service';
import logger from '@shared/utils/logger';
import profileService from '../profile/profile.service.supabase';

export class RouteController {
  async createRoute(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        title,
        description,
        startLocation,
        endLocation,
        startCoordinates,
        endCoordinates,
        googleMapsUrl,
        directionsData,
      } = req.body;

      // Validate required fields
      if (!title || !startLocation || !endLocation || !startCoordinates || !endCoordinates) {
        return res.status(400).json({
          message: 'Title, start location, end location, and coordinates are required',
        });
      }

      const route = await routeService.createRoute({
        userId,
        title,
        description,
        startLocation,
        endLocation,
        startCoordinates,
        endCoordinates,
        googleMapsUrl,
        directionsData,
      });

      logger.info(`Route created: ${route.id} by user ${userId}`);
      res.status(201).json(route);
    } catch (error) {
      logger.error('Error creating route:', error);
      res.status(500).json({ message: 'Failed to create route' });
    }
  }

  async getAllRoutes(req: Request, res: Response) {
    try {
      const { userId, limit } = req.query;

      const routes = await routeService.getAllRoutes({
        userId: userId as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      // Fetch fresh profile data from Supabase for each author
      const enrichedRoutes = await Promise.all(
        routes.map(async (route: any) => {
          try {
            const freshProfile = await profileService.getProfileByUserId(route.userId);
            return {
              ...route,
              user: {
                ...route.user,
                profile: freshProfile ? {
                  firstName: freshProfile.firstName,
                  lastName: freshProfile.lastName,
                  photoUrl: freshProfile.photoUrl,
                } : route.user?.profile
              }
            };
          } catch (error) {
            console.error(`Failed to fetch profile for user ${route.userId}:`, error);
            return route;
          }
        })
      );

      res.json(enrichedRoutes);
    } catch (error) {
      logger.error('Error fetching routes:', error);
      res.status(500).json({ message: 'Failed to fetch routes' });
    }
  }

  async getRouteById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const route = await routeService.getRouteById(id);

      if (!route) {
        return res.status(404).json({ message: 'Route not found' });
      }

      // Fetch fresh profile data from Supabase
      try {
        const freshProfile = await profileService.getProfileByUserId(route.userId);
        if (freshProfile) {
          (route as any).user = {
            ...(route as any).user,
            profile: {
              firstName: freshProfile.firstName,
              lastName: freshProfile.lastName,
              photoUrl: freshProfile.photoUrl,
            }
          };
        }
      } catch (error) {
        console.error(`Failed to fetch profile:`, error);
      }

      res.json(route);
    } catch (error) {
      logger.error('Error fetching route:', error);
      res.status(500).json({ message: 'Failed to fetch route' });
    }
  }

  async getUserRoutes(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const routes = await routeService.getUserRoutes(userId);

      // Fetch fresh profile data from Supabase
      const enrichedRoutes = await Promise.all(
        routes.map(async (route: any) => {
          try {
            const freshProfile = await profileService.getProfileByUserId(route.userId);
            return {
              ...route,
              user: {
                ...route.user,
                profile: freshProfile ? {
                  firstName: freshProfile.firstName,
                  lastName: freshProfile.lastName,
                  photoUrl: freshProfile.photoUrl,
                } : route.user?.profile
              }
            };
          } catch (error) {
            console.error(`Failed to fetch profile:`, error);
            return route;
          }
        })
      );

      res.json(enrichedRoutes);
    } catch (error) {
      logger.error('Error fetching user routes:', error);
      res.status(500).json({ message: 'Failed to fetch user routes' });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id: routeId } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Comment content is required' });
      }

      const comment = await routeService.addComment(userId, routeId, content);

      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error adding comment:', error);
      res.status(500).json({ message: 'Failed to add comment' });
    }
  }

  async deleteRoute(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;

      await routeService.deleteRoute(id, userId);

      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized to delete this route' });
      }
      logger.error('Error deleting route:', error);
      res.status(500).json({ message: 'Failed to delete route' });
    }
  }

  async updateRoute(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { title, description, isPublic } = req.body;

      const route = await routeService.updateRoute(id, userId, {
        title,
        description,
        isPublic,
      });

      res.json(route);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return res.status(403).json({ message: 'Unauthorized to update this route' });
      }
      logger.error('Error updating route:', error);
      res.status(500).json({ message: 'Failed to update route' });
    }
  }
}

export const routeController = new RouteController();

