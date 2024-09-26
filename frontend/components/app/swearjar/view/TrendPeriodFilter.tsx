"use client"
import { useState } from "react"
import { SwearJarTrendPeriod } from "@/lib/types"

import { Button } from "@/components/ui/shadcn/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu"
import { FaChevronDown } from "react-icons/fa6"

export function TrendPeriodFilter({ period, setPeriod }: { period: SwearJarTrendPeriod, setPeriod: (period: SwearJarTrendPeriod) => void }) {
    const [open, setOpen] = useState(false)
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className="focus:outline-none" tabIndex={-1}>
                <Button className="py-0 px-2 h-7 text-xs rounded-full" variant="plain">
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                    <FaChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${open ? "-rotate-180" : ""}`} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" autoFocus={false} align="end" loop={true}>
                <DropdownMenuLabel>Select Period</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={period} onValueChange={(value) => setPeriod(value as SwearJarTrendPeriod)}>
                    <DropdownMenuRadioItem value={SwearJarTrendPeriod.Days}>Past 6 days</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={SwearJarTrendPeriod.Weeks}>Past 6 weeks</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={SwearJarTrendPeriod.Months}>Past 6 months</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
