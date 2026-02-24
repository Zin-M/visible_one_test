import { pgTable, uuid, varchar, timestamp, pgEnum, check, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum('user_role', ['admin', 'owner', 'user']);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('user').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        checkTimeOrder: check('chk_time_order', sql`${table.startTime} < ${table.endTime}`),
        userIdIdx: index('idx_bookings_user_id').on(table.userId),
        timeRangeIdx: index('idx_bookings_time_range').on(table.startTime, table.endTime),
    };
});
