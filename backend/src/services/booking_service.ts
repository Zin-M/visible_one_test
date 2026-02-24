import { db } from '../db';
import { bookings, users } from '../db/schema';
import { eq, and, lt, gt, sql, count as drizzleCount } from 'drizzle-orm';

export class BookingService {
    static async createBooking(userId: string, startTime: string, endTime: string) {
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            throw new Error('INVALID_TIME');
        }

        return await db.transaction(async (tx) => {
            const overlaps = await tx
                .select()
                .from(bookings)
                .where(
                    and(
                        lt(bookings.startTime, end),
                        gt(bookings.endTime, start)
                    )
                )
                .limit(1);

            if (overlaps.length > 0) {
                throw new Error('OVERLAP');
            }

            const [booking] = await tx.insert(bookings).values({
                userId,
                startTime: start,
                endTime: end,
            }).returning();

            return booking;
        });
    }

    static async getBookings(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        const [{ count }] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(bookings);
        const data = await db.select().from(bookings).orderBy(bookings.startTime).limit(limit).offset(offset);
        return {
            data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        };
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
        const allBookings = await db
            .select({
                booking: bookings,
                user: { id: users.id, name: users.name, role: users.role }
            })
            .from(bookings)
            .leftJoin(users, eq(bookings.userId, users.id));

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
