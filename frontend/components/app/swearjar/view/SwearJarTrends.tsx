"use client"

import { fetcher } from "@/lib/utils"
import { getColor } from "@/lib/getColor";
import { useEffect, useState } from "react";
import {  useSearchParams } from 'next/navigation'
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react";
import { SwearJarTrendApiResponse } from "@/app/swearjar/[id]/view/page";
import { SwearJarTrendPeriod } from "@/lib/types";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/shadcn/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/shadcn/chart"
import { TrendPeriodFilter } from "./TrendPeriodFilter";

export default function SwearJarTrends({ swearJarId }: { swearJarId: string }) {
    const searchParams = useSearchParams();
    const session = useSession();

    const initialPeriod = searchParams.get("period") || "days";
    const [period, setPeriod] = useState<SwearJarTrendPeriod>(initialPeriod as SwearJarTrendPeriod);
    const handleSetPeriod = (period: SwearJarTrendPeriod) => {
        setPeriod(period);
        const url = new URL(window.location.href);
        url.searchParams.set('period', period);
        window.history.replaceState({}, '', url.toString());
    }

    const [chartConfig, setChartConfig] = useState<ChartConfig>({
        michael: {
            label: "Michael",
            color: "hsl(var(--chart-1))",
        },
        timothy: {
            label: "Timothy",
            color: "hsl(var(--chart-2))",
        },
    })

    const { data: { data: chartData } = {}, isLoading, isSuccess } = useQuery<SwearJarTrendApiResponse>({
        queryKey: ["swearjar", "trend", swearJarId, period],
        queryFn: () => fetcher<SwearJarTrendApiResponse>(`/api/swearjar/trend?id=${swearJarId}&period=${period}`),
        refetchOnWindowFocus: "always",
    });
    useEffect(() => {
        if (isSuccess) {
            const tempChartConfig: ChartConfig = {}
            
            Object.entries(chartData?.[0] ?? {}).forEach(([key, value]) => {
                if (key === "label") return;

                const [userId, name] = key.split("|-|");

                const isCurrentUser = userId === session?.data?.user.UserId;
                const colorKey = isCurrentUser ? 1 : getColor();
                tempChartConfig[key] = {
                    label: name,
                    color: `hsl(var(--chart-${colorKey}))`,
                };
            });

            setChartConfig(tempChartConfig)
        }
    }, [isSuccess, chartData])

    return (
        <Card className="border-none shadow-none">
            <div className="p-0 flex flew-row justify-between items-center">
                <CardTitle className="text-lg font-medium tracking-tighter">Trend</CardTitle>
                <TrendPeriodFilter period={period as SwearJarTrendPeriod} setPeriod={handleSetPeriod} />
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
                        {Object.entries(chartConfig).map(([key, value]) => (
                            <Line
                                key={key}
                                dataKey={key}
                                type="monotone"
                                stroke={value.color}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                        <YAxis
                            tickLine={false}
                            tickMargin={4}
                            width={16}
                            tickFormatter={(value) => Math.floor(value) === value ? value : ''} // Only display integers
                        // tick={{ fontSize: "10px" }}
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                            tick={{ fontSize: "12px" }}
                            tickFormatter={(value) => {
                                switch (period) {
                                    case SwearJarTrendPeriod.Weeks:
                                        if (value === "This Week") return "This"
                                        // else if (value === "1 Week(s) Ago") return "Last"
                                        else return value.replace(" Week(s)", "w").replace("Ago", "")
                                    default:
                                        return value
                                }
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent className="text-sm bg-white border border-neutral-200 rounded-md p-2" />} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

// * Expected format of data in the chart
// const data = [
//     { label: "Week 1", michael: 10, timothy: 8 },
//     { label: "Week 2", michael: 20, timothy: 22 },
//     { label: "Week 3", michael: 50, timothy: 35 },
//     { label: "Week 4", michael: 30, timothy: 30 },
//     { label: "Week 5", michael: 100, timothy: 80 },
//     { label: "Week 6", michael: 70, timothy: 69 },
// ];

// * Expected format of chartConfig
// const chartConfig = {
//     michael: {
//         label: "Michael",
//         color: "hsl(var(--chart-1))",
//     },
//     timothy: {
//         label: "Timothy",
//         color: "hsl(var(--chart-2))",
//     },
// } satisfies ChartConfig