"use client"

import { fetcher } from "@/lib/utils";
import { SwearJarWithId } from "@/lib/types";
import { SwearJarListApiResponse } from "@/lib/apiTypes";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import ErrorAlert from "@/components/shared/ErrorAlert";
import { GoPlus } from "react-icons/go";
import { Input } from "@/components/ui/shadcn/input";
import Link from "next/link";
import SwearJarCard from "@/components/app/swearjar/listing/SwearJarCard";

export default function MainContent() {
    const { data, error, isLoading } = useQuery<SwearJarListApiResponse>({
        queryKey: ['swearjar'],
        queryFn: () => fetcher<SwearJarListApiResponse>('/api/swearjar'),
        refetchOnWindowFocus: "always",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredSwearJars, setFilteredSwearJars] = useState<SwearJarWithId[]>([]);

    useEffect(() => {
        if (data?.swearJars) {
            setFilteredSwearJars(
                data.swearJars.filter((swearJar) =>
                    swearJar.Name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, data]);

    return (
        <main className="my-2">
            <div className="flex gap-2 my-[10px]">
                <Input
                    placeholder="Find your Swear Jar by name"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link href="/swearjar/create" className="h-10 p-2 hover:text-foreground bg-primary text-foreground hover:bg-primary/70 active:bg-primary/70 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition ease-in-out duration-300">
                    <span className="flex items-center sm:hidden">
                        <p className="font-semibold">New</p>
                        <GoPlus size={18} style={{ strokeWidth: 2 }} className="ml-1 group-hover:rotate-90 transition-transform duration-300" />
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                        <p>Swear Jar</p>
                        <GoPlus size={18} style={{ strokeWidth: 2 }} className="group-hover:rotate-90 transition-transform duration-300" />
                    </span>
                </Link>
            </div>
            {isLoading ? (
                <span className="daisy-loading daisy-loading-dots daisy-loading-lg text-primary"></span>
            ) : error ? (
                <ErrorAlert message={`Error fetching your Swear Jars`} />
            ) : data && data.swearJars === null ? (
                <div className="text-center my-4">
                    <h2 className="text-lg font-semibold">No Swear Jars Found</h2>
                    <p className="text-sm text-gray-500">Create a Swear Jar to view them here!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-1 md:gap-x-5 md:gap-y-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
                    {filteredSwearJars.map((swearJar: SwearJarWithId) => (
                        <Link key={swearJar.SwearJarId} href={`/swearjar/${swearJar.SwearJarId}/view`} className="col-span-1 transition ease-in-out duration-300 rounded-xl ring-transparent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:outline-none">
                            <SwearJarCard swearJar={swearJar} />
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
