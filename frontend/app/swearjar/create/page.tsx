import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import MainContent from "./mainContent";

import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader"
import { auth } from '@/auth';


export const metadata: Metadata = {
  title: 'Create Swear Jar | SwearJar',
  description: 'Kick your bad habit today!',
}

export default async function CreateSwearJarPage() {
  const session = await auth();
  if (session) {
    return (
      <section className="w-full md:w-[768px] lg:w-[864px]">
        <div className='mb-4 w-full'>
          <BreadcrumbHeader title="Create SJ" subtitle='Kick your bad habits today!' />
        </div>
        <MainContent />
      </section>
    );
  } else {
    redirect('/auth/login')
  }
}
