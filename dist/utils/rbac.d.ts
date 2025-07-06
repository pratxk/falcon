import { Context } from '../graphql/resolvers/types';
export declare function requireAuth(context: Context): void;
export declare function requireRole(context: Context, allowedRoles: string[]): void;
export declare function requireOrganizationAccess(context: Context, organizationId: string): void;
//# sourceMappingURL=rbac.d.ts.map