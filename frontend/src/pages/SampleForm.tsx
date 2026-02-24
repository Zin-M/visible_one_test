import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function SampleForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data: FormValues) => {
        console.log(data);
        alert(JSON.stringify(data, null, 2));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-lg border shadow-sm">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Sample Form</h2>
                    <p className="text-sm text-muted-foreground">Using React Hook Form and Zod</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. johndoe"
                            {...register("username")}
                        />
                        {errors.username && <p className="text-sm font-medium text-destructive">{errors.username.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="hello@example.com"
                            {...register("email")}
                        />
                        {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
                    >
                        Submit
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
