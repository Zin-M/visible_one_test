/**
 * Meeting Room Booking System Database Schema (PostgreSQL)
 */

-- Enable the btree_gist extension necessary for the EXCLUDE constraint
-- involving scalar types (like UUID or integer) alongside range types.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Define ENUM for User Roles
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'user');

-- Define the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Define the bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 1. Foreign Key Constraint with RESTRICT
    -- Action: Prevent Deletion.
    -- Justification: We use `ON DELETE RESTRICT` because deleting a user who has bookings
    -- would orphan payment/audit records or cascade-delete valuable historical room usage 
    -- data. Instead, users should logically act as deactivated in the application code,
    -- preserving the historical integrity of who booked the room.
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE RESTRICT,
        
    -- 2. Check Constraint: start_time MUST be before end_time
    CONSTRAINT chk_time_order 
        CHECK (start_time < end_time),
        
    -- 3. Exclude Constraint: Prevent Overlapping Bookings
    -- We use GiST and `tstzrange(start_time, end_time, '[)')`.
    -- The '[)' indicates the range includes the start_time but EXCLUDES the end_time.
    -- This natively allows back-to-back bookings (e.g., 9:00-10:00 and 10:00-11:00)
    -- because the exact end_time is not treated as part of the booking interval footprint.
    CONSTRAINT exclude_overlapping_bookings 
        EXCLUDE USING gist (
            tstzrange(start_time, end_time, '[)') WITH &&
        )
);

-- Note regarding the timezone:
-- `TIMESTAMP WITH TIME ZONE` (or `timestamptz`) is strictly used. PostgreSQL 
-- internally converts this and stores it as UTC automatically, resolving any 
-- time boundary conflicts regardless of the client's local time zone insertion.

-- Indexes for performance

-- 1. Index on Foreign Key
-- Why: Speeds up queries attempting to lookup all bookings belonging to a single user
-- and is often necessary to avoid full table scans when JOINs occur or constraint checks run.
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

-- 2. Index on Time Range Queries
-- Why: Specifically optimizes application queries looking up "bookings today" or 
-- "bookings this week" using range intersection `&&` or containment operators.
CREATE INDEX idx_bookings_time_range ON bookings USING gist (tstzrange(start_time, end_time, '[)'));
