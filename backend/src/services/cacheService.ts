import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// key: short:{shortCode} => JSON string with id,longUrl,isActive,expiresAt

export default {
  getShort: async (shortCode: string) => {
    const key = `short:${shortCode}`;
    const v = await redis.get(key);
    if (!v) return null;
    try { return JSON.parse(v); } catch { return null; }
  },
  setShort: async (shortCode: string, payload: any, ttlSeconds = 60 * 60 * 24) => {
    const key = `short:${shortCode}`;
    await redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
  },
  incrCounter: async (linkId: string) => {
    const day = new Date().toISOString().slice(0,10);
    const key = `counter:${linkId}:${day}`;
    await redis.incr(key);
    await redis.expire(key, 60 * 60 * 24 * 90); // keep 90 days
  },
  client: redis
};
