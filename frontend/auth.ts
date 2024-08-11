import NextAuth, { AuthError } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { loginSchema } from "@/lib/schema"

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
            console.error('Error:', errorResult.error);
            throw new Error(errorResult.error)
          }

          const result = await response.json();
          user = result.user;
          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            throw new Error("User not found.")
          }

          console.log('Signed in successfully');
          // return user object with their profile data
          return user
        } catch (error) {
          if (error instanceof AuthError) {
            switch (error.type) {
              case 'CredentialsSignin':
                return 'Invalid credentials';
              default:
                return 'Something went wrong';
            }
          }
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // if updateAge == maxAge, the session will not be updated
  },
})