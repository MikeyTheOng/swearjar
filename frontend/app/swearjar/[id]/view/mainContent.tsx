"use client"
import { fetcher } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import BreadcrumbHeader from "@/components/layout/header/breadcrumbHeader";
import { SwearJar } from "@/lib/types";
import SwearJarInfo from "@/components/app/swearjar/view/SwearJarInfo";
import SwearJarTrends from "@/components/app/swearjar/view/SwearJarTrends";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
            <div className="col-span-1 md:col-span-2 order-1">
                <BreadcrumbHeader title={data.swearJar.Name} subtitle={data.swearJar.Desc} />
            </div>
            <div className="col-span-1 order-3 md:order-2">
                <SwearJarTrends />
            </div>
            <div className="col-span-1 order-2 md:order-3">
                <SwearJarInfo {...data.swearJar} />
            </div>
            {/* <div className="col-span-0 md:col-span-1 md:order-4">GAP</div> */}
            {/* <div className="col-span-1 order-5 md:order-4">
                <RecentTransactions />
                TRANSACTIONS
            </div> */}
        </div>
    )
}