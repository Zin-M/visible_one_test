import { Request, Response } from 'express';
import { BookingService } from '../services/booking_service';

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { startTime, endTime } = req.body;
        const userId = req.user!.id;

        const booking = await BookingService.createBooking(userId, startTime, endTime);
        res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
        if (error.message === 'INVALID_TIME') {
            return res.status(400).json({ success: false, error: 'startTime must be before endTime' });
        }
        if (error.message === 'OVERLAP') {
            return res.status(409).json({ success: false, error: 'Booking conflict: the requested time slot overlaps an existing booking' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
        const result = await BookingService.getBookings(page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const role = req.user!.role;

        await BookingService.deleteBooking(id as string, userId, role);
        res.status(200).json({ success: true, data: { deletedId: id } });
    } catch (error: any) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ success: false, error: 'Forbidden: you can only delete your own bookings' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getGroupedBookings = async (req: Request, res: Response) => {
    try {
        const grouped = await BookingService.getGroupedBookings();
        res.status(200).json({ success: true, data: grouped });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getBookingSummary = async (req: Request, res: Response) => {
    try {
        const summary = await BookingService.getBookingSummary();
        res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
