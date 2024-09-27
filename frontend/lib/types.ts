import { z } from "zod";
import { userSchema, swearJarBaseSchema, swearJarWithOwnersSchema } from "./schema";

// User Types
export type User = z.infer<typeof userSchema>;

// Swear Jar Types
export type SwearJarBase = z.infer<typeof swearJarBaseSchema>;

export type SwearJarWithOwners = z.infer<typeof swearJarWithOwnersSchema>;

export type SwearJarWithId = SwearJarBase & {
    SwearJarId: string;
};

// Swear Types
export type Swear = {
    UserId: string;
    CreatedAt: Date;
    Active: boolean;
    SwearJarId: string;
    SwearDescription: string;
};

// Enums
export enum SwearJarTrendPeriod {
    Days = "days",
    Weeks = "weeks",
    Months = "months",
}