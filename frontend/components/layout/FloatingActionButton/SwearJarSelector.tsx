import { cn } from "@/lib/utils"
import { useState } from "react"

import { Button } from "@/components/ui/shadcn/button"
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandDialog } from "@/components/ui/shadcn/command"
import { ChevronsUpDown, Check, } from "lucide-react"
import { SwearJarWithId } from "@/lib/types"

interface SwearJarSelectorProps {
    selectedSwearJar: SwearJarWithId | null;
    setSelectedSwearJar: (value: SwearJarWithId | null) => void;
    data?: SwearJarWithId[];
    isLoading: boolean;
}

export default function SwearJarSelector({ selectedSwearJar, setSelectedSwearJar, data, isLoading }: SwearJarSelectorProps) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-transparent hover:bg-primary/60"
                onClick={() => setOpen(!open)}
                disabled={isLoading}
            >
                {isLoading
                    ? <span className="daisy-loading daisy-loading-dots daisy-loading-md text-primary"></span>
                    : selectedSwearJar
                        ? data?.find((swearJarOption) => swearJarOption.Name === selectedSwearJar.Name)?.Name || "Select Swear Jar..."
                        : "Select Swear Jar..."
                }
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen} dialogContentClassName="w-[359px] rounded-md sm:w-full">
                <CommandInput placeholder="Search for Swear Jar by name..." className="w-full h-12 rounded-md border border-input/10" />
                <CommandList className="max-h-[204px] sm:max-h-[248px] overflow-y-auto">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Swear Jars" className={`${!data || data?.length === 0? 'hidden' : ''}`}>
                        {data?.map((swearJarOption) => (
                            <CommandItem
                                key={swearJarOption.Name}
                                value={swearJarOption.Name}
                                className="cursor-pointer hover:bg-primary/60"
                                onSelect={() => {
                                    console.log("Selected Swear Jar:", swearJarOption);
                                    setSelectedSwearJar(swearJarOption);
                                    localStorage.setItem('lastSelectedSwearJar', JSON.stringify(swearJarOption));
                                    setOpen(false);
                                }}
                            >
                                {swearJarOption.Name}
                                <Check
                                    className={cn(
                                        "ml-2 h-4 w-4 stroke-secondary",
                                        selectedSwearJar?.Name === swearJarOption.Name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog >
        </>
    )
}
