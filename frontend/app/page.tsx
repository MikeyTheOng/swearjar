"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/shadcn/button';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // router.push('/swearjar/list'); 
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleSignout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Home page work in progress!</h1>
      <p className="text-xl">Redirecting in {countdown} seconds...</p>
      {/* <div className="flex flex-col items-center space-y-2">
        <p>Status: {status}</p>
        {status === 'authenticated' ? (
          <Button onClick={handleSignout}>
            Sign Out
          </Button>
        ) : (
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        )}
        <Button onClick={() => router.push('/swearjar/create')}>
          CreateSJ
        </Button>
      </div> */}
    </main>
  );
}
