import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/UserContext';
import { Booking } from '../types';
import { fetchBookings, createBooking, deleteBooking, extractError } from '../api';
import { format, parseISO } from 'date-fns';
import { Pagination } from '../components/Pagination';

const schema = z
    .object({
        startTime: z.string().min(1, 'Start time is required'),
        endTime: z.string().min(1, 'End time is required'),
    })
    .refine(
        d => !d.startTime || !d.endTime || new Date(d.endTime) > new Date(d.startTime),
        { message: 'End time must be after start time', path: ['endTime'] }
    );
type FormData = z.infer<typeof schema>;

export const Bookings = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState<Booking[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    const load = useCallback(async (p: number, ps: number) => {
        setLoading(true);
        try {
            const res = await fetchBookings(p, ps);
            setRows(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(page, pageSize); }, [page, pageSize, load]);

    const onSubmit = async (data: FormData) => {
        try {
            await createBooking(new Date(data.startTime).toISOString(), new Date(data.endTime).toISOString());
            reset();
            load(1, pageSize);
            setPage(1);
        } catch (err) {
            setError('root', { message: extractError(err) });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this booking?')) return;
        setDeleteError(null);
        try {
            await deleteBooking(id);
            load(page, pageSize);
        } catch (err) {
            setDeleteError(extractError(err));
        }
    };

    const fc = (err: boolean) =>
        `border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 w-full ${err ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`;

    return (
        <div className="flex flex-col gap-8 h-full">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Bookings</h1>
                <p className="text-sm text-gray-500">Create and manage meeting room reservations.</p>
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shrink-0">
                <h2 className="text-sm font-medium text-gray-900 mb-4">New Booking</h2>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-gray-500">Start</label>
                        <input type="datetime-local" {...register('startTime')} className={fc(!!errors.startTime)} />
                        {errors.startTime && <p className="text-xs text-red-600">{errors.startTime.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-gray-500">End</label>
                        <input type="datetime-local" {...register('endTime')} className={fc(!!errors.endTime)} />
                        {errors.endTime && <p className="text-xs text-red-600">{errors.endTime.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1 pt-4 shrink-0">
                        <button type="submit" disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
                {errors.root && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">
                        {errors.root.message}
                    </p>
                )}
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-medium text-gray-900">All Bookings</h2>
                    <span className="text-xs text-gray-500">{total} total</span>
                </div>
                {deleteError && (
                    <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                        <p className="text-sm text-red-600">{deleteError}</p>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="px-6 py-8 text-sm text-gray-500">Loading...</div>
                    ) : rows.length === 0 ? (
                        <div className="px-6 py-8 text-sm text-gray-400 text-center">No bookings yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Start</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">End</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                                    <th className="px-6 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-900">{format(parseISO(b.startTime), 'MMM d, yyyy HH:mm')}</td>
                                        <td className="px-6 py-3 text-gray-900">{format(parseISO(b.endTime), 'MMM d, yyyy HH:mm')}</td>
                                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                                            {b.userId === user?.id
                                                ? <span className="text-blue-600 font-medium not-italic">You</span>
                                                : <span className="truncate block max-w-[180px]">{b.userId}</span>
                                            }
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {(user?.role === 'admin' || user?.role === 'owner' || user?.id === b.userId) && (
                                                <button onClick={() => handleDelete(b.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {total > 0 && (
                    <Pagination
                        page={page} totalPages={totalPages}
                        onPageChange={setPage}
                        pageSize={pageSize} totalItems={total}
                        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                    />
                )}
            </div>
        </div>
    );
};
