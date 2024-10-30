import { loginSchema } from '@/lib/schema';
import { apiRequest } from '@/lib/server/apiRequest';
import { ZodError } from 'zod';

// /api/auth/login
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsedBody = loginSchema.parse(body);

        const { response, data, status } = await apiRequest({
            route: '/users?action=login',
            method: 'POST',
            body: {
                email: parsedBody.Email,
                password: parsedBody.Password,
            },
        });

        // Forward Set-Cookie headers from the backend response
        const headers = new Headers();
        const backendCookies = response.headers.get('set-cookie');
        if (backendCookies) {
            // Split the combined cookies string into individual cookies
            const cookiesArray = backendCookies.split(/,(?=\s*\w+=)/);
            cookiesArray.forEach((cookie) => {
                // console.log("cookie:", cookie) // ! Debugging
                headers.append('Set-Cookie', cookie.trim());
            });
        }
        
        return new Response(JSON.stringify(data), {
            status: status,
            headers: headers
        });
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