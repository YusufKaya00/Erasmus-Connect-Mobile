import { Request, Response } from 'express';
import { statsService } from './stats.service';

export class StatsController {
  async getOverallStats(req: Request, res: Response) {
    const stats = await statsService.getOverallStats();
    res.json({
      success: true,
      data: stats,
    });
  }
}

export const statsController = new StatsController();
