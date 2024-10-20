import { SwearJarWithId, SwearJarWithOwners, Swear, User } from "./types";

export interface BaseResponse {
    msg: string;
}

export interface SwearJarListApiResponse extends BaseResponse {
    swearJars: SwearJarWithId[];
}

export interface SwearJarApiResponse extends BaseResponse {
    swearJar: SwearJarWithOwners;
}

export interface RecentSwearsApiResponse extends BaseResponse {
    data: {
        swears: Swear[];
        users: { [key: string]: User };
    }
}

export interface SwearJarTrendApiResponse extends BaseResponse {
    data: {
        label: string;
        [key: string]: number | string; // This allows for one or more users with their respective swear counts
    }[];
}
