import { AuthError } from "../../errors";

export interface UpsAuthConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  status: string;
}

export class UpsAuth {
  private token: string | null = null;
  private expiresAt: number = 0;

  constructor(private config: UpsAuthConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }

    return this.refreshToken();
  }

  private async refreshToken(): Promise<string> {
    try {
      const { clientId, clientSecret, baseUrl } = this.config;
      //we add buffer.from here because UPS server accepts a base64 header and not string
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64",
      );

      const params = new URLSearchParams({
        grant_type: "client_credentials",
      });

      const response = await fetch(`${baseUrl}/security/v1/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        throw new AuthError(`Failed to fetch token: ${response.statusText}`, {
          status: response.status,
          body: await response.text().catch(() => null),
        });
      }

      const data = (await response.json()) as TokenResponse;

      this.token = data.access_token;
      this.expiresAt = Date.now() + (data.expires_in - 30) * 1000;

      return this.token;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Network error during authentication", error);
    }
  }
}
