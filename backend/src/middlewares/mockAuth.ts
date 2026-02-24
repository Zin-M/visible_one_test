import { Request, Response, NextFunction } from 'express';



export const mockAuth = (req: Request, res: Response, next: NextFunction) => {
    const id = req.headers['x-mock-user-id'] as string;
    const role = req.headers['x-mock-role'] as 'admin' | 'owner' | 'user';

    if (!id || !role) {
        return res.status(401).json({
            success: false,
            error: 'Missing x-mock-user-id or x-mock-role headers',
        });
    }

    req.user = { id, role };
    next();
};
