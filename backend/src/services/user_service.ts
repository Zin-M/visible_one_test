import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export class UserService {
    static async createUser(name: string, role: 'admin' | 'owner' | 'user', passwordRaw: string) {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);
        const [user] = await db.insert(users).values({ name, role, password: passwordHash }).returning();
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async getUsers() {
        const allUsers = await db.select().from(users);
        return allUsers.map(({ password, ...rest }) => rest);
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
        const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
        if (!deleted) {
            throw new Error('User not found');
        }
        return deleted;
    }
}
