"use client"

import { fetcher } from "@/lib/utils";
import { SwearJar } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import SwearJarCard from "@/components/app/swearjar/listing/SwearJarCard";

interface SwearJarApiResponse {
    msg: string;
    swearJars: SwearJar[];
}

export default function MainContent() {
    const { data, error, isLoading } = useQuery<SwearJarApiResponse>({
        queryKey: ['swearJars'], 
        queryFn: () => fetcher<SwearJarApiResponse>('/api/swearJar')
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching swear jars: {error.message}</div>;

    return (
        <main className="my-2">
            <div className="flex gap-1 my-[10px]">
                <Input
                    placeholder="Find your Swear Jar by name"
                    onChange={(e) => {
                        console.log(e.target.value);
                    }}
                />
                <Link href="/swearjar/create">
                    <Button className="p-2 hover:text-foreground">
                        <span className="flex items-center sm:hidden">
                            <p className="font-semibold">New</p>
                            <GoPlus size={18} style={{ strokeWidth: 2 }} />
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                            <p>Swear Jar</p>
                            <GoPlus size={18} style={{ strokeWidth: 2 }} />
                        </span>
                    </Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-1 md:gap-x-5 md:gap-y-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
                {data?.swearJars?.map((swearJar: SwearJar) => (
                    <div key={swearJar.Name} className="col-span-1">
                        <SwearJarCard swearJar={swearJar} />
                    </div>
                ))}
            </div>
        </main>
    )
}
