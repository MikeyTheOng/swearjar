import { auth } from "@/auth";
import { redirect } from "next/navigation";

import Footer from "@/components/layout/footer"

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();
    if (session?.user) {
        redirect("/swearjar/list");
    } else {
        return (
            <section className="w-full h-dvh flex flex-col">
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </section>
        )

    }
}