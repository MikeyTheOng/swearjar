import { SwearJar } from "@/lib/types";

import { Button } from "@/components/ui/shadcn/button";
import { HiOutlinePencil } from "react-icons/hi";


export default function SwearJarInfo(swearJar: SwearJar) {
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
                <Button className="flex-1">Oops!</Button>
            </div>
        </div>
    )
}
