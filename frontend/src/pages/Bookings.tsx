import { useState, useEffect } from 'react';
import { useAuth } from '../context/UserContext';
import { Booking } from '../types';
import { fetchBookings, createBooking, deleteBooking, extractError } from '../api';
import { format, parseISO } from 'date-fns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { CalendarSearch, CalendarCheck2, Clock, Trash2 } from 'lucide-react';

export const Bookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const data = await fetchBookings();
            setBookings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !endTime) return;

        setSubmitting(true);
        setError(null);

        try {
            const startISO = new Date(startTime).toISOString();
            const endISO = new Date(endTime).toISOString();

            await createBooking(startISO, endISO);

            setStartTime('');
            setEndTime('');
            await loadBookings();
        } catch (err) {
            setError(extractError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        try {
            await deleteBooking(id);
            await loadBookings();
        } catch (err) {
            alert(extractError(err));
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h1>
                <p className="text-muted-foreground mt-1">Manage global reservations across all shared workspaces.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1 border-primary/20 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 text-primary pointer-events-none">
                        <CalendarCheck2 size={80} />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Reserve Slot
                        </CardTitle>
                        <CardDescription>Block out a new time period seamlessly.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <form onSubmit={handleCreate} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground flex items-center gap-2 text-xs uppercase font-bold tracking-wider">
                                    <Clock size={14} /> Start Time
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="h-10 border-input"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground flex items-center gap-2 text-xs uppercase font-bold tracking-wider">
                                    <Clock size={14} /> End Time
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="h-10 border-input"
                                />
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={submitting} className="w-full h-10 shadow-sm">
                                {submitting ? 'Authenticating hold...' : 'Confirm Availability'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Agenda Archive</CardTitle>
                            <CardDescription>All active and past reservations tracking.</CardDescription>
                        </div>
                        <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-semibold">
                            {bookings.length}
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        {loading ? (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
                                <p className="text-sm">Fetching immutable ledger...</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Time Allocation</TableHead>
                                            <TableHead>Principal Identity (UUID)</TableHead>
                                            <TableHead className="w-[80px] text-center">Manage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((b) => (
                                            <TableRow key={b.id} className="group">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-sm">
                                                            {format(parseISO(b.startTime), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock size={12} /> {format(parseISO(b.startTime), 'h:mm a')} - {format(parseISO(b.endTime), 'h:mm a')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px] sm:max-w-[200px] block">
                                                            {b.userId}
                                                        </span>
                                                        {user?.id === b.userId && (
                                                            <Badge variant="default" className="w-fit text-[10px] uppercase h-5 px-1.5 rounded-sm">Your Scope</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(user?.role === 'admin' || user?.role === 'owner' || user?.id === b.userId) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(b.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {bookings.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <CalendarSearch size={32} className="opacity-20" />
                                                        <span>No scheduled locks detected.</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
