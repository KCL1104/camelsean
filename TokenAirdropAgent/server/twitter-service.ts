/**
 * Twitter (X) Service
 * This file contains functionality for monitoring Twitter/X account interactions
 */

import type { Airdrop } from "@shared/schema";
import { openRouterApiService } from "./openrouter-api";

interface XAccountInteraction {
  userXHandle: string;
  clientXHandle: string;
  interactionType: string; // like, retweet, comment, follow
  postId?: string;
  timestamp: Date;
  interactionDetails: any;
}

export class TwitterService {
  private apiKey: string;
  private apiSecret: string;
  private accountMonitors: Map<string, NodeJS.Timeout>;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY || "";
    this.apiSecret = process.env.TWITTER_API_SECRET || "";
    this.accountMonitors = new Map();
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn("Twitter API credentials not set. Twitter monitoring will not function properly.");
    }
  }

  /**
   * Start monitoring an X account for interactions
   */
  startMonitoringXAccount(
    airdrop: Airdrop,
    callback: (interaction: XAccountInteraction) => Promise<void>
  ): void {
    if (!airdrop.xAccount) {
      console.error("Cannot monitor airdrop without X account:", airdrop.id);
      return;
    }

    const xAccount = airdrop.xAccount.toLowerCase();
    
    // Check if already monitoring this account
    if (this.accountMonitors.has(xAccount)) {
      console.log(`Already monitoring X account: ${xAccount}`);
      return;
    }
    
    console.log(`Started monitoring X account: ${xAccount} for airdrop: ${airdrop.id}`);
    
    // Simulate periodic checks for X account interactions
    // In a real implementation, you would use Twitter API or a service like Twitter V2 API
    const simulationInterval = setInterval(async () => {
      try {
        console.log(`Checking for interactions with X account: ${xAccount}`);
        
        // In production, fetch real interactions from the Twitter API
        // For demonstration, we'll skip actually fetching interactions
        
      } catch (error) {
        console.error(`Error monitoring X account ${xAccount}:`, error);
      }
    }, 60000); // Check every minute
    
    this.accountMonitors.set(xAccount, simulationInterval);
  }

  /**
   * Stop monitoring an X account
   */
  stopMonitoringXAccount(xAccount: string): void {
    const normalizedHandle = xAccount.toLowerCase();
    const interval = this.accountMonitors.get(normalizedHandle);
    
    if (interval) {
      clearInterval(interval);
      this.accountMonitors.delete(normalizedHandle);
      console.log(`Stopped monitoring X account: ${normalizedHandle}`);
    }
  }

  /**
   * Process an X account interaction
   * This method would be called when an X interaction is detected
   */
  async processXInteraction(
    interaction: XAccountInteraction,
    airdrops: Airdrop[]
  ): Promise<{ airdropId: number; eligible: boolean; reasoning: string } | null> {
    try {
      // Find matching airdrops for this X account
      const matchingAirdrops = airdrops.filter(airdrop => {
        if (!airdrop.xAccount) return false;
        
        const accountMatch = airdrop.xAccount.toLowerCase() === interaction.clientXHandle.toLowerCase();
        const typeMatch = airdrop.triggerType === 'x_account' || airdrop.triggerType === 'both';
        
        // Check if this interaction type is included in the airdrop config
        let interactionMatch = false;
        if (airdrop.xInteractionConfig) {
          const config = airdrop.xInteractionConfig as Record<string, boolean>;
          switch (interaction.interactionType) {
            case 'like':
              interactionMatch = !!config.like;
              break;
            case 'retweet':
              interactionMatch = !!config.retweet;
              break;
            case 'comment':
              interactionMatch = !!config.comment;
              break;
            case 'follow':
              interactionMatch = !!config.follow;
              break;
            default:
              interactionMatch = false;
          }
        }
        
        return accountMatch && typeMatch && interactionMatch;
      });
      
      if (matchingAirdrops.length === 0) {
        console.log(`No matching airdrops found for X account: ${interaction.clientXHandle}, interaction: ${interaction.interactionType}`);
        return null;
      }
      
      // Sort by token amount (prioritize highest reward)
      matchingAirdrops.sort((a, b) => b.tokenAmount - a.tokenAmount);
      
      // Use OpenRouter to analyze the interaction
      const airdrop = matchingAirdrops[0];
      const analysis = await openRouterApiService.analyzeXInteraction(
        interaction.clientXHandle,
        interaction.userXHandle,
        interaction.interactionType,
        interaction.interactionDetails
      );
      
      return {
        airdropId: airdrop.id,
        eligible: analysis.eligible,
        reasoning: analysis.reasoning
      };
    } catch (error) {
      console.error("Error processing X interaction:", error);
      return null;
    }
  }

  /**
   * Check if an X handle is valid
   */
  isValidXHandle(handle: string): boolean {
    // Basic format validation (starts with @ followed by alphanumeric chars)
    return /^@[a-zA-Z0-9_]{1,15}$/.test(handle);
  }

  /**
   * Normalize an X handle (ensure it starts with @)
   */
  normalizeXHandle(handle: string): string {
    if (!handle) return '';
    return handle.startsWith('@') ? handle : `@${handle}`;
  }
}

// Export a singleton instance
export const twitterService = new TwitterService();
