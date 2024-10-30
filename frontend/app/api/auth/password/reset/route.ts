import { apiRequest } from "@/lib/server/apiRequest";
import { z, ZodError } from "zod";

const object = z.object({
    Token: z.string({ required_error: "Token is required" }),
    Password: z.string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, "Password must contain at least one uppercase letter and one special character"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Token, Password } = object.parse(body);
        
        const { data, status } = await apiRequest({
            route: '/password/reset',
            method: 'POST',
            body: { Token, Password },
        });
        return new Response(JSON.stringify(data), { status: status });

    } catch (error) {
        console.log("Error:", error)
        let errorMessage = 'Unknown error';

        if (error instanceof ZodError) {
            errorMessage = error.errors.map((err) => `${err.path.join('.')} - ${err.message}`).join(', ');
            console.error('Zod Validation Error:', error.errors);
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
