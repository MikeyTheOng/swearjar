import NextAuth, { DefaultSession } from "next-auth"
import {DefaultJWT} from "@auth/core/jwt";
import { User } from "@/lib/types";

declare module "next-auth" {
    interface Session {
        // Add any properties you want to include in the session
        user: User & DefaultSession["user"]
    }
}

declare module "@auth/core/jwt" {
    interface JWT extends DefaultJWT {
        Email: User["Email"];
        Name: User["Name"];
        UserId: User["UserId"];
        Verified: User["Verified"];
    }
}