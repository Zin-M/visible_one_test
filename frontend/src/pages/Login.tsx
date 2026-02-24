import { useState, useEffect } from 'react';
import { useAuth } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { loginUser, extractError } from '../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CalendarDays, AlertCircle } from 'lucide-react';

export const Login = () => {
    const { user, setCredentials } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { token, user: loggedInUser } = await loginUser(name, password);
            setCredentials(token, loggedInUser);
            navigate('/dashboard');
        } catch (err) {
            setError(extractError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">
                <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white mb-6 shadow-sm border border-border">
                    <CalendarDays size={24} />
                </div>
                <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                    Sign in to Workspace
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Meeting room reservation portal
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <Card className="shadow-lg border-0 ring-1 ring-border/50">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Login Portal</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username">Corporate Identity</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="your-system-id"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Secret Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="h-11"
                                />
                            </div>

                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-sm mt-4">
                                {loading ? 'Verifying identity...' : 'Sign in securely'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col border-t bg-muted/30 px-6 py-4">
                        <div className="text-sm text-muted-foreground text-center">
                            By clicking continue, you agree to our Terms of Service and Privacy Policy. Default test user is <strong>Super Admin</strong> / <strong>password123</strong>.
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
