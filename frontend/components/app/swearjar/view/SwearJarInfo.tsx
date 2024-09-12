import { SwearJarProp } from "@/lib/types";
import { useRef } from "react";
import { swearDescriptions } from "@/lib/constants";

import { Button } from "@/components/ui/shadcn/button";
import { HiOutlinePencil } from "react-icons/hi";
import toast, { ErrorIcon } from "react-hot-toast";

export default function SwearJarInfo(swearJar: SwearJarProp) {
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleAddSwear = async () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch('/api/swear', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ swearJarId: swearJar.SwearJarId }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || response.statusText);
                }
                toast.success(swearDescriptions[Math.floor(Math.random() * swearDescriptions.length)], {
                    id: "add-swear-success",
                    duration: 3000,
                    position: 'top-center',
                    icon: <span className="text-xl">🤡</span>,
                });
                // throw new Error("An unexpected error occurred while adding the swear. Please try again later.");
            } catch (error) {
                console.error('Failed to add swear:', error);
                toast.error("Failed to add swear :'(", {
                    id: "add-swear-error",
                    duration: 3000,
                    position: 'top-center',
                    icon: <ErrorIcon />,
                });
            }
        }, 500);

    }
    return (
        <div className="w-full flex flex-col gap-2 border bg-white border-neutral-200 p-4 rounded-2xl">
            <div className="flex justify-between items-center">
                <div className="flex items-end gap-1">
                    <h1 className="text-[40px] leading-[2.25rem] font-bold tracking-tighter">$100</h1>
                    <p className="text-xs">in <b>{swearJar.Name}</b></p>
                </div>
                <div>
                    <Button variant="plain" className="rounded-full md:border-none" size="icon">
                        <HiOutlinePencil size={20} />
                    </Button>
                </div>
            </div>
            <hr className="border-foreground/20" />
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-secondary text-secondary bg-secondary/10 hover:bg-secondary/30 focus-visible:ring-secondary active:bg-secondary/30">Empty</Button>
                <Button className="flex-1" onClick={handleAddSwear}>Oops!</Button>
            </div>
        </div>
    )
}
