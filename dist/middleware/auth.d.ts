import { Request, Response, NextFunction } from 'express';
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireAuth: (req: Request) => boolean;
export declare const requireRole: (req: Request, allowedRoles: string[]) => boolean;
export declare const requireOrganizationAccess: (req: Request, organizationId: string, allowedRoles?: string[]) => boolean;
//# sourceMappingURL=auth.d.ts.map