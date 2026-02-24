import { ReactNode } from 'react';
import { useAuth } from '../context/UserContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'owner', 'user'] },
        { path: '/bookings', label: 'Bookings', roles: ['admin', 'owner', 'user'] },
        { path: '/owner', label: 'Analytics', roles: ['owner', 'admin'] },
        { path: '/users', label: 'Users', roles: ['admin'] },
    ].filter(l => user && l.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-gray-50">
            {user && (
                <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
                    <div className="px-4 py-5 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 text-sm">Booking System</h2>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.name}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide font-medium text-gray-400">{user.role}</span>
                    </div>

                    <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
                        {navLinks.map(({ path, label }) => {
                            const active = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-2 py-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                        >
                            Log out
                        </button>
                    </div>
                </aside>
            )}

            <main className="flex-1 overflow-hidden flex flex-col p-8">
                <div className="flex-1 flex flex-col min-h-0">
                    {children}
                </div>
            </main>
        </div>
    );
};
