export interface UPSRateRequest {
  RateRequest: {
    Request: {
      TransactionReference?: {
        CustomerContext?: string;
      };
    };
    Shipment: {
      Shipper: UPSAddress;
      ShipTo: UPSAddress;
      Package: UPSPackage[];
    };
  };
}

export interface UPSAddress {
  Name: string;
  Address: {
    AddressLine: string[];
    City: string;
    StateProvinceCode: string;
    PostalCode: string;
    CountryCode: string;
  };
}

export interface UPSPackage {
  Packaging: {
    Code: string;
  };
  Dimensions?: {
    UnitOfMeasurement: { Code: string };
    Length: string;
    Width: string;
    Height: string;
  };
  PackageWeight: {
    UnitOfMeasurement: { Code: string };
    Weight: string;
  };
}

export interface UPSRateResponse {
  RateResponse: {
    RatedShipment: {
      Service: {
        Code: string;
      };
      RatedPackage: {
        TotalCharges: {
          MonetaryValue: string;
          CurrencyCode: string;
        };
      }[];
      TotalCharges: {
        MonetaryValue: string;
        CurrencyCode: string;
      };
      GuaranteedDelivery?: {
        BusinessDaysInTransit?: string;
      };
    }[];
  };
}
