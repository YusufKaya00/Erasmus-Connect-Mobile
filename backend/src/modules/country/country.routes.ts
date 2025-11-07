import { Router } from 'express';
import { optionalAuth } from '@middleware/auth';
import { countryController } from './country.controller';

const router = Router();

router.use(optionalAuth);

// GET /api/v1/countries - Get all countries or search
router.get('/', countryController.getAll.bind(countryController));

// GET /api/v1/countries/:id - Get country by ID
router.get('/:id', countryController.getById.bind(countryController));

export default router;
