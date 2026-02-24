import { ReactNode } from 'react';
import { useAuth } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import {
    BarChart,
    Calendar,
    Home,
    LogOut,
    Building,
    Users
} from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const { user, setCredentials } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        setCredentials(null, null);
        navigate('/');
    };

    const navItem = (path: string, label: string, roles: string[], icon: ReactNode) => {
        if (!user || !roles.includes(user.role)) return null;
        const isActive = location.pathname === path;
        return (
            <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 px-3 ${isActive ? 'bg-secondary font-medium' : 'text-muted-foreground font-normal'}`}
                onClick={() => navigate(path)}
            >
                {icon}
                {label}
            </Button>
        );
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            {user && (
                <aside className="w-[280px] border-r bg-white dark:bg-card flex flex-col shadow-sm hidden md:flex">
                    <div className="h-16 flex items-center px-6 border-b gap-3">
                        <div className="h-8 w-8 bg-zinc-900 rounded-md flex items-center justify-center text-white font-bold">
                            <Building size={18} />
                        </div>
                        <span className="font-semibold text-base whitespace-nowrap overflow-hidden text-ellipsis">Workspace</span>
                    </div>

                    <div className="px-4 py-6 flex flex-col gap-1 flex-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                            Overview
                        </div>
                        {navItem('/dashboard', 'Home', ['admin', 'owner', 'user'], <Home size={18} />)}
                        {navItem('/bookings', 'Bookings', ['admin', 'owner', 'user'], <Calendar size={18} />)}

                        {(user.role === 'admin' || user.role === 'owner') && (
                            <>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">
                                    Administration
                                </div>
                                {navItem('/owner', 'Analytics & Reports', ['owner', 'admin'], <BarChart size={18} />)}
                                {navItem('/users', 'Identity Access', ['admin'], <Users size={18} />)}
                            </>
                        )}
                    </div>

                    <div className="p-4 border-t bg-slate-50/50 dark:bg-card">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-sm font-medium truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground capitalize truncate">{user.role}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full mt-2 justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                            <LogOut size={18} />
                            Log out
                        </Button>
                    </div>
                </aside>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 md:hidden border-b bg-white dark:bg-card flex items-center px-6">
                    <span className="font-semibold">Workspace</span>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-slate-50 dark:bg-slate-950">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
