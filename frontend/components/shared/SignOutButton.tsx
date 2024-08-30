"use client";

import { useRouter } from 'next/navigation';

import { toast } from 'react-hot-toast';

export default function SignOutButton() {
    const router = useRouter();

    const handleSignout = async () => {
        // Optimistically render the success toast and redirect the user
        toast.success('Signed out successfully', { id: 'signout-toast', position: 'top-center' });
        router.push('/auth/login');

        try {
            const response = await fetch('/api/auth/signOut', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Sign out failed');
            }
        } catch (error) {
            console.error('Sign out failed:', error);
            toast.error('Sign out failed. Please try again.', { position: 'top-center' });
        }
    }

    return (
        <button onClick={handleSignout} className="w-full h-full">
            Sign Out
        </button>
    );
};
