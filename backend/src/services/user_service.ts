import { db } from '../db';
import { users, bookings } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export class UserService {
    static async createUser(name: string, role: 'admin' | 'owner' | 'user', passwordRaw: string) {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);
        const [user] = await db.insert(users).values({ name, role, password: passwordHash }).returning();
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async getUsers(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        const [{ count }] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(users);
        const allUsers = await db.select().from(users).limit(limit).offset(offset);
        return {
            data: allUsers.map(({ password, ...rest }) => rest),
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        };
    }

    static async updateRole(id: string, role: 'admin' | 'owner' | 'user') {
        const [user] = await db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();

        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    static async deleteUser(id: string) {
        
        
        await db.delete(bookings).where(eq(bookings.userId, id));

        const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
        if (!deleted) {
            throw new Error('User not found');
        }
        return deleted;
    }
}
