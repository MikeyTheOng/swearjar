import { auth } from '@/auth';
import { apiRequest } from '@/lib/server/apiRequest';
import { z, ZodError } from 'zod';

const schema = z.object({
    id: z.string(),
});

// GET /api/swearjar/stats?id={id} - Retrieve Swear Jar Stats
export const GET = auth(async function GET(req) {
    try {
        const session = req.auth;
        if (!session) { 
            return new Response(JSON.stringify({ status: 'error', message: 'User not authenticated' }), { status: 401 });
        }
        
        const { id } = schema.parse({
            id: req.nextUrl.searchParams.get('id')
        });

        const { data, status } = await apiRequest({
            route: `/swearjar/${id}/stats`,
            method: 'GET',
        });

        return new Response(JSON.stringify(data), { status: status });
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
})
