import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Allow access for introspection and public queries
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Fetch user with organization memberships
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Attach user to request
    (req as any).user = {
      ...user,
      organizations: user.organizationMemberships.map((om: any) => ({
        ...om.organization,
        userRole: om.role,
      })),
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAuth = (req: Request): boolean => {
  return !!(req as any).user;
};

export const requireRole = (req: Request, allowedRoles: string[]): boolean => {
  const user = (req as any).user;
  if (!user) return false;
  
  return allowedRoles.includes(user.role);
};

export const requireOrganizationAccess = (
  req: Request,
  organizationId: string,
  allowedRoles: string[] = []
): boolean => {
  const user = (req as any).user;
  if (!user) return false;
  
  // Super admins have access to all organizations
  if (user.role === 'SUPER_ADMIN') return true;
  
  // Check organization membership
  const membership = user.organizations?.find(
    (org: any) => org.id === organizationId
  );
  
  if (!membership) return false;
  
  // If specific roles are required, check them
  if (allowedRoles.length > 0) {
    return allowedRoles.includes(membership.userRole);
  }
  
  return true;
};