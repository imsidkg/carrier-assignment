import { z } from "zod";
import * as schemas from "./validation";

export type WeightUnit = z.infer<typeof schemas.weightUnitSchema>;
export type DimensionUnit = z.infer<typeof schemas.dimensionUnitSchema>;
export type Address = z.infer<typeof schemas.addressSchema>;
export type Package = z.infer<typeof schemas.packageSchema>;
export type RateRequest = z.infer<typeof schemas.rateRequestSchema>;
export type Rate = z.infer<typeof schemas.rateSchema>;
export type RateResponse = z.infer<typeof schemas.rateResponseSchema>;

export interface CarrierService {
  getRates(request: RateRequest): Promise<RateResponse>;
}
