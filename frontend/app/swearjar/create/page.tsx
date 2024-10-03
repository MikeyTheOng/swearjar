import type { Metadata } from 'next'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import MainContent from "./mainContent";
import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader"


export const metadata: Metadata = {
  title: 'Create Swear Jar | SwearJar',
  description: 'Kick your bad habit today!',
}

export default async function CreateSwearJarPage() {
  const session = await auth()
  if (!session) {
    return redirect('/auth/login')
  }
  return (
    <section className="w-full md:w-[768px] lg:w-[864px]">
      <div className='mb-4 w-full'>
        <BreadcrumbHeader title="Create" subtitle='Kick your bad habits today!' />
      </div>
      <MainContent />
    </section>
  );
}
