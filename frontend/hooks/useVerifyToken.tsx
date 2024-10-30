import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

interface VerifyTokenResult {
    isTokenVerified: boolean;
    isVerifying: boolean;
    error: Error | null;
}

export function useVerifyToken(token: string | null, purpose: string): VerifyTokenResult {
    const [isTokenVerified, setIsTokenVerified] = useState(false);

    const { mutate: verifyToken, isIdle, isPending, isError, error } = useMutation<Response, Error, string>({
        mutationFn: async (encodedToken: string) => {
            const response = await fetch('/api/auth/token/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Token: encodedToken,
                    Purpose: purpose,
                }),
            });
            if (!response.ok) {
                throw new Error('Token verification failed');
            }
            return response;
        },
        onSuccess: () => {
            setIsTokenVerified(true);
        },
        onError: (error) => {
            console.error('Error verifying token:', error);
            setIsTokenVerified(false);
        }
    });

    useEffect(() => {
        if (token) {
            const encodedToken = encodeURIComponent(token);
            verifyToken(encodedToken);
        }
    }, [token, verifyToken]);

    return {
        isTokenVerified,
        isVerifying: isIdle || isPending,
        error: isError ? error : null,
    };
}

