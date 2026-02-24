import { useState, useEffect } from 'react';
import { useAuth } from '../context/UserContext';
import { User, Role } from '../types';
import { fetchUsers, createUser, deleteUser, extractError, updateRole } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Users, UserPlus, Fingerprint, ShieldAlert, Trash2 } from 'lucide-react';

export const UserManagement = () => {
    const { user, setCredentials } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    // Creates
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('user');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setUsers(await fetchUsers());
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createUser(name, role, password);
            setName('');
            setPassword('');
            setRole('user');
            await loadUsers();
        } catch (err) {
            setError(extractError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uId: string) => {
        if (!confirm('Warning: Cascading actions may delete linked records. Proceed?')) return;
        try {
            await deleteUser(uId);
            if (user?.id === uId) setCredentials(null, null);
            else await loadUsers();
        } catch (err) {
            alert("Failed: " + extractError(err));
        }
    };

    const handleChangeRole = async (uId: string, newRole: Role) => {
        try {
            await updateRole(uId, newRole);
            if (user?.id === uId) {
                const token = localStorage.getItem('token');
                setCredentials(token, { ...user, role: newRole });
            }
            await loadUsers();
        } catch (err) {
            alert("Failed setting role: " + extractError(err));
        }
    }

    if (user?.role !== 'admin') {
        return (
            <div className="h-64 flex flex-col items-center justify-center max-w-2xl mx-auto border border-dashed border-destructive/50 rounded-xl bg-destructive/5 mt-12">
                <ShieldAlert size={48} className="text-destructive mb-4" />
                <h3 className="text-lg font-bold text-destructive">Restricted Access</h3>
                <p className="text-sm text-foreground/70">Administrator scope required.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" /> Core Identity
                </h1>
                <p className="text-muted-foreground mt-1">Full CRUD control over authentication objects.</p>
            </div>

            <Card className="shadow-sm border-primary/20">
                <CardHeader className="bg-primary/5 border-b mb-4">
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" /> Provision Node
                    </CardTitle>
                    <CardDescription>Inject a new authenticated user straight into the database cluster.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="uppercase text-[10px] font-bold tracking-wider text-muted-foreground">Full Name / Tag</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="E.g., John Doe"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="uppercase text-[10px] font-bold tracking-wider text-muted-foreground">Access Level</Label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value as Role)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="user">User (Standard)</option>
                                <option value="owner">Owner (Privileged)</option>
                                <option value="admin">Administrator (Root)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="uppercase text-[10px] font-bold tracking-wider text-muted-foreground">Secure Secret</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="********"
                            />
                        </div>

                        <Button disabled={loading} className="w-full text-sm font-semibold h-10">
                            {loading ? 'Committing...' : 'Inject Record'}
                        </Button>
                    </form>
                    {error && <p className="text-sm font-medium mt-4 text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</p>}
                </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden border">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/30 pb-4 border-b">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Database Roster</CardTitle>
                        <CardDescription>Currently resolving {users.length} entities.</CardDescription>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-[80px] text-center">Entity</TableHead>
                                <TableHead className="w-[300px]">Node Configuration</TableHead>
                                <TableHead>Role Allocation</TableHead>
                                <TableHead className="text-right pr-6">Lifecycle</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id} className="group transition-colors flex-wrap">
                                    <TableCell className="text-center">
                                        <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                            {u.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 w-full overflow-hidden">
                                            <span className="font-semibold text-sm truncate">{u.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 truncate max-w-full">
                                                <Fingerprint className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{u.id}</span>
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'owner' ? 'default' : 'secondary'} className="uppercase text-[10px] px-2 py-0.5 rounded-sm shrink-0 shadow-sm border">
                                                {u.role}
                                            </Badge>
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                                                className="border border-input rounded-md text-xs bg-background h-7 px-2 outline-none focus:ring-2 focus:ring-primary shadow-sm hover:bg-muted shrink-0 w-[100px]"
                                            >
                                                <option value="user">User</option>
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 align-middle">
                                        <Button
                                            variant="ghost" size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                                            onClick={() => handleDelete(u.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};
