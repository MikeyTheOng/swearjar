import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { fetcher } from "@/lib/utils";
import type { Metadata } from 'next'
import { SwearJarApiResponse, RecentSwearsApiResponse, SwearJarTrendApiResponse } from '@/lib/apiTypes';


import DefaultContentLayout from "@/components/layout/content";
import MainContent from "./mainContent";
import ErrorAlert from '@/components/shared/ErrorAlert';

export const metadata: Metadata = {
  title: 'View Swear Jar | SwearJar',
  description: 'View your Swear Jar',
}

export default async function SwearJarPage({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient()
  let errorMessage: string | null = null;
  try {
    // Fetch all data in parallel
    await Promise.all([
      queryClient.prefetchQuery<SwearJarApiResponse>({
        queryKey: [`swearjar?id=${params.id}`],
        queryFn: () => fetcher<SwearJarApiResponse>(`/api/swearjar?id=${params.id}`),
      }),
      queryClient.prefetchQuery<RecentSwearsApiResponse>({
        queryKey: [`swear?id=${params.id}`],
        queryFn: () => fetcher<RecentSwearsApiResponse>(`/api/swear?id=${params.id}`),
      }),
      queryClient.prefetchQuery<SwearJarTrendApiResponse>({
        queryKey: ["swearjar", "trend", params.id, "days"],
        queryFn: () => fetcher<SwearJarTrendApiResponse>(`/api/swearjar/trend?id=${params.id}&period=days`),
      })
    ]);

  } catch (error) {
    console.error("Error during prefetch:", error);
    errorMessage = "Error fetching Swear Jar data";
  }

  if (errorMessage) {
    return <ErrorAlert message={errorMessage} className='h-10' />
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="w-full md:w-[768px] lg:w-[864px]">
        <DefaultContentLayout>
          <MainContent swearJarId={params.id} />
        </DefaultContentLayout>
      </section>
    </HydrationBoundary>
  );
}
