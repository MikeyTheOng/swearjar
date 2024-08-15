import { signUpSchema } from '@/lib/schema';
import { apiRequest } from '@/lib/utils';
import { ZodError } from 'zod';

// /api/auth/signup
export async function POST(request: Request) {
    console.log("Sign up route")
    try {
        const body = await request.json();
        const parsedBody = signUpSchema.parse(body);

        const { data, status } = await apiRequest({
            route: '/users?action=signup',
            method: 'POST',
            body: {
                Name: parsedBody.Name,
                Email: parsedBody.Email,
                Password: parsedBody.Password,
            },
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