import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { fetcher } from "@/lib/utils";
import { SwearJar } from '@/lib/types';


import DefaultContentLayout from "@/components/layout/content";
import MainContent from "./mainContent";
import ErrorAlert from '@/components/shared/ErrorAlert';

interface SwearJarApiResponse {
  msg: string;
  swearJar: SwearJar;
}

export default async function SwearJarPage({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient()
  let errorMessage: string | null = null;
  try {
    await queryClient.prefetchQuery<SwearJarApiResponse>({
      queryKey: [`swearjar?id=${params.id}`],
      queryFn: () => fetcher<SwearJarApiResponse>(`/api/swearjar?id=${params.id}`),
    })
  } catch (error) {
    console.error("Error during prefetch:", error);
    errorMessage = "Error fetching Swear Jar data"
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