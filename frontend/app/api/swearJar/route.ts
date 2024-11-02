import { auth } from '@/auth';
import { swearJarBaseSchema, swearJarWithOwnersSchema, userSchema } from '@/lib/schema';
import { apiRequest } from '@/lib/server/apiRequest';
import { z, ZodError } from 'zod';

// GET /api/swearjar - Retrieve swear jars by userId 
// or GET /api/swearjar?id={swearJarId} - Retrieve a specific swear jar by SwearJar Id
export const GET = auth(async function GET(req) {
    try {
        const session = req.auth;
        if (!session) {
            return new Response(JSON.stringify({ status: 'error', message: 'User not authenticated' }), { status: 401 });
        }

        const swearJarId = req.nextUrl.searchParams.get('id');
        const route = swearJarId ? `/swearjar?id=${swearJarId}` : `/swearjar`;

        const { data, status } = await apiRequest({
            route: route,
            method: 'GET',
        });
        return new Response(JSON.stringify(data), { status: status });
    } catch (error) {
        let errorMessage = 'Unknown error';

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
})

// POST /api/swear - Create new swear jar
export const POST = auth(async function POST(req) {
    try {
        const body = await req.json();

        const session = req.auth;
        const userId = session?.user.UserId;

        if (!userId) {
            return new Response(JSON.stringify({ status: 'error', message: 'User not authenticated' }), { status: 401 });
        }

        // Validate the incoming request body
        const params = swearJarWithOwnersSchema.extend({
            SwearJarId: z.string().optional(),
            CreatedBy: userSchema.optional(),
            LastUpdatedBy: userSchema.optional(),
        }).parse(body);

        // Transform additionalOwners to an array of UserIds and add the UserId of the current user
        const additionalOwners = params.Owners || []; // * Owners received from form excludes the user that submitted the form
        const owners = [...(additionalOwners.map(user => user.UserId)), userId];
        const transformedBody: { Name: string; Owners: string[]; Desc?: string } = {
            Name: params.Name,
            Owners: owners
        };
        if (params.Desc) transformedBody.Desc = params.Desc;

        // Validate the transformed body with the swearJarSchema
        const validatedBody = swearJarBaseSchema.parse(transformedBody);
        const { data, status } = await apiRequest({
            route: '/swearjar',
            method: 'POST',
            body: validatedBody
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

// PUT /api/swearjar - Update a specific swear jar by SwearJar Id
export const PUT = auth(async function PUT(req) {
    try {
        const body = await req.json();

        const session = req.auth;
        if (!session) {
            return new Response(JSON.stringify({ status: 'error', message: 'User not authenticated' }), { status: 401 });
        }
        const userId = session.user.UserId as string;

        const params = swearJarWithOwnersSchema.extend({
            SwearJarId: z.string().min(1, 'SwearJarId is required'),
            Owners: z.array(userSchema)
                .min(1, 'At least one owner is required')
                .refine(owners => owners.some(owner => owner.UserId === userId), {
                    message: "User making the request cannot be removed as an owner"
                }),
        }).parse(body);

        const additionalOwners = params.Owners || [];
        const owners = additionalOwners.map(user => user.UserId);

        const transformedBody: { SwearJarId: string; Name: string; Owners: string[]; Desc?: string } = {
            SwearJarId: params.SwearJarId,
            Name: params.Name,
            Owners: owners
        };
        if (params.Desc) transformedBody.Desc = params.Desc;

        const { data, status } = await apiRequest({
            route: `/swearjar`,
            method: 'PUT',
            body: transformedBody
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
