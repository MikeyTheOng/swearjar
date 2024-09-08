"use client"

import { useState } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"
import { FaChevronDown, } from "react-icons/fa";

export default function SwearJarRecent() {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const transactions = [
        { name: "Michael Ong", date: "Today", message: "Yikes, another one bites the dust!" },
        { name: "Michael Ong", date: "Today", message: "Yikes, another one bites the dust!" },
        { name: "Jane Doe", date: "Yesterday", message: "Oops, I did it again!" },
        { name: "John Smith", date: "Yesterday", message: "Just another day!" },
        { name: "Michael Ong", date: "Yesterday", message: "Yikes, another one bites the dust!" },
    ];

    return (
        <Card className="border-none shadow-none flex flex-col gap-[9px]">
            <div className="p-0 flex flew-row justify-between items-center">
                <CardTitle className="text-lg font-medium tracking-tighter">Recent</CardTitle>
                <Button
                    variant="plain"
                    className="py-0 px-2 h-7 text-xs rounded-full"
                    onClick={toggleExpand}
                >
                    {isExpanded ? "Collapse" : "Expand"}
                    <FaChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${isExpanded ? "-rotate-180" : ""}`} />
                </Button>
            </div>
            <div className={`grid grid-cols-1 ${isExpanded ? "gap-1.5" : "grid-rows-1 h-[90px]"}`}>
                {transactions.map((transaction, index) => (
                    <RecentTransaction
                        key={index}
                        name={transaction.name}
                        date={transaction.date}
                        message={transaction.message}
                        className={`
                            ${isExpanded ? '' : "col-start-1 row-start-1"} 
                            ${!isExpanded ?
                                (
                                    index === 0 ? 'translate-y-0 scale-100 z-[3]' :
                                        index === 1 ? 'translate-y-[20%] scale-95 blur-[0.5px] z-[2]' :
                                            index === 2 ? 'translate-y-[40%] scale-90 blur-[0.7px] z-[1]' :
                                                index > 2 ? 'translate-y-[40%] scale-90 blur-[0.9px] z-[0] shadow-none' :
                                                    'scale-0'
                                ) :
                                ''
                            }
                            w-full
                            transition-transform duration-300
                        `}
                    />
                ))}
            </div>
        </Card>
    )
}

const RecentTransaction = ({ name, date, message, className }: { name: string, date: string, message: string, className: string }) => {
    return (
        <Card className={`group box-border w-full h-[70px] bg-white rounded-xl shadow-md ${className}`}>
            <CardContent className="p-4">
                <div className="flex flex-col justify-between gap-2 w-full">
                    <div className="flex items-center">
                        <div className="box-border w-10 aspect-square p-0.5 bg-primary rounded-full flex items-center justify-center">
                            <p className="text-xl font-semibold">{name.charAt(0).toUpperCase()}</p>
                        </div>
                        <div className="grow ml-2 flex flex-col overflow-hidden w-[80%]">
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-base font-normal tracking-tight">{name}</p>
                                <span className="-mt-1 text-foreground/50 text-xs font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">
                                    {date}
                                </span>
                            </div>
                            <span className="-mt-1 text-foreground/50 text-xs font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">
                                {message}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
