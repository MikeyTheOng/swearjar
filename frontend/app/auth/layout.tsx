import Footer from "@/components/layout/footer"

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="w-full h-dvh flex flex-col">
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </section>
    )
}