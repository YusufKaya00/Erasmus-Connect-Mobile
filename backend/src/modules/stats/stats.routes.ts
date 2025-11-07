import { Router } from 'express';

const router = Router();

router.get('/overview', async (req, res) => {
  // TODO: Implement
  res.json({ success: true, data: {} });
});

router.get('/countries/:countryId', async (req, res) => {
  // TODO: Implement
  res.json({ success: true, data: {} });
});

export default router;

