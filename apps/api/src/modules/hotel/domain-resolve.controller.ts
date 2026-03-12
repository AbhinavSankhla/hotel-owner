import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/**
 * Lightweight REST endpoint for Next.js middleware to resolve domain→hotelId.
 * Called from the edge middleware to avoid hardcoding domain mappings.
 */
@Controller('domain-resolve')
export class DomainResolveController {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async resolve(@Query('domain') domain: string) {
    if (!domain) {
      return { hotelId: null };
    }

    const cacheKey = `domain:${domain}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return { hotelId: cached };
    }

    const hotelDomain = await this.prisma.hotelDomain.findUnique({
      where: { domain },
      select: { hotel: { select: { slug: true } } },
    });

    const hotelId = hotelDomain?.hotel?.slug || null;

    if (hotelId) {
      await this.redis.set(cacheKey, hotelId, this.CACHE_TTL);
    }

    return { hotelId };
  }
}
