"use client"
import { useEffect, useRef, useState } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useVerifyToken } from '@/hooks/useVerifyToken';
import toast from 'react-hot-toast';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/shadcn/alert";
import { Button } from "@/components/ui/shadcn/button";
import ErrorIcon from '@/components/shared/icons/animated/errorIcon';
import { Label } from "@/components/ui/shadcn/label";
import PasswordInput from './passwordInput';
import { X } from "lucide-react";


interface ResetPasswordFormData {
    Password: string;
}

export default function ResetPasswordForm() {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const router = useRouter();
    const { status } = useSession();
    if (status === 'authenticated') {
        router.push('/swearjar/list');
    }

    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { isTokenVerified, isVerifying } = useVerifyToken(token, 'PasswordReset');

    const encodedTokenRef = useRef<string | null>(null);

    useEffect(() => {
        if (token) {
            encodedTokenRef.current = encodeURIComponent(token);
        }
    }, [token]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            Password: "12345678A!",
        }
    });

    const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
        try {
            await ResetPassword(encodedTokenRef.current, data.Password);
            setShowSuccessMessage(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 1500);
        } catch (error) {
            console.error('Password reset failed:', error);
            toast(
                <span className='bg-background-100'>
                    Please try again.
                </span>,
                {
                    id: "forgot-password-error",
                    duration: 1500,
                    position: 'top-center',
                    style: {
                        background: 'var(--background)',
                    },
                    icon: <ErrorIcon />
                }
            );
            setShowSuccessMessage(false);
        }
    };

    if (isVerifying) {
        return (
            <div className='flex items-center justify-center text-secondary'>
                Verifying token &nbsp;
                <span className="daisy-loading daisy-loading-spinner daisy-loading-md" />
            </div>
        )
    } else if (!isTokenVerified) {
        return (
            <Alert variant="destructive">
                <AlertTitle>PASSWORD RESET TOKEN IS INVALID</AlertTitle>
                <AlertDescription>
                    Please try again.
                </AlertDescription>
            </Alert>
        )
    } else {
        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid w-full items-center gap-4">
                    {showSuccessMessage && (
                        <Alert variant="default" className='border-none'>
                            <div className='flex justify-between items-center'>
                                <AlertDescription className='text-xs md:text-sm text-input/80'>
                                    Password successfully reset!
                                </AlertDescription>
                                <X className="h-5 w-5 stroke-input/80 cursor-pointer" onClick={() => setShowSuccessMessage(false)} />
                            </div>
                        </Alert>
                    )}
                    <div className="flex flex-col space-y-1.5">
                        <Label>Password</Label>
                        <PasswordInput register={register} errors={errors} />
                    </div>
                    <Button className="w-full sm:font-semibold shadow-lg bg-gradient-to-r from-primary to-secondary hover:text-foreground hover:scale-105">Reset Password</Button>
                </div>
            </form>
        );
    }
}

async function ResetPassword(token: string | null, password: string): Promise<void> {
    const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Token: token, Password: password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Password reset failed: ${errorData.error || response.statusText}`);
    }
}
