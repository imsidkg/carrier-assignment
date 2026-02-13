import { z } from "zod";

export const weightUnitSchema = z.enum(["LBS", "KGS"]);
export const dimensionUnitSchema = z.enum(["IN", "CM"]);

export const addressSchema = z.object({
  street1: z.string().min(1, "Street is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State must be 2 chars").max(2),
  zip: z.string().min(5, "Zip must be at least 5 chars"),
  country: z.string().length(2, "Country must be 2 char ISO code"),
});

export const packageSchema = z.object({
  weight: z.object({
    value: z.number().positive(),
    unit: weightUnitSchema,
  }),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      unit: dimensionUnitSchema,
    })
    .optional(),
});

export const rateRequestSchema = z.object({
  origin: addressSchema,
  destination: addressSchema,
  packages: z.array(packageSchema).min(1),
});

export const rateSchema = z.object({
  carrier: z.string(),
  service: z.string(),
  totalPrice: z.number(),
  currency: z.string(),
  deliveryDays: z.number().optional(),
  error: z.string().optional(),
});

export const rateResponseSchema = z.object({
  rates: z.array(rateSchema),
});
