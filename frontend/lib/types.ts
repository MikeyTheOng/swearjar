import { z } from "zod";
import { userSchema } from "./schema";

export type User = z.infer<typeof userSchema>;
