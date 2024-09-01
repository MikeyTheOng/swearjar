import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader";

import MainContent from "./mainContent";

export default function SwearJarListPage() {
    return (
        <section className="w-full md:w-[768px] lg:w-[864px]">
            <BreadcrumbHeader title="Swear Jars" subtitle='Your Collection of Swear Jars all in 1 page' />
            <MainContent />
        </section>
    );
}
