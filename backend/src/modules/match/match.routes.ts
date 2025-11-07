import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import matchController from './match.controller';

const router = Router();

// Authenticate all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/matches
 * @desc    Get all matches (or filtered by category)
 * @query   category - Optional: ROOMMATE, MENTOR, COMMUNICATION
 * @access  Private
 */
router.get('/', matchController.getMatches.bind(matchController));

/**
 * @route   GET /api/v1/matches/roommate
 * @desc    Get roommate matches
 * @access  Private
 */
router.get('/roommate', matchController.getRoommateMatches.bind(matchController));

/**
 * @route   GET /api/v1/matches/mentor
 * @desc    Get mentor matches
 * @access  Private
 */
router.get('/mentor', matchController.getMentorMatches.bind(matchController));

/**
 * @route   GET /api/v1/matches/communication
 * @desc    Get communication/social matches
 * @access  Private
 */
router.get('/communication', matchController.getCommunicationMatches.bind(matchController));

export default router;

