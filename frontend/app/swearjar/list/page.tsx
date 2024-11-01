import { auth } from "@/auth";
import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader";
import { redirect } from "next/navigation";

import MainContent from "./mainContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Swear Jar List | SwearJar',
    description: 'Your Collection of Swear Jars all in 1 page',
}

export default async function SwearJarListPage() {
    const session = await auth()
    if (!session) {
        return redirect('/auth/login')
    }
    return (
        <section className="w-full md:w-[768px] lg:w-[864px]">
            <BreadcrumbHeader title="Swear Jars" subtitle='Your Collection of Swear Jars all in 1 page' />
            <MainContent />
        </section>
    );
}
