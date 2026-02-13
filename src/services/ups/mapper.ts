import type { Rate, RateRequest, RateResponse } from "../../domain/types";
import type { UPSRateRequest, UPSRateResponse } from "./dto";

export class UpsMapper {
  static toUpsPayload(request: RateRequest): UPSRateRequest {
    return {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: "Ref",
          },
        },
        Shipment: {
          Shipper: {
            Name: "Shipper",
            Address: {
              AddressLine: [
                request.origin.street1,
                request.origin.street2 || "",
              ].filter(Boolean),
              City: request.origin.city,
              StateProvinceCode: request.origin.state,
              PostalCode: request.origin.zip,
              CountryCode: request.origin.country,
            },
          },
          ShipTo: {
            Name: "Receiver",
            Address: {
              AddressLine: [
                request.destination.street1,
                request.destination.street2 || "",
              ].filter(Boolean),
              City: request.destination.city,
              StateProvinceCode: request.destination.state,
              PostalCode: request.destination.zip,
              CountryCode: request.destination.country,
            },
          },
          Package: request.packages.map((pkg) => ({
            Packaging: { Code: "02" },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: pkg.weight.unit === "LBS" ? "LBS" : "KGS",
              },
              Weight: pkg.weight.value.toString(),
            },
            Dimensions: pkg.dimensions
              ? {
                  UnitOfMeasurement: {
                    Code: pkg.dimensions.unit === "IN" ? "IN" : "CM",
                  },
                  Length: pkg.dimensions.length.toString(),
                  Width: pkg.dimensions.width.toString(),
                  Height: pkg.dimensions.height.toString(),
                }
              : undefined,
          })),
        },
      },
    };
  }

  static toDomainResponse(response: UPSRateResponse): RateResponse {
    const rates: Rate[] = response.RateResponse.RatedShipment.map(
      (shipment) => ({
        carrier: "UPS",
        service: this.mapServiceCode(shipment.Service.Code),
        totalPrice: parseFloat(shipment.TotalCharges.MonetaryValue),
        currency: shipment.TotalCharges.CurrencyCode,
        deliveryDays: shipment.GuaranteedDelivery?.BusinessDaysInTransit
          ? parseInt(shipment.GuaranteedDelivery.BusinessDaysInTransit)
          : undefined,
      }),
    );

    return { rates };
  }

  private static mapServiceCode(code: string): string {
    const serviceMap: Record<string, string> = {
      "03": "Ground",
      "01": "Next Day Air",
      "02": "2nd Day Air",
    };
    return serviceMap[code] || `Service Code ${code}`;
  }
}
