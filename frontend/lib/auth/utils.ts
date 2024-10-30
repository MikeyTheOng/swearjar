import { cookies as nextCookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export function setCookiesFromBackend(backendCookies: string | null) {
    if (!backendCookies) return;

    const cookiesArray = backendCookies.split(/,(?=\s*\w+=)/);
    const cookiesHandler = nextCookies();
    const jwtExpirationTime = parseInt(process.env.JWT_EXPIRATION_TIME!, 10);

    cookiesArray.forEach((cookie) => {
        const [nameValue, ...attributes] = cookie.trim().split('; ');
        const [name, value] = nameValue.split('=');
        const isHttpOnly = name === 'jwt' || name === 'csrf_token_http_only';

        const expiresString = attributes.find(attr => attr.startsWith('Expires'))?.split('=')[1];
        const expires = expiresString ? new Date(expiresString) : new Date(Date.now() + jwtExpirationTime * 60 * 1000);

        const cookieOptions: Partial<ResponseCookie> = {
            path: '/',
            httpOnly: isHttpOnly,
            secure: true,
            sameSite: 'none',
            expires: expires,
        };

        cookiesHandler.set(name, value, cookieOptions);
    });
}