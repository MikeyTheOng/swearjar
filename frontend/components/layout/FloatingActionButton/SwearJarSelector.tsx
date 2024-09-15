import { cn } from "@/lib/utils"
import { useState } from "react"

import { Button } from "@/components/ui/shadcn/button"
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandDialog } from "@/components/ui/shadcn/command"
import { ChevronsUpDown, Check, } from "lucide-react"

import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
} from "lucide-react"

export default function SwearJarSelector() {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    // TODO: Replace with actual swear jars
    const frameworks = [
        { value: "next.js", label: "Next.js" },
        { value: "sveltekit", label: "SvelteKit" },
        { value: "nuxt.js", label: "Nuxt.js" },
        { value: "remix", label: "Remix" },
        { value: "astro", label: "Astro" },
    ]

    return (
        <>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-transparent"
                onClick={() => setOpen(!open)}
            >
                {value
                    ? frameworks.find((framework) => framework.value === value)?.label
                    : "Select Swear Jar..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                        {frameworks.map((framework) => (
                            <CommandItem 
                                key={framework.value} 
                                value={framework.value} 
                                className="cursor-pointer"
                                onSelect={(currentValue) => {
                                    setValue(currentValue)
                                    setOpen(false)
                                    console.log(currentValue, "selected")
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === framework.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {framework.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
