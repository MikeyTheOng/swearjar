"use client"

import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import { Input } from "@/components/ui/input";
import SwearJarCard from "@/components/app/swearjar/listing/SwearJarCard";


export default function MainContent() {
    
    return (
        <main>
            <div className="flex gap-1 my-[10px]">
                <Input
                    placeholder="Find your Swear Jar by name"
                    onChange={(e) => {
                        console.log(e.target.value);
                    }}
                />
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
            </div>
            <div className="grid grid-cols-1 gap-1 md:gap-x-5 md:gap-y-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
                <div className="col-span-1">
                    <SwearJarCard />
                </div>
                <div className="col-span-1">
                    <SwearJarCard />
                </div>
                <div className="col-span-1">
                    <SwearJarCard />
                </div>
                <div className="col-span-1">
                    <SwearJarCard />
                </div>
                <div className="col-span-1">
                    <SwearJarCard />
                </div>
                <div className="col-span-1">
                    <SwearJarCard />
                </div>
            </div>

        </main>
    )
}
