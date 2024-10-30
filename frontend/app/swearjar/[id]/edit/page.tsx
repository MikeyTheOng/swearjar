import { auth } from '@/auth';
import { SwearJarApiResponse } from '@/lib/apiTypes';
import { fetcher } from "@/lib/utils";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation';

import BreadcrumbHeader from '@/components/layout/header/breadcrumbHeader';
import DefaultContentLayout from "@/components/layout/content";
import ErrorAlert from '@/components/shared/ErrorAlert';
import MainContent from "./mainContent";


export const metadata: Metadata = {
  title: 'Edit Swear Jar | SwearJar',
  description: 'Edit your Swear Jar',
}

export default async function EditSwearJarPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) {
    return redirect('/auth/login')
  }

  const queryClient = new QueryClient()
  let errorMessage: string | null = null;

  try {
    await queryClient.prefetchQuery<SwearJarApiResponse>({
      queryKey: [`swearjar?id=${params.id}`],
      queryFn: () => fetcher<SwearJarApiResponse>(`/api/swearjar?id=${params.id}`),
    })
  } catch (error) {
    console.error("Error during prefetch:", error);
    errorMessage = "Error fetching Swear Jar data";
  }

  if (errorMessage) {
    console.log("Error:", errorMessage)
    return <ErrorAlert message={errorMessage} className='h-10' />
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="w-full md:w-[768px] lg:w-[864px]">
        <div className='mb-4 w-full'>
          <BreadcrumbHeader title="Edit" subtitle="Modify your Swear Jar" />
        </div>
        <DefaultContentLayout>
          <MainContent swearJarId={params.id} />
        </DefaultContentLayout>
      </section>
    </HydrationBoundary>
  );
}
