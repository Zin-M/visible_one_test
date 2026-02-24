import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const login = async (req: Request, res: Response) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ success: false, error: 'Name and password required' });
        }

        // Find user
        const [user] = await db.select().from(users).where(eq(users.name, name));
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid name or password' });
        }

        // Verify
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid name or password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: userWithoutPassword
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
