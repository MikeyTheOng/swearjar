import NextAuth, { AuthError, CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { cookies as nextCookies } from "next/headers";
import { User as CustomUser } from "@/lib/types";

import { loginSchema } from "@/lib/schema"
import { ZodError } from "zod";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { apiRequest } from "@/lib/server/apiRequest";

const AUTH_URL = process.env.AUTH_URL;
const AUTH_SECRET = process.env.AUTH_SECRET;

interface CustomJwtPayload extends JwtPayload {
  UserId: string;
  Email: string;
  Name: string;
  iat: number;
  exp: number;
}

function getGolangJWT(): CustomJwtPayload {
  const cookies = nextCookies();
  const jwtCookie = cookies.get('jwt');

  if (!jwtCookie || !jwtCookie.value) {
    throw new Error('JWT cookie not found');
  }

  try {
    // Verify the JWT with the secret
    const decodedToken = jwt.verify(jwtCookie.value, AUTH_SECRET as Secret) as CustomJwtPayload;

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      throw new Error('Token has expired');
    }

    // Return the claims
    return {
      UserId: decodedToken.UserId,
      Email: decodedToken.Email,
      Name: decodedToken.Name,
      iat: decodedToken.iat,
      exp: decodedToken.exp
    };
  } catch (error) {
    console.error('Error validating JWT:', error);
    throw new Error('Invalid token');
  }
}

function setCookiesFromBackend(backendCookies: string | null) {
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null

        const { Email, Password } = await loginSchema.parseAsync(credentials)
        try {
          const response = await fetch(`${AUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Email: Email,
              Password: Password,
            }),
          });

          if (!response.ok) {
            const errorResult = await response.json();
            console.error('Error Result:', errorResult);
            if (errorResult.error === 'no documents found' || errorResult.error === 'Unauthorized' || errorResult instanceof ZodError) {
              // No user found, so this is their first attempt to login
              // meaning this is also the place you could do registration
              // return null;
              throw new CredentialsSignin("Check your email and password")
            }

            throw new Error(errorResult.error)
          }

          const backendCookies = response.headers.get('set-cookie');
          setCookiesFromBackend(backendCookies);

          const result = await response.json();
          user = result.user;
          // console.log('Signed in successfully', user); // ! Debugging

          return user
        } catch (error) {
          if (error instanceof AuthError) {
            console.error("AuthError:", error);
            switch (error.type) {
              case 'CredentialsSignin':
                throw error;
              default:
                throw new Error('Something went wrong during sign-in');
            }
          }

          // Handle all other errors
          console.error("Error:", error instanceof Error ? error.message : "Unexpected error");
          throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, trigger, user, session }) => {
      if (trigger === "update") {
        try {
          const { response, data } = await apiRequest({
            route: '/users',
            method: 'GET',
          });

          // Update cookies
          const backendCookies = response.headers.get('Set-Cookie');
          if (backendCookies) {
            setCookiesFromBackend(backendCookies);
          } else {
            console.warn('jwt cookie not updated');
          }

          const updatedUser = data.user;

          token.Email = updatedUser.Email;
          token.Name = updatedUser.Name;
          token.UserId = updatedUser.UserId;
          token.Verified = updatedUser.Verified;

          return token
        } catch (error) {
          console.error("Error:", error instanceof Error ? error.message : "Unexpected error");
          // throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
      }
      // next-auth session refreshes whereas the jwt issued by golang does not, hence determine if the golang jwt has expired
      const golangJWT = getGolangJWT();
      if (golangJWT.exp < new Date().getTime() / 1000) {
        console.log("Golang JWT has expired");
        return null;
      }

      // ! Debugging
      // console.log("Current Time:", new Date().toLocaleString()); 
      // console.log("Golang JWT exp:", new Date(golangJWT.exp * 1000).toLocaleString()); 

      const customUser = user as CustomUser;

      if (customUser) { // User is available during sign-in
        token.Email = customUser.Email;
        token.Name = customUser.Name;
        token.UserId = customUser.UserId;
        token.Verified = customUser.Verified;
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.Email = token.Email as string;
        session.user.Name = token.Name as string;
        session.user.UserId = token.UserId as string;
        session.user.Verified = token.Verified as boolean;
      } else {
        console.log("Token is missing or invalid");
      }
      return session;
    }

  },
  session: {
    strategy: "jwt",
    maxAge: 60 * parseInt(process.env.JWT_EXPIRATION_TIME as string), // 24 hours
    updateAge: 60 * parseInt(process.env.JWT_EXPIRATION_TIME as string), // if updateAge == maxAge, the session will not be updated
  },
})
