import { auth } from "@/auth";
import { redirect } from 'next/navigation'
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import FloatingActionButton from "@/components/layout/FloatingActionButton";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { fetcher } from "@/lib/utils";
import { SwearJarListApiResponse } from "@/lib/apiTypes";

export default async function SwearJarLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) {
        redirect('/auth/login');
    } else if (!session.user.Verified) {
        redirect('/onboarding');
    }

    const queryClient = new QueryClient()
    try {
        await queryClient.prefetchQuery<SwearJarListApiResponse>({
            queryKey: ['swearjar'],
            queryFn: () => fetcher<SwearJarListApiResponse>('/api/swearjar'),
        })
    } catch (error) {
        console.error("Error during prefetch:", error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="h-dvh flex flex-col">
                <Navbar session={session} />
                <main className="flex-grow flex justify-center px-4 my-4 md:my-7">
                    {children}
                </main>
                <FloatingActionButton userId={session.user.UserId} />
                <Footer />
            </section>
        </HydrationBoundary>
    );
}