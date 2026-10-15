import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { Router } from 'express';
import { createLink } from '../controllers/linkController';

const router = Router();

// rate limiter: max 50 link creations per IP per hour
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

export const createLinkValidation = [
  body('longUrl').isURL({ protocols: ['http','https'], require_protocol: true }),
  body('customAlias').optional().matches(/^[0-9A-Za-z\-_]{3,255}$/),
  body('expiresAt').optional().isISO8601(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.post('/', createLimiter, createLinkValidation, createLink);

export default router;
