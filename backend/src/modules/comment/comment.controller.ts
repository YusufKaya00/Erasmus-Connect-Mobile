import { Request, Response } from 'express';
import { commentService } from './comment.service';

export class CommentController {
  async getAllComments(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const userId = req.query.userId as string;

    const result = await commentService.getAllComments(page, limit, search, userId);
    res.json({ 
      success: true, 
      data: result.data,
      meta: result.meta
    });
  }

  async getCommentById(req: Request, res: Response) {
    const { id } = req.params;
    const comment = await commentService.getCommentById(id);
    if (comment) {
      res.json({ success: true, data: comment });
    } else {
      res.status(404).json({ success: false, message: 'Comment not found' });
    }
  }

  async deleteComment(req: Request, res: Response) {
    const { id } = req.params;
    await commentService.deleteComment(id);
    res.json({ success: true, message: 'Comment deleted successfully' });
  }
}

export const commentController = new CommentController();
