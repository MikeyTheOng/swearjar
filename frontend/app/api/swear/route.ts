import { auth } from '@/auth';
import { apiRequest } from '@/lib/server/apiRequest';
import { swearDescriptions } from '@/lib/constants';
import { z, ZodError } from 'zod';

// POST /api/swear - Add a swear to a swear jar
export const POST = auth(async function POST(req) {
    try {
        const session = req.auth;
        if (!session) {
            return new Response(JSON.stringify({ status: 'error', message: 'User not authenticated' }), { status: 401 });
        }

        const body = await req.json();
        const payloadSchema = z.object({
            swearJarId: z.string().min(1, "swearJarId is required"),
        });
        const { swearJarId } = payloadSchema.parse(body);

        const { data, status } = await apiRequest({
            route: '/swear',
            method: 'POST',
            body: {
                SwearJarId: swearJarId,
                SwearDescription: swearDescriptions[Math.floor(Math.random() * swearDescriptions.length)],
            }
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
