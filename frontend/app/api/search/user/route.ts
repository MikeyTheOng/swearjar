import { apiRequest } from '@/lib/server/apiRequest';
import { z, ZodError } from 'zod';

const QuerySchema = z.object({
    query: z.string().min(1, 'Query parameter is required'),
});

// /api/search/user?query=...
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // Extract cookies using next/headers
    // const cookieStore = nextCookies();
    // const cookies = cookieStore.getAll(); 

    try {
        // Validate the query parameters using Zod
        const params = QuerySchema.parse({
            query: searchParams.get('query'),
        });

        const { data, status } = await apiRequest({
            route: `/search/user?query=${encodeURIComponent(params.query)}`,
            method: 'GET',
            // cookies
        });
        return new Response(JSON.stringify(data.results), { status: status });
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