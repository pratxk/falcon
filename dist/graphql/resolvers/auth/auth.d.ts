import { Context } from '../types';
export declare const authResolvers: {
    Query: {
        me: (_parent: any, _args: any, context: Context) => Promise<{
            id: string;
            email: string;
            role: string;
            organizations: any[];
        }>;
    };
    Mutation: {
        register: (_parent: any, { email, password, firstName, lastName }: any, context: Context) => Promise<{
            token: string;
            user: {
                organizations: any[];
                organizationMemberships: ({
                    organization: {
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
                        description: string | null;
                    };
                } & {
                    userId: string;
                    role: import(".prisma/client").$Enums.Role;
                    id: string;
                    organizationId: string;
                    joinedAt: Date;
                })[];
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        login: (_parent: any, { email, password }: {
            email: string;
            password: string;
        }, context: Context) => Promise<{
            token: string;
            user: {
                organizations: any[];
                organizationMemberships: ({
                    organization: {
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
                        description: string | null;
                    };
                } & {
                    userId: string;
                    role: import(".prisma/client").$Enums.Role;
                    id: string;
                    organizationId: string;
                    joinedAt: Date;
                })[];
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        changePassword: (_parent: any, { currentPassword, newPassword }: {
            currentPassword: string;
            newPassword: string;
        }, context: Context) => Promise<boolean>;
    };
};
//# sourceMappingURL=auth.d.ts.map