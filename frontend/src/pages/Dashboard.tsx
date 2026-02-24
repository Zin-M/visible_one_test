import { useAuth } from '../context/UserContext';

export const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500 mb-8">Welcome back, {user?.name}.</p>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Session Info</h2>
                <dl className="flex flex-col gap-3 text-sm">
                    <div className="flex gap-4">
                        <dt className="w-20 text-gray-500 shrink-0">Name</dt>
                        <dd className="text-gray-900 font-medium">{user?.name}</dd>
                    </div>
                    <div className="flex gap-4">
                        <dt className="w-20 text-gray-500 shrink-0">Role</dt>
                        <dd className="text-gray-900 font-medium capitalize">{user?.role}</dd>
                    </div>
                    <div className="flex gap-4">
                        <dt className="w-20 text-gray-500 shrink-0">ID</dt>
                        <dd className="text-gray-500 font-mono text-xs break-all">{user?.id}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};
