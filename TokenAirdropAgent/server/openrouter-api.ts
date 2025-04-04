/**
 * OpenRouter API Service
 * This file contains the integration with OpenRouter for AI capabilities.
 * Documentation: https://openrouter.ai/docs
 */

interface OpenRouterResponse {
  output: string;
  success: boolean;
  error?: string;
}

export class OpenRouterApiService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.model = process.env.OPENROUTER_MODEL || "anthropic/claude-3-haiku";
    
    if (!this.apiKey) {
      console.warn("OPENROUTER_API_KEY is not set. OpenRouter API integration will not function properly.");
    }
  }

  /**
   * Generate AI response for user interaction
   */
  async generateResponse(prompt: string): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://metal-token-airdrop.app", // Use your actual domain
          "X-Title": "Metal Token Airdrop"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are an assistant that helps with token airdrops on the Base network. You provide information about tokens, distribution, and blockchain interactions."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        output: data.choices[0].message.content,
        success: true
      };
    } catch (error) {
      console.error("Error generating response with OpenRouter API:", error);
      return {
        output: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Analyze contract interaction to determine eligibility for airdrop
   */
  async analyzeContractInteraction(
    contractAddress: string, 
    userAddress: string, 
    eventData: any
  ): Promise<{ eligible: boolean; reasoning: string }> {
    try {
      const prompt = `
        Analyze this blockchain contract interaction to determine if it qualifies for a token airdrop:
        Contract Address: ${contractAddress}
        User Address: ${userAddress}
        Event Data: ${JSON.stringify(eventData)}
        
        Should this interaction qualify for an airdrop? Provide a yes/no answer and brief reasoning.
      `;

      const response = await this.generateResponse(prompt);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to analyze contract interaction");
      }

      // Analyze the AI response to determine eligibility
      const output = response.output.toLowerCase();
      const eligible = output.includes("yes") && !output.includes("not eligible");
      
      return {
        eligible,
        reasoning: response.output
      };
    } catch (error) {
      console.error("Error analyzing contract interaction:", error);
      return {
        eligible: false,
        reasoning: error instanceof Error ? error.message : "Analysis failed"
      };
    }
  }

  /**
   * Analyze X account interaction to determine eligibility for airdrop
   */
  async analyzeXInteraction(
    clientXAccount: string,
    userXAccount: string,
    interactionType: string,
    interactionDetails: any
  ): Promise<{ eligible: boolean; reasoning: string }> {
    try {
      const prompt = `
        Analyze this X (Twitter) interaction to determine if it qualifies for a token airdrop:
        Client X Account: ${clientXAccount}
        User X Account: ${userXAccount}
        Interaction Type: ${interactionType}
        Interaction Details: ${JSON.stringify(interactionDetails)}
        
        Should this interaction qualify for an airdrop? Provide a yes/no answer and brief reasoning.
      `;

      const response = await this.generateResponse(prompt);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to analyze X interaction");
      }

      // Analyze the AI response to determine eligibility
      const output = response.output.toLowerCase();
      const eligible = output.includes("yes") && !output.includes("not eligible");
      
      return {
        eligible,
        reasoning: response.output
      };
    } catch (error) {
      console.error("Error analyzing X interaction:", error);
      return {
        eligible: false,
        reasoning: error instanceof Error ? error.message : "Analysis failed"
      };
    }
  }
}

// Export a singleton instance
export const openRouterApiService = new OpenRouterApiService();
