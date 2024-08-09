import { loginSchema } from '@/lib/schema';
import { apiRequest } from '@/lib/utils';
import { ZodError } from 'zod';

// /api/auth/login
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsedBody = loginSchema.parse(body);

        const { response, status } = await apiRequest({
            route: '/users?action=login',
            method: 'POST',
            body: {
                email: parsedBody.Email,
                password: parsedBody.Password,
            },
        });
        return new Response(JSON.stringify(response), { status: status });
    } catch (error) {
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