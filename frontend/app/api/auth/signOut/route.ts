import { NextResponse } from 'next/server';

export async function POST(request: Request) {  // Accept request as a parameter
    try {
        // Perform sign out first
        const response = NextResponse.json({ message: 'Signed out successfully' });

        deleteCookies(response, 'jwt', true);
        deleteCookies(response, 'csrf_token_http_only', true);
        deleteCookies(response, 'csrf_token', false);

        // Finally, return the response with the redirect
        return response;
    } catch (error) {
        console.error('Sign out failed:', error);
        return new Response(JSON.stringify({ error: 'Sign out failed' }), { status: 500 });
    }
}

const deleteCookies = (response: NextResponse, cookieName: string, isHttpOnly: boolean) => {
    response.cookies.set(cookieName, '', {
        expires: new Date(0), // Expire immediately
        httpOnly: isHttpOnly,
        path: '/',
    });
}
