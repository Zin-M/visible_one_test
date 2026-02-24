export type Role = 'admin' | 'owner' | 'user';

export interface User {
    id: string;
    name: string;
    role: Role;
    createdAt?: string;
    updatedAt?: string;
}

export interface Booking {
    id: string;
    userId: string;
    startTime: string;
    endTime: string;
    createdAt?: string;
}

export interface GroupedBooking {
    user: { id: string; name: string; role: Role };
    bookings: Booking[];
}

export interface BookingSummary {
    overview: {
        totalBookings: string | number;
        upcomingBookings: string | number;
    };
    topBooker?: {
        name: string;
        count: string | number;
    } | null;
}
