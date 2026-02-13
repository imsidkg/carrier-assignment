import { ErrorCodes } from "../../constants/error-codes";
import type {
  CarrierService,
  RateRequest,
  RateResponse,
} from "../../domain/types";
import { rateRequestSchema } from "../../domain/validation";
import { failure, success, type Result } from "../../utils/results";
import { UpsAuth, type UpsAuthConfig } from "./auth";
import { UpsMapper } from "./mapper";
import { CarrierError, ValidationError, AuthError } from "../../errors";
import type { UPSRateRequest, UPSRateResponse } from "./dto";

export class UpsService implements CarrierService {
  private auth: UpsAuth;

  constructor(private config: UpsAuthConfig) {
    this.auth = new UpsAuth(config);
  }

  async getRates(request: RateRequest): Promise<Result<RateResponse>> {
    try {
      const validation = rateRequestSchema.safeParse(request);
      if (!validation.success) {
        return failure(
          ErrorCodes.VALIDATION_ERROR.code,
          "Invalid Rate Request",
          validation.error.format(),
        );
      }

      const token = await this.auth.getAccessToken();

      const payload = UpsMapper.toUpsPayload(request);

      // 4. Call UPS API (Mocked for now?)
      const response = await this.callUpsApi(payload, token);

      const result = UpsMapper.toDomainResponse(response);

      return success(result);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return failure(
          ErrorCodes.VALIDATION_ERROR.code,
          error.message,
          error.details,
        );
      }
      if (error instanceof AuthError) {
        return failure(
          ErrorCodes.AUTH_FAILED.code,
          error.message,
          error.details,
        );
      }
      if (error instanceof CarrierError) {
        return failure(
          ErrorCodes.CARRIER_ERROR.code,
          error.message,
          error.details,
        );
      }
      return failure(
        ErrorCodes.CARRIER_ERROR.code,
        error.message || "Unknown Carrier Error",
        error,
      );
    }
  }

  private async callUpsApi(
    payload: UPSRateRequest,
    token: string,
  ): Promise<UPSRateResponse> {
    const response = await fetch(`${this.config.baseUrl}/rating/v1/Shop`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        transId: crypto.randomUUID(),
        transactionSrc: "testing",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new CarrierError(`UPS API Error: ${response.status}`, {
        status: response.status,
        body: errorText,
      });
    }

    return (await response.json()) as UPSRateResponse;
  }
}
