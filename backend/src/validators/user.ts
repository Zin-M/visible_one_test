import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters long"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        role: z.enum(['admin', 'owner', 'user']),
    }),
});

export const changeRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid user ID format"),
    }),
    body: z.object({
        role: z.enum(['admin', 'owner', 'user']),
    }),
});
