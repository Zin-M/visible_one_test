import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/UserContext';
import { User, Role } from '../types';
import { fetchUsers, createUser, deleteUser, extractError, updateRole } from '../api';
import { Pagination } from '../components/Pagination';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'owner', 'admin'] as const),
});
type FormData = z.infer<typeof schema>;

export const UserManagement = () => {
    const { user, setCredentials } = useAuth();
    const [rows, setRows] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [actionError, setActionError] = useState<string | null>(null);

    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'user' } });

    const load = useCallback(async (p: number, ps: number) => {
        try {
            const res = await fetchUsers(p, ps);
            setRows(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { load(page, pageSize); }, [page, pageSize, load]);

    const onSubmit = async (data: FormData) => {
        try {
            await createUser(data.name, data.role, data.password);
            reset();
            load(1, pageSize);
            setPage(1);
        } catch (err) {
            setError('root', { message: extractError(err) });
        }
    };

    const handleDelete = async (uId: string) => {
        if (!confirm('Delete this user?')) return;
        setActionError(null);
        try {
            await deleteUser(uId);
            if (user?.id === uId) setCredentials(null, null);
            else load(page, pageSize);
        } catch (err) {
            setActionError(extractError(err));
        }
    };

    const handleChangeRole = async (uId: string, newRole: Role) => {
        setActionError(null);
        try {
            await updateRole(uId, newRole);
            if (user?.id === uId) {
                const token = localStorage.getItem('token');
                setCredentials(token, { ...user, role: newRole });
            }
            load(page, pageSize);
        } catch (err) {
            setActionError(extractError(err));
        }
    };

    if (user?.role !== 'admin') {
        return <p className="text-sm text-red-600 mt-4">Unauthorized. Admins only.</p>;
    }

    const fc = (err: boolean) =>
        `border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 w-full ${err ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`;

    return (
        <div className="flex flex-col gap-8 h-full">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h1>
                <p className="text-sm text-gray-500">Create and manage user accounts.</p>
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shrink-0">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Add User</h2>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Name</label>
                        <input type="text" placeholder="Full name" {...register('name')} className={fc(!!errors.name)} />
                        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Password</label>
                        <input type="password" placeholder="Min 6 chars" {...register('password')} className={fc(!!errors.password)} />
                        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Role</label>
                        <select {...register('role')}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 pt-4">
                        <button type="submit" disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Adding...' : 'Add User'}
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
                    <h2 className="text-sm font-medium text-gray-900">Users</h2>
                    <span className="text-xs text-gray-500">{total} total</span>
                </div>
                {actionError && (
                    <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                        <p className="text-sm text-red-600">{actionError}</p>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                                <th className="px-6 py-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{u.name}</td>
                                    <td className="px-6 py-3">
                                        <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value as Role)}
                                            className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 bg-white outline-none focus:border-blue-400">
                                            <option value="user">User</option>
                                            <option value="owner">Owner</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">{u.id}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => handleDelete(u.id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    page={page} totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={pageSize} totalItems={total}
                    onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                />
            </div>
        </div>
    );
};
