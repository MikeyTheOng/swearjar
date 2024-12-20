"use client"
import ErrorMessage from '@/components/shared/ErrorMessage';
import toast from 'react-hot-toast';
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Button } from "@/components/ui/shadcn/button"
import { Input } from "@/components/ui/shadcn/input"
import { Label } from "@/components/ui/shadcn/label"
import PasswordInput from "./passwordInput";
import ErrorIcon from '@/components/shared/icons/animated/errorIcon';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/shadcn/alert';

interface SignUpFormData {
    Name: string;
    Email: string;
    Password: string;
}
export default function SignUp() {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const router = useRouter();
    const { status } = useSession();
    if (status === 'authenticated') {
        router.push('/swearjar/list');
    }

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            Name: "",
            Email: "",
            Password: ""
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
            // const callbackUrl = `/onboarding`;
            // router.push(`/auth/login?callbackUrl=${callbackUrl}`);
            setShowSuccessMessage(true);
            reset();
        } catch (error) {
            console.error('Sign-up failed:', error);
        }

    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
                {showSuccessMessage && <SuccessAlert />}
                <div className="flex flex-col space-y-1.5">
                    <Label>Name</Label>
                    <Input id="name" placeholder="John Doe" {...register("Name", { required: "Name is required" })} />
                    <ErrorMessage error={errors.Name} />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label>Email</Label>
                    <Input id="email" placeholder="john.doe@example.com" {...register("Email", { required: "Email is required" })} />
                    <ErrorMessage error={errors.Email} />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label>Password</Label>
                    <PasswordInput register={register} errors={errors} />
                </div>
                <Button className="w-full sm:font-semibold shadow-lg bg-gradient-to-r from-primary to-secondary hover:text-foreground hover:scale-105">Sign Up</Button>
                <p className="text-center text-sm">
                    Already have an account? <Link href="/auth/login" className="font-bold hover:underline hover:text-primary transition duration-300 ease-in-out">Login</Link>
                </p>
            </div>
        </form>
    )
}

const SuccessAlert = () => {
    return (
        <Alert variant="default" className='border-none'>
            <AlertTitle>Sign Up Successful!</AlertTitle>
            <div className='flex justify-between items-center'>
                <AlertDescription className='text-xs md:text-sm text-input/80'>
                    Please check your email for verification.
                </AlertDescription>
            </div>
        </Alert>
    )
}