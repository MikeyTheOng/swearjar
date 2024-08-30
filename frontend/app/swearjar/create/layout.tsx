import Footer from "@/components/layout/footer";

export default function CreateSJLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="h-dvh flex flex-col">
            <main className="flex-grow flex justify-center px-4">
                {children}
            </main>
            <Footer />
        </section>
    );
}