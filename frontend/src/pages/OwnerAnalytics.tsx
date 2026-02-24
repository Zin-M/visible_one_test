import { useState, useEffect } from 'react';
import { useAuth } from '../context/UserContext';
import { GroupedBooking, BookingSummary } from '../types';
import { fetchGroupedBookings, fetchBookingSummary } from '../api';
import { format, parseISO } from 'date-fns';

export const OwnerAnalytics = () => {
    const { user } = useAuth();
    const [grouped, setGrouped] = useState<GroupedBooking[]>([]);
    const [summary, setSummary] = useState<BookingSummary | null>(null);

    useEffect(() => {
        Promise.all([fetchGroupedBookings(), fetchBookingSummary()])
            .then(([g, s]) => { setGrouped(g); setSummary(s); })
            .catch(console.error);
    }, []);

    if (user?.role !== 'admin' && user?.role !== 'owner') {
        return <p className="text-sm text-red-600 mt-4">Unauthorized.</p>;
    }

    return (
        <div className="max-w-4xl flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Analytics</h1>
                <p className="text-sm text-gray-500">Booking usage overview.</p>
            </div>

            {/* Summary */}
            {summary && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.overview.totalBookings}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <p className="text-xs text-gray-500 mb-1">Upcoming</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.overview.upcomingBookings}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <p className="text-xs text-gray-500 mb-1">Top Booker</p>
                        <p className="text-lg font-semibold text-gray-900 truncate">{summary.topBooker?.name ?? '—'}</p>
                        {summary.topBooker && (
                            <p className="text-xs text-gray-400">{summary.topBooker.count} bookings</p>
                        )}
                    </div>
                </div>
            )}

            {/* Per-user breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-900">Bookings by User</h2>
                </div>
                {grouped.length === 0 ? (
                    <div className="px-6 py-8 text-sm text-gray-400 text-center">No data.</div>
                ) : (
                    grouped.map(group => (
                        <div key={group.user.id} className="border-b border-gray-100 last:border-0">
                            <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{group.user.name}</span>
                                <span className="text-xs text-gray-400 capitalize">{group.user.role} · {group.bookings.length} bookings</span>
                            </div>
                            {group.bookings.length === 0 ? (
                                <p className="px-6 py-3 text-xs text-gray-400">No bookings.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-50">
                                        {group.bookings.slice(0, 5).map(b => (
                                            <tr key={b.id}>
                                                <td className="px-6 py-2 text-gray-700">{format(parseISO(b.startTime), 'MMM d, yyyy')}</td>
                                                <td className="px-6 py-2 text-gray-500">{format(parseISO(b.startTime), 'HH:mm')} – {format(parseISO(b.endTime), 'HH:mm')}</td>
                                            </tr>
                                        ))}
                                        {group.bookings.length > 5 && (
                                            <tr><td colSpan={2} className="px-6 py-2 text-xs text-gray-400">+{group.bookings.length - 5} more</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
