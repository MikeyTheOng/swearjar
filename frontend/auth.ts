import NextAuth, { AuthError, CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { cookies as nextCookies } from "next/headers";
import { User as CustomUser } from "@/lib/types";

import { loginSchema } from "@/lib/schema"
import { ZodError } from "zod";

const AUTH_URL = process.env.AUTH_URL;

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

          // Load environment variables
          const jwtExpirationTime = parseInt(process.env.JWT_EXPIRATION_TIME!, 10); // 1440 minutes

          const backendCookies = response.headers.get('set-cookie');
          // console.log('backendCookies:', backendCookies);
          if (backendCookies) {
            const cookiesArray = backendCookies.split(/,(?=\s*\w+=)/);
            const cookiesHandler = nextCookies(); // Use a different variable name to avoid conflicts

            cookiesArray.forEach((cookie) => {
              const [nameValue, ...attributes] = cookie.trim().split('; ');
              const [name, value] = nameValue.split('=');
              // console.log(`${name}: {${value}}`)
              // Determine HttpOnly based on cookie name
              const isHttpOnly = name === 'jwt' || name === 'csrf_token_http_only';

              // Convert the expires attribute to a Date object or use the JWT expiration time
              const expiresString = attributes.find(attr => attr.startsWith('Expires'))?.split('=')[1];
              const expires = expiresString ? new Date(expiresString) : new Date(Date.now() + jwtExpirationTime * 60 * 1000);

              // ! Debugging
              // console.log(`Setting ${name} cookie with attributes:`, {
              //   name,
              //   value,
              //   path: '/',
              //   httpOnly: isHttpOnly,
              //   secure: isProdEnv,
              //   sameSite: 'none',
              //   expires: expires,
              // });

              cookiesHandler.set(name, value, {
                path: '/',
                httpOnly: isHttpOnly,
                secure: true,
                sameSite: 'none', // Using 'None' for all cookies
                expires: expires,
              });
            });
          }

          const result = await response.json();
          user = result.user;
          console.log('Signed in successfully', user);

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
    jwt({ token, user }) {
      const customUser = user as CustomUser;

      if (customUser) { // User is available during sign-in
        token.Email = customUser.Email;
        token.Name = customUser.Name;
        token.UserId = customUser.UserId;
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.Email = token.Email as string;
        session.user.Name = token.Name as string;
        session.user.UserId = token.UserId as string;
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