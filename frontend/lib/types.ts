import { z } from "zod";
import { userSchema, swearJarSchema } from "./schema";

export type User = z.infer<typeof userSchema>;
export type SwearJar = z.infer<typeof swearJarSchema>;
export type SwearJarProp = SwearJar & {
    SwearJarId: string;
}

export type Swear = {
    UserId: string;
    CreatedAt: Date;
    Active: boolean;
    SwearJarId: string;
    SwearDescription: string;
}

export type ChartData = {
    Label: string;
    Metrics: {
        [key: string]: number;
    };
}

export enum SwearJarTrendPeriod {
    Days = "days",
    Weeks = "weeks",
    Months = "months",
}