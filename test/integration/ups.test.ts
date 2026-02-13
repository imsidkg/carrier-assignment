import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { UpsService } from "../../src/services/ups";
import { ErrorCodes } from "../../src/constants/error-codes";

const MOCK_TOKEN = "faKe-ToKeN-123";
const MOCK_UPS_RESPONSE = {
  RateResponse: {
    RatedShipment: [
      {
        Service: { Code: "03" },
        TotalCharges: { MonetaryValue: "15.50", CurrencyCode: "USD" },
        GuaranteedDelivery: { BusinessDaysInTransit: "3" },
      },
    ],
  },
};

describe("UpsService Integration Flow", () => {
  let service: UpsService;

  beforeEach(() => {
    service = new UpsService({
      clientId: "test-client",
      clientSecret: "test-secret",
      baseUrl: "https://wwwcie.ups.com/api",
    });

    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should successfully authenticate and fetch rates", async () => {
    const fetchMock = global.fetch as any;

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: MOCK_TOKEN,
        expires_in: 3600,
        status: "approved",
      }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_UPS_RESPONSE,
    });

    const request = {
      origin: {
        street1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
      },
      destination: {
        street1: "456 Market St",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "US",
      },
      packages: [
        {
          weight: { value: 10, unit: "LBS" as const },
        },
      ],
    };

    const result = await service.getRates(request);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rates).toHaveLength(1);
      expect(result.data.rates[0]).toEqual({
        carrier: "UPS",
        service: "Ground",
        totalPrice: 15.5,
        currency: "USD",
        deliveryDays: 3,
      });
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const rateCallArgs = fetchMock.mock.calls[1];
    expect(rateCallArgs[1].headers.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it("should handle validation errors gracefully", async () => {
    const result = await service.getRates({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR.code);
    }
  });

  it("should handle authentication failures", async () => {
    const fetchMock = global.fetch as any;

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid Client Credentials",
    });

    const result = await service.getRates({
      origin: {
        street1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
      },
      destination: {
        street1: "456 Market St",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "US",
      },
      packages: [
        {
          weight: { value: 10, unit: "LBS" as const },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.AUTH_FAILED.code);
    }
  });

  it("should handle upstream carrier 500 errors", async () => {
    const fetchMock = global.fetch as any;

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: MOCK_TOKEN,
        expires_in: 3600,
        status: "approved",
      }),
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Detailed downstream error",
    });

    const result = await service.getRates({
      origin: {
        street1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
      },
      destination: {
        street1: "456 Market St",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        country: "US",
      },
      packages: [
        {
          weight: { value: 10, unit: "LBS" as const },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.CARRIER_ERROR.code);
    }
  });
});
