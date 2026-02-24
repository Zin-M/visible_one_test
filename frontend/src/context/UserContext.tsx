import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface UserContextType {
    user: User | null;
    token: string | null;
    setCredentials: (token: string | null, user: User | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load user & token from localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            try {
                setUserState(JSON.parse(storedUser));
                setTokenState(storedToken);
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const setCredentials = (newToken: string | null, newUser: User | null) => {
        setTokenState(newToken);
        setUserState(newUser);

        if (newToken && newUser) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    return (
        <UserContext.Provider value={{ user, token, setCredentials, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a UserProvider');
    }
    return context;
};
