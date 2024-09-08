"use client"
import { fetcher } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader";
import { SwearJar } from "@/lib/types";
import SwearJarInfo from "@/components/app/swearjar/view/SwearJarInfo";
import SwearJarTrends from "@/components/app/swearjar/view/SwearJarTrends";
import SwearJarRecent from "@/components/app/swearjar/view/SwearJarRecent";
interface SwearJarApiResponse {
    msg: string;
    swearJar: SwearJar;
}

export default function MainContent({ swearJarId }: { swearJarId: string }) {
    const { data, isLoading } = useQuery<SwearJarApiResponse>({
        queryKey: [`swearjar?id=${swearJarId}`],
        queryFn: () => fetcher<SwearJarApiResponse>(`/api/swearjar?id=${swearJarId}`),
        refetchOnWindowFocus: "always",
    });
    if (isLoading) return <p>Loading...</p>;
    if (!data?.swearJar) return <p>Swear Jar does not exist</p>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-y-3 gap-x-4">
            <div className="col-span-1 md:col-span-5 order-1">
                <BreadcrumbHeader title={data.swearJar.Name} subtitle={data.swearJar.Desc} />
            </div>
            <div className="col-span-1 md:col-span-3 order-3 md:order-2">
                <SwearJarTrends />
            </div>
            <div className="col-span-1 md:col-span-2 order-2 md:order-3 space-y-2">
                <SwearJarInfo {...data.swearJar} />
                <span className="hidden md:block">
                    <SwearJarRecent />
                </span>
            </div>
            {/* <div className="col-span-0 block md:hidden md:col-span-1 md:order-4"></div> */}
            <div className="col-span-1 block md:hidden order-4">
                <SwearJarRecent />
            </div>
        </div>
    )
}