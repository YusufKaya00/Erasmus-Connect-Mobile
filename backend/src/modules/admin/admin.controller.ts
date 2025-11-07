import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { AppError } from '@shared/middleware/error-handler';

const adminService = new AdminService();

export class AdminController {
  async testEndpoint(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: 'Admin endpoint is working',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  async testMongoDB(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.testMongoDBConnection();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async testTravelRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.testTravelRoutes();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const result = await adminService.getUsers(page, limit, search);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserById(id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, password, role, isActive, isVerified } = req.body;
      
      // Basic validation
      if (role && !['STUDENT', 'ADMIN', 'MODERATOR'].includes(role)) {
          throw new AppError(400, 'Invalid role specified');
      }

      const updatedUser = await adminService.updateUser(id, { 
        email, 
        password, 
        role, 
        isActive, 
        isVerified 
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profileData = req.body;

      const result = await adminService.updateUserProfile(id, profileData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // You might want to prevent an admin from deleting themselves.
      // const requestingUserId = (req as any).user?.id;
      // if (id === requestingUserId) {
      //   throw new AppError(400, 'You cannot delete your own account.');
      // }
      
      const deletedUser = await adminService.deleteUser(id);
      res.status(200).json({ 
        success: true,
        message: 'User deleted successfully from MongoDB',
        data: deletedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const result = await adminService.deleteUserProfile(id);
      res.status(200).json({ 
        success: true,
        message: 'User profile deleted successfully from Supabase',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserCompletely(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Kendi hesabını silmeyi engelle
      const requestingUserId = (req as any).user?.id;
      if (id === requestingUserId) {
        throw new AppError(400, 'Kendi hesabınızı silemezsiniz.');
      }
      
      const result = await adminService.deleteUserCompletely(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(207).json(result); // 207 Multi-Status for partial success
      }
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // TRAVEL ROUTES CONTROLLERS
  // ============================================

  async getTravelRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const result = await adminService.getTravelRoutes(page, limit, search);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTravelRouteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const route = await adminService.getTravelRouteById(id);
      if (!route) {
        throw new AppError(404, 'Travel route not found');
      }
      res.status(200).json(route);
    } catch (error) {
      next(error);
    }
  }

  async deleteTravelRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const result = await adminService.deleteTravelRoute(id);
      res.status(200).json({ 
        success: result.success,
        message: result.message 
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // STATS METHODS
  // ============================================

  async getOverallStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getOverallStats();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
