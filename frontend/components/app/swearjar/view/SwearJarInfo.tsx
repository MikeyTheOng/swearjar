import { SwearJarWithOwners } from "@/lib/types";
import { useAddSwear } from "@/hooks/useAddSwear";

import { Button } from "@/components/ui/shadcn/button";
import { HiOutlinePencil } from "react-icons/hi";

export default function SwearJarInfo({ activeSwears, ...swearJar }: { activeSwears: number } & SwearJarWithOwners) {
    const { handleAddSwear } = useAddSwear(swearJar.SwearJarId);

    return (
        <div className="w-full flex flex-col gap-2 border bg-white border-neutral-200 p-4 rounded-2xl">
            <div className="flex justify-between items-center">
                <div className="flex items-end gap-1">
                    <h1 className="text-[40px] leading-[2.25rem] font-bold tracking-tighter">${activeSwears}</h1>
                    <p className="text-xs">currently in <b>{swearJar.Name}</b></p>
                </div>
                <Button
                    variant="plain"
                    size="icon"
                    className="rounded-full md:border-none"
                    aria-label="Edit Swear Jar"
                    onClick={() => window.location.href = `/swearjar/${swearJar.SwearJarId}/edit`}
                >
                    <HiOutlinePencil size={20} />
                </Button>
            </div>
            <hr className="border-foreground/20" />
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-secondary text-secondary bg-secondary/10 hover:bg-secondary/30 focus-visible:ring-secondary active:bg-secondary/30">Empty</Button>
                <Button className="flex-1" onClick={handleAddSwear}>Oops!</Button>
            </div>
        </div>
    )
}
