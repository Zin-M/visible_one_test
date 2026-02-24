export { };

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: 'admin' | 'owner' | 'user';
            };
        }
    }
}
