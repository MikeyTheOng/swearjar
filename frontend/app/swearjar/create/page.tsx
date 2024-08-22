import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import DefaultContentLayout from "@/components/layout/content";
import MainContent from "./mainContent";

import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader"
import { useSession } from 'next-auth/react';
import { auth } from '@/auth';


export const metadata: Metadata = {
  title: 'Create Swear Jar | SwearJar',
  description: 'Kick your bad habit today!',
}

export default async function CreateSwearJarPage() {
  const session = await auth();
  if (session) {
    return (
      <DefaultContentLayout>
        <div className='mb-4'>
          <BreadcrumbHeader title="Create SJ" subtitle='Kick your bad habits today!' />
        </div>
        <MainContent />
      </DefaultContentLayout>
    );
  } else {
    redirect('/auth/login')
  }
}
