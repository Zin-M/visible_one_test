import axios from 'axios';
import { User, Booking, GroupedBooking, BookingSummary, Role } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Match the backend server URL explicitly
});

// Intercept requests to inject the JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// A standard centralized format for error handling that components can safely extract
export const extractError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

// --- AUTH API --- //
export const loginUser = async (name: string, password: string): Promise<{ token: string, user: User }> => {
    const { data } = await api.post('/auth/login', { name, password });
    return data.data; // Server responds with { success: true, data: { token, user } }
};

// --- USERS API --- //

export const fetchUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data.data; // backend wraps in { success, data }
};

export const createUser = async (name: string, role: Role, passwordRaw: string): Promise<User> => {
    const { data } = await api.post('/users', { name, role, password: passwordRaw });
    return data.data;
};

export const updateRole = async (id: string, role: Role): Promise<User> => {
    const { data } = await api.patch(`/users/${id}/role`, { role });
    return data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};

// --- BOOKINGS API --- //

export const fetchBookings = async (): Promise<Booking[]> => {
    const { data } = await api.get('/bookings');
    return data.data;
};

export const createBooking = async (startTime: string, endTime: string): Promise<Booking> => {
    const { data } = await api.post('/bookings', { startTime, endTime });
    return data.data;
};

export const deleteBooking = async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`);
};

export const fetchGroupedBookings = async (): Promise<GroupedBooking[]> => {
    const { data } = await api.get('/bookings/grouped');
    return data.data;
};

export const fetchBookingSummary = async (): Promise<BookingSummary> => {
    const { data } = await api.get('/bookings/summary');
    return data.data;
};

export default api;
