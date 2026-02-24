import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        startTime: z.string().datetime({ message: "Invalid startTime format, requires ISO string" }),
        endTime: z.string().datetime({ message: "Invalid endTime format, requires ISO string" }),
    }).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
        message: "startTime must be before endTime",
        path: ["startTime"],
    }),
});
