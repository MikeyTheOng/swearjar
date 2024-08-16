import { cookies as nextCookies } from 'next/headers';

function getServerCookies() {
    const cookieStore = nextCookies();
    return cookieStore.getAll().map(cookie => ({
        name: cookie.name,
        value: cookie.value
    }));
}

export async function apiRequest({
    route,
    method,
    body = null,
}: {
    route: string,
    method: string,
    body?: any,
}): Promise<{ response: Response, data: any, status: number }> {

    // Automatically handle cookie extraction if in a server environment
    let cookies: { name: string, value: string }[] = [];
    if (typeof window === 'undefined') {
        cookies = getServerCookies();
    }

    const apiUrl = `${process.env.BACKEND_URL}${route}`;

    // Create the Cookie header string from the extracted cookies
    const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Origin': `${process.env.AUTH_URL}`,
            ...(cookieHeader && { 'Cookie': cookieHeader }), // Conditionally add the Cookie header
        },
        credentials: 'include',
        ...(body && { body: JSON.stringify(body) }), // Conditionally include the body
    };

    try {
        const response = await fetch(apiUrl, config);
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
        }

        return {
            response: response,
            data: responseData,
            status: response.status
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Fetch error: ${error.message}`);
            throw error;
        } else {
            console.error(`Unexpected error: ${JSON.stringify(error)}`);
            throw new Error('Unexpected error occurred');
        }
    }
}
