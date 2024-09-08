"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/shadcn/chart"
import { Button } from "@/components/ui/shadcn/button"

const chartData = [
    { month: "April", desktop: 10 },
    { month: "May", desktop: 20 },
    { month: "June", desktop: 50 },
    { month: "July", desktop: 30 },
    // { month: "August", desktop: 100 },
    { month: "September", desktop: 70 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export default function SwearJarTrends() {
    return (
        <Card className="border-none shadow-none">
            <div className="p-0 flex flew-row justify-between items-center">
                <CardTitle className="text-lg font-medium tracking-tighter">Trend</CardTitle>
                <Button className="py-0 px-2 h-7 text-xs bg-white border border-neutral-200 rounded-full text">Past 7 Days</Button>
            </div>
            <CardContent className="mt-2 p-0">
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 8,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid
                            stroke="currentColor"
                            className="stroke-neutral-300 stroke-1"
                            vertical={false}
                        />
                        <Line
                            dataKey="desktop"
                            type="monotone"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={false}
                        />
                        {/* <Line
                            dataKey="mobile"
                            type="monotone"
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                            dot={false}
                        /> */}
                        <YAxis
                            tickLine={false}
                            tickMargin={4}
                            width={16} 
                            // tick={{ fontSize: "10px" }}
                        />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                            tickFormatter={(value) => value.slice(0, 3)}
                            tick={{ fontSize: "12px" }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent className="text-sm bg-white border border-neutral-200 rounded-md p-2" />} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
