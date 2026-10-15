import prisma from '../prismaClient';
import { v4 as uuidv4 } from 'uuid';
import validUrl from 'valid-url';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randBase62(len = 6) {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export async function findByShortCode(shortCode: string) {
  return prisma.link.findUnique({ where: { shortCode } });
}

export async function createShortLink({ longUrl, customAlias, expiresAt, title } : { longUrl: string, customAlias?: string|null, expiresAt?: Date|null, title?: string|null }) {
  if (!validUrl.isUri(longUrl)) throw new Error('Invalid URL');

  // if custom alias provided, check unique
  if (customAlias) {
    const exists = await prisma.link.findUnique({ where: { customAlias } });
    if (exists) throw new Error('custom alias already taken');
  }

  // generate code with collision check
  let shortCode = customAlias || randBase62(6);
  let attempt = 0;
  while (!customAlias) {
    const exists = await prisma.link.findUnique({ where: { shortCode } });
    if (!exists) break;
    shortCode = randBase62(6);
    attempt++;
    if (attempt > 5) shortCode = randBase62(8);
  }

  const link = await prisma.link.create({ data: {
    shortCode,
    customAlias: customAlias || null,
    longUrl,
    title: title || null,
    expiresAt: expiresAt || null
  }});

  return {
    id: link.id,
    shortCode: link.shortCode,
    shortUrl: `${process.env.APP_URL || 'http://localhost:4000'}/${link.shortCode}`,
    longUrl: link.longUrl,
    createdAt: link.createdAt
  };
}
