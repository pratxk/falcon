
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    role: string;
    organizations: any[];
  };
  redis: Redis;
} 