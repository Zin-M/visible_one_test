import { useState, useEffect } from 'react';
import { useAuth } from '../context/UserContext';
import { GroupedBooking, BookingSummary } from '../types';
import { fetchGroupedBookings, fetchBookingSummary } from '../api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format, parseISO } from 'date-fns';
import { BarChart3, TrendingUp, Users, CalendarCheck, Activity, ShieldAlert } from 'lucide-react';

export const OwnerAnalytics = () => {
    const { user } = useAuth();
    const [grouped, setGrouped] = useState<GroupedBooking[]>([]);
    const [summary, setSummary] = useState<BookingSummary | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [g, s] = await Promise.all([
                    fetchGroupedBookings(),
                    fetchBookingSummary()
                ]);
                setGrouped(g);
                setSummary(s);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (user?.role !== 'admin' && user?.role !== 'owner') {
        return (
            <div className="h-64 flex flex-col items-center justify-center max-w-2xl mx-auto border border-dashed border-destructive/50 rounded-xl bg-destructive/5 mt-12">
                <ShieldAlert size={48} className="text-destructive mb-4" />
                <h3 className="text-lg font-bold text-destructive">Restricted Access</h3>
                <p className="text-sm text-foreground/70">Metrics require Owner or Administrator scope.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" /> Global Analytics
                </h1>
                <p className="text-muted-foreground mt-1">Cross-system metric aggregation and utilization tracking.</p>
            </div>

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Total</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.overview.totalBookings}</div>
                            <p className="text-xs text-muted-foreground mt-1">Schedules negotiated</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Forward Outlook</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{summary.overview.upcomingBookings}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting execution</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Highest Volume Entity</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <div className="text-3xl font-bold truncate flex-1">
                                {summary.topBooker ? summary.topBooker.name : "N/A"}
                            </div>
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
                                {summary.topBooker?.count || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="shadow-sm border-0 ring-1 ring-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" /> Activity Distribution Array
                    </CardTitle>
                    <CardDescription>Network utilization segregated by user identity limits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {grouped.map((group) => (
                            <div key={group.user.id} className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
                                <div className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between">
                                    <div className="flex flex-col overflow-hidden">
                                        <h4 className="font-semibold truncate">{group.user.name}</h4>
                                        <p className="text-[10px] text-muted-foreground font-mono truncate">{group.user.id.split('-')[0]}...</p>
                                    </div>
                                    <Badge variant={group.user.role === 'admin' ? 'destructive' : group.user.role === 'owner' ? 'default' : 'secondary'} className="uppercase text-[9px] shadow-sm ml-2">
                                        {group.user.role}
                                    </Badge>
                                </div>
                                <div className="p-4 flex-1">
                                    <ul className="flex flex-col gap-2.5 text-sm">
                                        {group.bookings.length === 0 ? (
                                            <div className="h-20 flex items-center justify-center italic text-muted-foreground opacity-70">
                                                No active telemetry
                                            </div>
                                        ) : (
                                            group.bookings.slice(0, 4).map(b => (
                                                <li key={b.id} className="flex justify-between items-center text-muted-foreground">
                                                    <span className="font-medium text-foreground">{format(parseISO(b.startTime), 'MMM d')}</span>
                                                    <span className="text-xs">{format(parseISO(b.startTime), 'h:mm a')} — {format(parseISO(b.endTime), 'h:mm a')}</span>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                                {group.bookings.length > 4 && (
                                    <div className="p-2 border-t text-center text-[11px] font-semibold text-primary bg-primary/5 uppercase tracking-wide">
                                        + {group.bookings.length - 4} Archival Logs Omitted
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
