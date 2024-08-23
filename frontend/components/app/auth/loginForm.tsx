"use client"
import { useForm, SubmitHandler } from "react-hook-form";
import { signIn } from 'next-auth/react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordInput from "./passwordInput";
import toast, { ErrorIcon } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SignUpFormData {
    Email: string;
    Password: string;
}

export default function LoginForm() {
    const [error, setError] = useState<boolean>(false);
    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            // Email: "",
            // Password: "",

            // ! Testing
            Email: "test1@gmail.com",
            Password: "12345678A!"
        }
    });

    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        try {
            const response = await signIn('credentials', {
                callbackUrl: '/',
                redirect: false,
                Email: data.Email,
                Password: data.Password,
            });

            // console.log("Response (login):", response);
            if (response?.error) {
                setError(true);
                const errorMessage = response?.error || response?.status || 'Unknown error';
                console.error("Error message:", errorMessage);
                // throw new Error(`Login failed: ${errorMessage}`);
                toast.error("Check your email or password", {
                    id: "login-error",
                    duration: 1500,
                    position: 'top-center',
                    icon: <ErrorIcon />,
                });
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
                {error && errorMsg()}
                <div className="flex flex-col space-y-1.5">
                    <Label>Email</Label>
                    <Input id="email" placeholder="john.doe@example.com" {...register("Email", { required: "Email is required" })} />
                    {errors.Email && <span className="text-error">{errors.Email.message}</span>}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label>Password</Label>
                    <PasswordInput register={register} errors={errors} />
                </div>
                {/* // TODO: Forget PW functionality not implemented */}
                {/* <div className="flex justify-end">
                <a>Forgot password?</a>
              </div> */}
                <div>
                    <Button className="w-full sm:font-semibold shadow-lg bg-gradient-to-r from-primary to-secondary hover:text-foreground hover:scale-105">Login</Button>
                </div>
            </div>
        </form>
    )
}

const errorMsg = () => {
    return (
        <div role="alert" className="daisy-alert daisy-alert-error bg-error/10 border-error text-error rounded-lg flex justify-center p-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-600">
                Check your email or password
            </span>
        </div>
    )
}