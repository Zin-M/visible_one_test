import { Link } from "react-router-dom";

export function Home() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 p-4">
            <div className="max-w-md w-full text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to Boilerplate</h1>
                <p className="text-muted-foreground">React + Vite + Tailwind + Shadcn UI</p>
            </div>

            <div className="flex gap-4">
                <Link
                    to="/form"
                    className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                    View Sample Form
                </Link>
            </div>
        </div>
    )
}
