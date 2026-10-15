import { Request, Response } from 'express';
import { createShortLink, findByShortCode } from '../services/shortenerService';
import cache from '../services/cacheService';
import prisma from '../prismaClient';

export const createLink = async (req: Request, res: Response) => {
  try {
    const { longUrl, customAlias, expiresAt, title } = req.body;
    if (!longUrl) return res.status(400).json({ error: 'longUrl is required' });

    const link = await createShortLink({ longUrl, customAlias, expiresAt: expiresAt ? new Date(expiresAt) : null, title });
    return res.status(201).json(link);
  } catch (err:any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
};

export const handleRedirect = async (req: Request, res: Response) => {
  try {
    const shortCode = req.params.shortCode;
    if (!shortCode) return res.status(400).send('Bad Request');

    // Try cache
    const cached = await cache.getShort(shortCode);
    if (cached) {
      // increment counter in Redis
      cache.incrCounter(cached.id);
      return res.redirect(302, cached.longUrl);
    }

    // Cache miss -> DB
    const link = await findByShortCode(shortCode);
    if (!link) return res.status(404).send('Not found');
    if (!link.isActive) return res.status(410).send('Link inactive');
    if (link.expiresAt && new Date() > link.expiresAt) return res.status(410).send('Link expired');

    // set cache
    await cache.setShort(shortCode, { id: link.id, longUrl: link.longUrl, isActive: link.isActive, expiresAt: link.expiresAt?.toISOString() });
    cache.incrCounter(link.id);

    return res.redirect(302, link.longUrl);
  } catch (err:any) {
    console.error(err);
    return res.status(500).send('internal');
  }
};

export default { createLink, handleRedirect };
