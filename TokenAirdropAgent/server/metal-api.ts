/**
 * Metal API Service
 * This file contains the integration with Metal API for token creation and distribution.
 * Documentation: https://docs.metal.build/
 */

import { Token, InsertToken } from "@shared/schema";
import { get } from "@vercel/edge-config";

interface MetalTokenResponse {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  contractAddress?: string;
}

interface TokenDistributionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class MetalApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.METAL_API_KEY || "";
    this.baseUrl = "https://api.metal.build/v1";
    
    if (!this.apiKey) {
      console.warn("METAL_API_KEY is not set. Metal API integration will not function properly.");
    }
  }

  /**
   * Create a new token using Metal API
   */
  async createToken(tokenData: InsertToken): Promise<MetalTokenResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          name: tokenData.name,
          symbol: tokenData.symbol,
          totalSupply: tokenData.totalSupply
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Metal API Error: ${errorData.message || response.statusText}`);
      }
  
      const createResponse = await response.json();
      const jobId = createResponse.jobId;
      if (!jobId) {
        throw new Error("No jobId returned from Metal API");
      }

      const statusUrl = `${this.baseUrl}/merchant/create-token/status/${jobId}`;

      let attempts = 0;
      const maxAttempts = 60;
      const delayMs = 500;

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(statusUrl, {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`
          }
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(`Metal API Status Error: ${errorData.message || statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === "success") {
          const tokenData = statusData.data;
    
          // Store token data in Vercel Edge Config
          try {
            const existingTokens = await get("tokens") as any[] || [];
            console.warn("Edge Config is read-only at runtime. To store tokens, update Edge Config via the Vercel Dashboard or REST API.");
          } catch (storeError) {
            console.error("Failed to store token data in Edge Config:", storeError);
          }
    
          return tokenData;
        } else if (statusData.status === "failed") {
          throw new Error("Token creation failed");
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delayMs));
        attempts++;
      }

      throw new Error("Token creation did not complete in time");
    } catch (error) {
      console.error("Error creating token with Metal API:", error);
      throw error;
    }
  }

  /**
   * Distribute tokens to a user
   */
  async distributeTokens(
    tokenId: string,
    recipientWalletAddress: string,
    amount: number
  ): Promise<TokenDistributionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${tokenId}/distribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          recipient: recipientWalletAddress,
          amount: amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Metal API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        transactionHash: data.transactionHash
      };
    } catch (error) {
      console.error("Error distributing tokens with Metal API:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Get token details from Metal API
   */
  async getTokenDetails(tokenId: string): Promise<MetalTokenResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${tokenId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Metal API Error: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting token details from Metal API:", error);
      throw error;
    }
  }

  /**
   * Get token balance for a user
   */
  async getTokenBalance(tokenId: string, walletAddress: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${tokenId}/balances/${walletAddress}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Metal API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error("Error getting token balance from Metal API:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const metalApiService = new MetalApiService();
