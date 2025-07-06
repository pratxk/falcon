import { GraphQLError } from 'graphql';
import { Context } from '../graphql/resolvers/types';

export function requireAuth(context: Context): void {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

export function requireRole(context: Context, allowedRoles: string[]): void {
  requireAuth(context);
  
  if (!allowedRoles.includes(context.user!.role)) {
    throw new GraphQLError('Insufficient permissions', {
      extensions: {
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: context.user!.role,
      },
    });
  }
}

export function requireOrganizationAccess(context: Context, organizationId: string): void {
  requireAuth(context);
  
  // Super admins have access to all organizations
  if (context.user!.role === 'SUPER_ADMIN') {
    return;
  }
  
  // Check if user has access to the organization
  const hasAccess = context.user!.organizations.some((org: any) => org.id === organizationId);
  
  if (!hasAccess) {
    throw new GraphQLError('Access denied to organization', {
      extensions: {
        code: 'FORBIDDEN',
        organizationId,
      },
    });
  }
}

 