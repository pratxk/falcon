"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrganizationAccess = exports.requireRole = exports.requireAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
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
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        req.user = {
            ...user,
            organizations: user.organizationMemberships.map((om) => ({
                ...om.organization,
                userRole: om.role,
            })),
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
const requireAuth = (req) => {
    return !!req.user;
};
exports.requireAuth = requireAuth;
const requireRole = (req, allowedRoles) => {
    const user = req.user;
    if (!user)
        return false;
    return allowedRoles.includes(user.role);
};
exports.requireRole = requireRole;
const requireOrganizationAccess = (req, organizationId, allowedRoles = []) => {
    const user = req.user;
    if (!user)
        return false;
    if (user.role === 'SUPER_ADMIN')
        return true;
    const membership = user.organizations?.find((org) => org.id === organizationId);
    if (!membership)
        return false;
    if (allowedRoles.length > 0) {
        return allowedRoles.includes(membership.userRole);
    }
    return true;
};
exports.requireOrganizationAccess = requireOrganizationAccess;
//# sourceMappingURL=auth.js.map