import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

interface ThrottleEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiting guard.
 *
 * NOTE: For production use, replace this with @nestjs/throttler or
 * a distributed solution (Redis-based) to handle multiple server instances.
 *
 * Usage:
 *   @UseGuards(ThrottleGuard)
 *   @Post('endpoint')
 *   async myEndpoint() { ... }
 *
 * Custom limits per controller/route can be added by extending this guard
 * and setting different limits in the constructor.
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly logger = new Logger(ThrottleGuard.name);
  private readonly store = new Map<string, ThrottleEntry>();

  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 60, windowSec = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSec * 1000;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getClientKey(request);

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });

      // Cleanup old entries periodically
      if (this.store.size > 10000) {
        this.cleanup();
      }

      return true;
    }

    entry.count += 1;

    if (entry.count > this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for IP: ${key}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientKey(request: Request): string {
    // Use X-Forwarded-For if behind a proxy, fallback to IP
    const forwarded = request.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : request.ip;
    return ip || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}
