import type { Metadata } from 'next'

import MainContent from "./mainContent";
import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader"


export const metadata: Metadata = {
  title: 'Create Swear Jar | SwearJar',
  description: 'Kick your bad habit today!',
}

export default async function CreateSwearJarPage() {
  return (
    <section className="w-full md:w-[768px] lg:w-[864px]">
      <div className='mb-4 w-full'>
        <BreadcrumbHeader title="Create SJ" subtitle='Kick your bad habits today!' />
      </div>
      <MainContent />
    </section>
  );
}
