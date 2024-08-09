import { object, string } from 'zod';

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
