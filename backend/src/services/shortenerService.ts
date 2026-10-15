import crypto from 'crypto';
import { PrismaClient, Prisma } from '@prisma/client';
import validUrl from 'valid-url';
import cache from './cacheService';

const prisma = new PrismaClient();

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_LEN = ALPHABET.length;

/** Gera Base62 seguro usando crypto.randomBytes */
export function generateBase62(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET_LEN];
  }
  return out;
}

export async function findByShortCode(shortCode: string) {
  return prisma.link.findUnique({ where: { shortCode } });
}

/**
 * Cria short link:
 * - valida URL
 * - se customAlias: tenta criar e falha se já existir (race-safe)
 * - senão: gera candidato e tenta criar; em caso de P2002 faz retry (aumenta length se necessário)
 */
export async function createShortLink({
  longUrl,
  customAlias,
  expiresAt,
  title,
  userId
}: {
  longUrl: string;
  customAlias?: string | null;
  expiresAt?: Date | null;
  title?: string | null;
  userId?: string | null;
}) {
  if (!validUrl.isUri(longUrl)) throw new Error('Invalid URL');

  // custom alias path (validação básica)
  if (customAlias) {
    if (!/^[0-9A-Za-z\-_]{3,255}$/.test(customAlias)) throw new Error('Invalid custom alias format');
    try {
      const created = await prisma.link.create({
        data: {
          shortCode: customAlias,
          customAlias,
          longUrl,
          expiresAt: expiresAt || null,
          title: title || null,
          userId: userId || null
        }
      });
      await cache.setShort(created.shortCode, { id: created.id, longUrl: created.longUrl, isActive: created.isActive, expiresAt: created.expiresAt?.toISOString() });
      return toPublic(created);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new Error('custom alias already taken');
      }
      throw err;
    }
  }

  // geração aleatória com retry em P2002
  const maxAttempts = 8;
  let attempt = 0;
  let len = 6;
  while (attempt < maxAttempts) {
    const candidate = generateBase62(len);
    try {
      const created = await prisma.link.create({
        data: {
          shortCode: candidate,
          longUrl,
          expiresAt: expiresAt || null,
          title: title || null,
          userId: userId || null
        }
      });
      await cache.setShort(created.shortCode, { id: created.id, longUrl: created.longUrl, isActive: created.isActive, expiresAt: created.expiresAt?.toISOString() });
      return toPublic(created);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        attempt++;
        if (attempt >= 4) len = 8; // aumenta espaço de nomes se houver colisões
        continue;
      }
      throw err;
    }
  }
  throw new Error('Could not generate unique short code; try again');
}

function toPublic(link: any) {
  return {
    id: link.id,
    shortCode: link.shortCode,
    shortUrl: `${process.env.APP_URL || 'http://localhost:4000'}/${link.shortCode}`,
    longUrl: link.longUrl,
    createdAt: link.createdAt
  };
}
