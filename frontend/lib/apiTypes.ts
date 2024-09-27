import { SwearJarWithId } from "./types";

export interface BaseResponse {
    msg: string;
}

export interface SwearJarApiResponse extends BaseResponse {
    swearJars: SwearJarWithId[];
}
