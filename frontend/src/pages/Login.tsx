import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { loginUser, extractError } from '../api';

const schema = z.object({
    name: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export const Login = () => {
    const { user, setCredentials } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    const onSubmit = async (data: FormData) => {
        try {
            const { token, user: loggedInUser } = await loginUser(data.name, data.password);
            setCredentials(token, loggedInUser);
            navigate('/dashboard');
        } catch (err) {
            setError('root', { message: extractError(err) });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
                <p className="text-sm text-gray-500 mb-6">Meeting Room Booking System</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            {...register('name')}
                            className={`border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.name
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                        />
                        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            className={`border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.password
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                        />
                        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                    </div>

                    {errors.root && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {errors.root.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors mt-1"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-xs text-gray-400 mt-6 text-center">
                    Default: <strong>Super Admin</strong> / <strong>password123</strong>
                </p>
            </div>
        </div>
    );
};
