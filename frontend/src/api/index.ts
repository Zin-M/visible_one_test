import axios from 'axios';
import { User, Booking, GroupedBooking, BookingSummary, Role } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export const extractError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};


export const loginUser = async (name: string, password: string): Promise<{ token: string, user: User }> => {
    const { data } = await api.post('/auth/login', { name, password });
    return data.data; 
};



export interface Paginated<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const fetchUsers = async (page = 1, limit = 10): Promise<Paginated<User>> => {
    const { data } = await api.get('/users', { params: { page, limit } });
    return data; 
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



export const fetchBookings = async (page = 1, limit = 10): Promise<Paginated<Booking>> => {
    const { data } = await api.get('/bookings', { params: { page, limit } });
    return data;
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
