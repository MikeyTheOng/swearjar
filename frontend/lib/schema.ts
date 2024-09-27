import { array, object, string } from 'zod';

export const signUpSchema = object({
    Name: string({ required_error: "Name is required" })
        .min(1, "Name is required"),
    Email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    Password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, "Password must contain at least one uppercase letter and one special character"),
});

export const loginSchema = object({
    Email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    Password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
});

export const userSchema = object({
    UserId: string().min(1, 'UserId is required'),
    Email: string().email('Invalid email format'),
    Name: string().min(1, 'Name is required'),
});

export const swearJarBaseSchema = object({
    Name: string().min(1, 'Title is required'),
    Desc: string().optional(),
    Owners: array(string()).optional(), // Owners + additionalOwners
});

// Add this new schema
export const swearJarWithOwnersSchema = swearJarBaseSchema.extend({
    Owners: array(userSchema),
});