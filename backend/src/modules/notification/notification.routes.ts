import { Router } from 'express';
import { authenticate } from '@middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  // TODO: Implement
  res.json({ success: true, data: [] });
});

router.put('/:id/read', async (req, res) => {
  // TODO: Implement
  res.json({ success: true });
});

router.put('/read-all', async (req, res) => {
  // TODO: Implement
  res.json({ success: true });
});

export default router;

