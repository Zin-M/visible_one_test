import { useAuth } from '../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Shield, Fingerprint, Activity, Clock } from 'lucide-react';

export const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.name.split(' ')[0] || 'User'}!</h1>
                <p className="text-muted-foreground">Manage your workspace reservations and view daily metrics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Session Status</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <p className="text-xs text-muted-foreground">Connected to secure portal</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Access Level</CardTitle>
                        <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{user?.role}</div>
                        <p className="text-xs text-muted-foreground">Authorization tier</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System UUID</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-mono truncate bg-muted/50 p-1.5 rounded mt-2">{user?.id}</div>
                        <p className="text-xs text-muted-foreground mt-2">Unique network identifier</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Local Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <p className="text-xs text-muted-foreground">Client clock synchronized</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Session Identity Envelope</CardTitle>
                        <CardDescription>Runtime context verified via JSON Web Token signature.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 break-all font-mono text-sm text-muted-foreground leading-relaxed">
                                {`{
  "id": "${user?.id}",
  "name": "${user?.name}",
  "role": "${user?.role}"
}`}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Shortcut workflows for your access.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors block text-sm">
                            <span className="font-semibold block mb-1">Book a Room</span>
                            <span className="text-muted-foreground">Reserve calendar blocks under your scope instantly.</span>
                        </div>
                        {user?.role === 'admin' && (
                            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors block text-sm">
                                <span className="font-semibold block mb-1">Provision New Users</span>
                                <span className="text-muted-foreground">Dispatch new identities into the network.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
