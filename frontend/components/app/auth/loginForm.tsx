"use client"
import Link from "next/link";
import { signIn } from 'next-auth/react';
import { useForm, FieldError } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/shadcn/button"
import ErrorAlert from "@/components/shared/ErrorAlert";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { Input } from "@/components/ui/shadcn/input"
import { Label } from "@/components/ui/shadcn/label"
import PasswordInput from "./passwordInput";

interface LoginFormData {
    Email: string;
    Password: string;
}

export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/swearjar/list';
    const [error, setError] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            Email: "",
            Password: "",
        }
    });

    const handleLogin = async (data: LoginFormData) => {
        try {
            const response = await signIn('credentials', {
                Email: data.Email,
                Password: data.Password,
                redirect: false
            });
            if (response?.error) {
                setError(true);
                const errorMessage = response?.error || response?.status || 'Unknown error';
                console.error("Error message:", errorMessage);
                throw new Error(`Login failed: ${errorMessage}`);
            }
            router.push(callbackUrl);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleLogin)}>
            <div className="grid w-full items-center gap-4">
                {error && <ErrorAlert message="Check your email or password" />}
                <div className="flex flex-col space-y-1.5">
                    <Label>Email</Label>
                    <Input id="email" placeholder="john.doe@example.com" {...register("Email", { required: "Email is required" })} />
                    {errors.Email && <ErrorMessage error={errors.Email as FieldError} />}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <div className="flex justify-between items-center">

                        <Label>Password</Label>
                        <Link href="/auth/password/forgot" className="text-sm text-input/70 hover:text-input hover:underline transition duration-300 ease-in-out">Forgot password?</Link>
                    </div>
                    <PasswordInput register={register} errors={errors} />
                </div>
                <Button className="w-full sm:font-semibold shadow-lg bg-gradient-to-r from-primary to-secondary md:shadow-none hover:text-foreground hover:scale-105">Login</Button>
                <p className="text-center text-sm">
                    Don't have an account? <Link href="/auth/signup" className="font-bold hover:underline hover:text-primary transition duration-300 ease-in-out">Sign up</Link>
                </p>
            </div>
        </form>
    )
}
