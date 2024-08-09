"use client"
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from "react-hook-form";
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordInput from "./passwordInput";
import ErrorIcon from '@/components/shared/icons/animated/errorIcon';

interface SignUpFormData {
    Name: string;
    Email: string;
    Password: string;
}
export default function SignUp() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            Name : "",
            Email: "",
            Password: ""

            // ! Testing
            // Name: "Test",
            // Email: "test1@gmail.com",
            // Password: "12345678A!"
        }
    });
    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                toast(
                    <span className='bg-background-100'>
                        {errorData.error || response.statusText}
                    </span>,
                    {
                        id: "sign-up-error",
                        duration: 1500,
                        position: 'top-center',
                        style: {
                            background: 'var(--background)',
                        },
                        icon: <ErrorIcon />
                    }
                );
                throw new Error(`Sign-up failed: ${errorData.error || response.statusText}`);
            }

            router.push('/auth/login');
        } catch (error) {
            console.error('Sign-up failed:', error);
        }

    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label>Name</Label>
                    <Input id="name" placeholder="John Doe" {...register("Name", { required: "Name is required" })} />
                    {errors.Name && <span className="text-error">{errors.Name.message}</span>}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label>Email</Label>
                    <Input id="email" placeholder="john.doe@example.com" {...register("Email", { required: "Email is required" })} />
                    {errors.Email && <span className="text-error">{errors.Email.message}</span>}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label>Password</Label>
                    <PasswordInput register={register} errors={errors} />
                </div>
                <div>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary">Sign Up</Button>
                </div>
            </div>
        </form>
    )
}