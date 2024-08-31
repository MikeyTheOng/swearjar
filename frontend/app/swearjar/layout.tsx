export default function SwearJarLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // px-6 md:px-24 lg:px-72 xl:px-[30rem]
        <section className="px-4 md:px-24 lg:px-24 xl:px-[20rem] py-2 md:py-10">
            <div>
                {children}
            </div>
        </section>
    );
}