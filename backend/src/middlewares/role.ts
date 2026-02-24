import { Request, Response, NextFunction } from 'express';

export const requireRole = (...roles: Array<'admin' | 'owner' | 'user'>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized: No user found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Insufficient role' });
        }

        next();
    };
};
