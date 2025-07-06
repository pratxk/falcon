"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.requireOrganizationAccess = requireOrganizationAccess;
const graphql_1 = require("graphql");
function requireAuth(context) {
    if (!context.user) {
        throw new graphql_1.GraphQLError('Authentication required', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }
}
function requireRole(context, allowedRoles) {
    requireAuth(context);
    if (!allowedRoles.includes(context.user.role)) {
        throw new graphql_1.GraphQLError('Insufficient permissions', {
            extensions: {
                code: 'FORBIDDEN',
                requiredRoles: allowedRoles,
                userRole: context.user.role,
            },
        });
    }
}
function requireOrganizationAccess(context, organizationId) {
    requireAuth(context);
    if (context.user.role === 'SUPER_ADMIN') {
        return;
    }
    const hasAccess = context.user.organizations.some((org) => org.id === organizationId);
    if (!hasAccess) {
        throw new graphql_1.GraphQLError('Access denied to organization', {
            extensions: {
                code: 'FORBIDDEN',
                organizationId,
            },
        });
    }
}
//# sourceMappingURL=rbac.js.map