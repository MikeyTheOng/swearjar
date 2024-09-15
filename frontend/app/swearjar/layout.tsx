import { auth } from "@/auth";
import { redirect } from 'next/navigation'

import FloatingActionButton from "@/components/layout/FloatingActionButton";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

export default async function CreateSJLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) {
        redirect('/auth/login')
    }
    return (
        <section className="h-dvh flex flex-col">
            <Navbar session={session} />
            <main className="flex-grow flex justify-center px-4 mt-7 mb-7">
                {children}
            </main>
            <FloatingActionButton />
            <Footer />
        </section>
    );
}