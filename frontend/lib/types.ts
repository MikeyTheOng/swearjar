import { z } from "zod";
import { userSchema, swearJarSchema } from "./schema";

export type User = z.infer<typeof userSchema>;
export type SwearJar = z.infer<typeof swearJarSchema>;
export type SwearJarProp = SwearJar & {
    SwearJarId: string;
}
