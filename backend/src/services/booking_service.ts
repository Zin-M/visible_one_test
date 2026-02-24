import { db } from '../db';
import { bookings, users } from '../db/schema';
import { eq, and, lt, gt, sql } from 'drizzle-orm';

export class BookingService {
    static async createBooking(userId: string, startTime: string, endTime: string) {
        // 1. Transaction to check overlap and insert securely
        return await db.transaction(async (tx) => {
            const start = new Date(startTime);
            const end = new Date(endTime);

            // Overlap rule: newStart < existing.endTime AND newEnd > existing.startTime
            // Note: Because we use >= or strict >, we must be careful. 
            // Rule says: Back-to-back bookings ARE allowed. 
            // So if newEnd == existing.startTime -> Not an overlap (we want strictly newEnd > existing.startTime)
            const overlaps = await tx
                .select()
                .from(bookings)
                .where(
                    and(
                        lt(bookings.startTime, end), // existing.startTime < newEnd
                        gt(bookings.endTime, start)  // existing.endTime > newStart
                    )
                )
                .limit(1);

            if (overlaps.length > 0) {
                throw new Error('OVERLAP');
            }

            // Insert new booking
            const [booking] = await tx.insert(bookings).values({
                userId,
                startTime: start,
                endTime: end,
            }).returning();

            return booking;
        });
    }

    static async getBookings() {
        return await db.select().from(bookings).orderBy(bookings.startTime);
    }

    static async deleteBooking(bookingId: string, requestingUserId: string, requestingUserRole: string) {
        const [existing] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

        if (!existing) {
            throw new Error('NOT_FOUND');
        }

        if (requestingUserRole === 'user' && existing.userId !== requestingUserId) {
            throw new Error('FORBIDDEN');
        }

        await db.delete(bookings).where(eq(bookings.id, bookingId));
    }

    static async getGroupedBookings() {
        // Return bookings grouped by user
        // Equivalent: SELECT user_id, count(*) as count, arr_agg(...) FROM bookings GROUP BY user_id
        // But using ORM we can join and group, or fetch and map in-memory for simpler structures
        const allBookings = await db
            .select({
                booking: bookings,
                user: { id: users.id, name: users.name, role: users.role }
            })
            .from(bookings)
            .leftJoin(users, eq(bookings.userId, users.id));

        // Grouping in-memory for clean format
        const grouped = allBookings.reduce((acc, row) => {
            const uId = row.user?.id || 'unknown';
            if (!acc[uId]) {
                acc[uId] = { user: row.user, bookings: [] };
            }
            acc[uId].bookings.push(row.booking);
            return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped);
    }

    static async getBookingSummary() {
        // e.g. Total bookings, upcoming bookings, top booker
        const statsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as "totalBookings",
        COUNT(*) FILTER (WHERE start_time > NOW()) as "upcomingBookings"
      FROM bookings
    `);

        const userStats = await db.execute(sql`
      SELECT users.name, COUNT(bookings.id) as count
      FROM users
      LEFT JOIN bookings ON users.id = bookings.user_id
      GROUP BY users.id
      ORDER BY count DESC
      LIMIT 1
    `);

        return {
            overview: statsResult.rows[0],
            topBooker: userStats.rows[0] || null,
        };
    }
}
