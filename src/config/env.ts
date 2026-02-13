import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  UPS_CLIENT_ID: z.string().min(1),
  UPS_CLIENT_SECRET: z.string().min(1),
  UPS_BASE_URL: z.string().url().default("https://wwwcie.ups.com/api"),
});

export const env = envSchema.parse(process.env);
