"use client"
import Link from "next/link";
import { useSession } from "next-auth/react"
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import { useState, useRef, useEffect } from "react";
import { useVerifyToken } from '@/hooks/useVerifyToken';

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/shadcn/alert";
import { MailCheck } from "lucide-react";

interface VerifyUserResult {
    isVerifyingUser: boolean;
    isVerifiedUser: boolean;
    error: Error | null;
}

export default function EmailVerification() {
    const { data: session, update } = useSession();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const { isTokenVerified, isVerifying: isVerifyingToken } = useVerifyToken(token, 'EmailVerification');
    const encodedTokenRef = useRef<string | null>(null);
    const [verificationState, setVerificationState] = useState<VerifyUserResult>({
        isVerifyingUser: false,
        isVerifiedUser: false,
        error: null
    });

    useEffect(() => {
        if (token) {
            encodedTokenRef.current = encodeURIComponent(token);
        }
    }, [token]);

    const verifyUserMutation = useMutation<Response, Error, string>({
        mutationFn: async (token: string) => {
            const response = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Token: token }),
            });
            if (!response.ok) {
                throw new Error('Email verification failed');
            }
            return response;
        },
    });

    useEffect(() => {
        if (isTokenVerified && encodedTokenRef.current) {
            (async () => {
                try {
                    setVerificationState({ isVerifyingUser: true, isVerifiedUser: false, error: null });
                    await verifyUserMutation.mutateAsync(encodedTokenRef.current!);
                    setVerificationState({ isVerifyingUser: false, isVerifiedUser: true, error: null });
                    update(null);
                } catch (error) {
                    console.error('Email verification failed:', error);
                    setVerificationState({ isVerifyingUser: false, isVerifiedUser: false, error: error as Error });
                }
            })();
        }
    }, [isTokenVerified]);

    if (!session?.user) {
        const callbackUrl = `/auth/email/verify?${searchParams.toString()}`;
        redirect(`/auth/login?callbackUrl=${callbackUrl}`);
    }

    if (isVerifyingToken) {
        return (
            <div className='flex items-center justify-center text-secondary'>
                Verifying token &nbsp;
                <span className="daisy-loading daisy-loading-spinner daisy-loading-md" />
            </div>
        )
    } else if (!isTokenVerified) {
        if (session?.user.Verified) {
            router.push('/swearjar/list');
        }
        return (
            <Alert variant="destructive">
                <AlertTitle>EMAIL VERIFICATION TOKEN IS INVALID</AlertTitle>
                <AlertDescription>
                    Please contact us.
                </AlertDescription>
            </Alert>
        )
    } else if (verificationState.isVerifyingUser) {
        return (
            <div className='flex items-center justify-center text-secondary'>
                Verifying Email &nbsp;
                <span className="daisy-loading daisy-loading-spinner daisy-loading-md" />
            </div>
        )
    } else if (verificationState.isVerifiedUser && verificationState.error === null) {
        return (
            <div className="flex flex-col justify-center gap-2">
                <div className='flex justify-center gap-2 md:mt-0 md:items-center md:h-full'>
                    <MailCheck className="w-6 h-6" />
                    Email Verified
                </div>
                <Link href="/swearjar/list" className="mx-auto p-0 text-secondary font-bold hover:text-input hover:bg-transparent focus-visible:ring-transparent focus-visible:underline transition duration-300 ease-in-out">Go to SwearJar!</Link>
            </div>
        )
    } else {
        return (
            <Alert variant="destructive">
                <AlertTitle>EMAIL VERIFICATION FAILED</AlertTitle>
                <AlertDescription>
                    Please contact us.
                </AlertDescription>
            </Alert>
        )
    }
}
