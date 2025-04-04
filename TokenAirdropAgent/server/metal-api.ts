/**
 * Metal API Service
 * This file contains the integration with Metal API for token creation and distribution.
 * Documentation: https://docs.metal.build/
 */

import { Token, InsertToken } from "@shared/schema";

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

      return await response.json();
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
