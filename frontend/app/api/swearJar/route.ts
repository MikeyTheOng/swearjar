import { auth } from '@/auth';
import { swearJarSchema, userSchema } from '@/lib/schema';
import { apiRequest } from '@/lib/server/apiRequest';
import { z, ZodError } from 'zod';

const swearJarPropsSchema = z.object({
    Name: z.string(),
    Desc: z.string().optional(),
    additionalOwners: z.array(userSchema).optional(),
});

// POST /api/swear - Create new swear jar
export async function POST(request: Request) {
    // Extract cookies using next/headers
    // const cookieStore = nextCookies();
    // const cookies = cookieStore.getAll();

    // TODO: Get User's Id and add it to the Owners array
    // const session = await auth();
    const body = await request.json();
    try {
        // Validate the incoming request body
        const params = swearJarPropsSchema.parse(body);

        // Transform additionalOwners to an array of UserIds and add the UserId of the current user
        // TODO: ADD OWNER INTO OWNERS
        const transformedBody = {
            ...params,
            Owners: params.additionalOwners?.map(owner => owner.UserId),
        };
        // Validate the transformed body with the swearJarSchema
        const validatedBody = swearJarSchema.parse(transformedBody);

        return new Response(JSON.stringify({ params: validatedBody, status: 'success' }), { status: 200 });

        // const { data, status } = await apiRequest({
        //     route: '/swearjar',
        //     method: 'POST',
        //     body: {
        //         title: params.title,
        //     }
        // });
        // return new Response(JSON.stringify(data.results), { status: status });
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