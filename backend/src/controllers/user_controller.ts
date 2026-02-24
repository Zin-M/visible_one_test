import { Request, Response } from 'express';
import { UserService } from '../services/user_service';

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, role, password } = req.body;
        const user = await UserService.createUser(name, role, password);
        res.status(201).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserService.getUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await UserService.updateRole(id as string, role as any);
        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await UserService.deleteUser(id as string);
        res.status(200).json({ success: true, data: { deletedId: id } });
    } catch (error: any) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};
