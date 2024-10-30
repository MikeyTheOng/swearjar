import AuthNavbar from "@/components/layout/auth/navbar"
import Footer from "@/components/layout/footer"

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="h-full flex flex-col">
            <AuthNavbar />
            <main className="flex-grow">
                {children}
            </main>
        </section>
    )
}
