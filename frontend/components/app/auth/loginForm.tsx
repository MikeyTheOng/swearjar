"use client"
import { useForm, SubmitHandler } from "react-hook-form";
import { signIn } from 'next-auth/react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordInput from "./passwordInput";
import toast, { ErrorIcon } from "react-hot-toast";

interface SignUpFormData {
    Email: string;
    Password: string;
}

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            Email: "test1@gmail.com",
            Password: "12345678A!"
        }
    });

    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        try {
            const response = await signIn('credentials', {
                callbackUrl: '/',
                // redirect: false,
                Email: data.Email,
                Password: data.Password,
            });
            console.log("Response (login):", response);

            if (!response || !response.ok) {
                const errorMessage = response?.error || response?.status || 'Unknown error';
                toast(
                    <span className='bg-background-100'>
                        {errorMessage}
                    </span>,
                    {
                        id: "login-error",
                        duration: 1500,
                        position: 'top-center',
                        style: {
                            background: 'var(--background)',
                        },
                        icon: <ErrorIcon />
                    }
                );
                throw new Error(`Login failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
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
                    <Button className="w-full">Login</Button>
                </div>
            </div>
        </form>
    )
}