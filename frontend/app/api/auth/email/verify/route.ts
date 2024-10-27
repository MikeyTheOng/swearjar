import { apiRequest } from "@/lib/server/apiRequest";
import { z, ZodError } from "zod";

const object = z.object({
    Token: z.string({ required_error: "Token is required" }),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Token } = object.parse(body);
        
        const { data, status } = await apiRequest({
            route: '/auth/email/verify',
            method: 'POST',
            body: { Token },
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
