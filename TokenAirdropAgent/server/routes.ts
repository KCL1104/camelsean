import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { metalApiService } from "./metal-api";
import { openRouterApiService } from "./openrouter-api";
import { ethereumService } from "./ethereum-service";
import { twitterService } from "./twitter-service";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertTokenSchema, 
  insertAirdropSchema, 
  insertActivitySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API Routes

  app.get("/api/tracked-events", async (req: Request, res: Response) => {
    try {
      const response = await fetch("http://localhost:8000/get_events");
      const data = await response.json();
      res.json({ events: data.events || [] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/track-contract", async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      if (!address || typeof address !== "string" || !address.startsWith("0x") || address.length !== 42) {
        return res.status(400).json({ error: "Invalid contract address" });
      }

      const response = await fetch("http://localhost:8000/add_contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_address: address }),
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(500).json({ error: data.detail || "Failed to add contract" });
      }
      return res.json({ message: data.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  // -----------------------------------------------

  // User Routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving user" });
    }
  });

  // Token Routes
  app.post("/api/tokens", async (req, res) => {
    try {
      const tokenData = insertTokenSchema.parse(req.body);
      
      // Create token in Metal API
      let metalTokenData;
      try {
        metalTokenData = await metalApiService.createToken(tokenData);
        // Update the token data with Metal API response
        tokenData.metalTokenId = metalTokenData.id;
        tokenData.contractAddress = metalTokenData.contractAddress;
      } catch (error) {
        console.error("Error creating token in Metal API:", error);
        // Continue with local creation even if Metal API fails
      }
      
      // Create token in local storage
      const token = await storage.createToken(tokenData);
      res.status(201).json(token);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid token data" });
    }
  });

  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.listTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving tokens" });
    }
  });

  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const tokenId = parseInt(req.params.id);
      const token = await storage.getToken(tokenId);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      // Try to get updated data from Metal API
      if (token.metalTokenId) {
        try {
          const metalToken = await metalApiService.getTokenDetails(token.metalTokenId);
          // Update local token data if needed
          if (metalToken.contractAddress && metalToken.contractAddress !== token.contractAddress) {
            await storage.updateToken(token.id, { contractAddress: metalToken.contractAddress });
            token.contractAddress = metalToken.contractAddress;
          }
        } catch (error) {
          console.error("Error getting token details from Metal API:", error);
          // Continue with local data if Metal API fails
        }
      }
      
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving token" });
    }
  });

  // Airdrop Routes
  app.post("/api/airdrops", async (req, res) => {
    try {
      const airdropData = insertAirdropSchema.parse(req.body);
      
      // Validate token exists
      const token = await storage.getToken(airdropData.tokenId);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      // Create airdrop
      const airdrop = await storage.createAirdrop(airdropData);
      
      // Start monitoring based on trigger type
      if (airdrop.triggerType === 'contract' || airdrop.triggerType === 'both') {
        if (airdrop.contractAddress) {
          ethereumService.startMonitoringContract(airdrop, async (event) => {
            // This would be called when contract events are detected
            // In a real implementation, this would handle the contract events
          });
        }
      }
      
      if (airdrop.triggerType === 'x_account' || airdrop.triggerType === 'both') {
        if (airdrop.xAccount) {
          twitterService.startMonitoringXAccount(airdrop, async (interaction) => {
            // This would be called when X account interactions are detected
            // In a real implementation, this would handle the X interactions
          });
        }
      }
      
      res.status(201).json(airdrop);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid airdrop data" });
    }
  });

  app.get("/api/airdrops", async (req, res) => {
    try {
      const airdrops = await storage.listAirdrops();
      res.json(airdrops);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving airdrops" });
    }
  });

  app.get("/api/airdrops/:id", async (req, res) => {
    try {
      const airdropId = parseInt(req.params.id);
      const airdrop = await storage.getAirdropWithToken(airdropId);
      if (!airdrop) {
        return res.status(404).json({ error: "Airdrop not found" });
      }
      res.json(airdrop);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving airdrop" });
    }
  });

  app.patch("/api/airdrops/:id", async (req, res) => {
    try {
      const airdropId = parseInt(req.params.id);
      const airdrop = await storage.getAirdrop(airdropId);
      if (!airdrop) {
        return res.status(404).json({ error: "Airdrop not found" });
      }
      
      // Validate update data
      const updateSchema = z.object({
        active: z.boolean().optional(),
        tokenAmount: z.number().optional(),
        endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
        maxTokens: z.number().optional()
      });
      
      const updates = updateSchema.parse(req.body);
      const updatedAirdrop = await storage.updateAirdrop(airdropId, updates);
      
      res.json(updatedAirdrop);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid update data" });
    }
  });

  // Activity Routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const activities = await storage.listActivitiesWithUserInfo(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving activities" });
    }
  });

  // Dashboard Routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving dashboard stats" });
    }
  });

  // Test Routes
  app.post("/api/test/contract-interaction", async (req, res) => {
    try {
      const schema = z.object({
        contractAddress: z.string(),
        userAddress: z.string(),
        eventName: z.string(),
        eventData: z.any()
      });
      
      const interactionData = schema.parse(req.body);
      
      // Validate addresses
      if (!ethereumService.isValidWalletAddress(interactionData.contractAddress)) {
        return res.status(400).json({ error: "Invalid contract address" });
      }
      
      if (!ethereumService.isValidWalletAddress(interactionData.userAddress)) {
        return res.status(400).json({ error: "Invalid user address" });
      }
      
      // Find user or create one
      let user = await storage.getUserByWalletAddress(interactionData.userAddress);
      if (!user) {
        user = await storage.createUser({
          username: `user_${Date.now()}`,
          password: "password", // In a real app, we would use a secure password
          walletAddress: interactionData.userAddress
        });
      }
      
      // Get active airdrops
      const activeAirdrops = await storage.listActiveAirdrops();
      
      // Process the interaction
      const result = await ethereumService.processContractInteraction(
        interactionData.contractAddress,
        interactionData.userAddress,
        interactionData.eventName,
        interactionData.eventData,
        activeAirdrops
      );
      
      if (!result || !result.eligible) {
        return res.json({ 
          success: false, 
          message: result?.reasoning || "Not eligible for airdrop" 
        });
      }
      
      // Get airdrop details
      const airdrop = await storage.getAirdrop(result.airdropId);
      if (!airdrop) {
        return res.status(404).json({ error: "Airdrop not found" });
      }
      
      // Get token details
      const token = await storage.getToken(airdrop.tokenId);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      // Distribute tokens using Metal API if token has metalTokenId
      let distributionResult = { success: true, transactionHash: "simulated-tx-hash" };
      if (token.metalTokenId) {
        distributionResult = await metalApiService.distributeTokens(
          token.metalTokenId,
          interactionData.userAddress,
          airdrop.tokenAmount
        );
      }
      
      if (!distributionResult.success) {
        // Create activity with failed status
        await storage.createActivity({
          userId: user.id,
          airdropId: airdrop.id,
          eventType: "contract_interaction",
          eventSubtype: interactionData.eventName,
          tokensRewarded: airdrop.tokenAmount,
          status: "failed",
          transactionHash: distributionResult.transactionHash
        });
        
        return res.json({ 
          success: false, 
          message: distributionResult.error || "Token distribution failed" 
        });
      }
      
      // Update airdrop tokens distributed
      await storage.updateAirdrop(airdrop.id, {
        tokensDistributed: (airdrop.tokensDistributed || 0) + airdrop.tokenAmount
      });
      
      // Create activity record
      const activity = await storage.createActivity({
        userId: user.id,
        airdropId: airdrop.id,
        eventType: "contract_interaction",
        eventSubtype: interactionData.eventName,
        tokensRewarded: airdrop.tokenAmount,
        status: "completed",
        transactionHash: distributionResult.transactionHash
      });
      
      res.json({
        success: true,
        activity,
        message: `Successfully airdropped ${airdrop.tokenAmount} ${token.symbol} tokens`
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid interaction data" });
    }
  });

  app.post("/api/test/x-interaction", async (req, res) => {
    try {
      const schema = z.object({
        userXHandle: z.string(),
        clientXHandle: z.string(),
        interactionType: z.enum(['like', 'retweet', 'comment', 'follow']),
        postId: z.string().optional(),
        interactionDetails: z.any()
      });
      
      const interactionData = schema.parse(req.body);
      
      // Normalize X handles
      const normalizedUserHandle = twitterService.normalizeXHandle(interactionData.userXHandle);
      const normalizedClientHandle = twitterService.normalizeXHandle(interactionData.clientXHandle);
      
      // Validate X handles
      if (!twitterService.isValidXHandle(normalizedUserHandle)) {
        return res.status(400).json({ error: "Invalid user X handle" });
      }
      
      if (!twitterService.isValidXHandle(normalizedClientHandle)) {
        return res.status(400).json({ error: "Invalid client X handle" });
      }
      
      // Find user or create one
      let user = await storage.getUserByXHandle(normalizedUserHandle);
      if (!user) {
        user = await storage.createUser({
          username: `${normalizedUserHandle.replace('@', '')}_${Date.now()}`,
          password: "password", // In a real app, we would use a secure password
          xHandle: normalizedUserHandle
        });
      }
      
      // Get active airdrops
      const activeAirdrops = await storage.listActiveAirdrops();
      
      // Process the interaction
      const result = await twitterService.processXInteraction(
        {
          userXHandle: normalizedUserHandle,
          clientXHandle: normalizedClientHandle,
          interactionType: interactionData.interactionType,
          postId: interactionData.postId,
          timestamp: new Date(),
          interactionDetails: interactionData.interactionDetails
        },
        activeAirdrops
      );
      
      if (!result || !result.eligible) {
        return res.json({ 
          success: false, 
          message: result?.reasoning || "Not eligible for airdrop" 
        });
      }
      
      // Get airdrop details
      const airdrop = await storage.getAirdrop(result.airdropId);
      if (!airdrop) {
        return res.status(404).json({ error: "Airdrop not found" });
      }
      
      // Get token details
      const token = await storage.getToken(airdrop.tokenId);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      // If user has no wallet address, we can't distribute tokens
      if (!user.walletAddress) {
        // Create activity with failed status
        await storage.createActivity({
          userId: user.id,
          airdropId: airdrop.id,
          eventType: "x_account_interaction",
          eventSubtype: interactionData.interactionType,
          tokensRewarded: airdrop.tokenAmount,
          status: "failed",
          transactionHash: null
        });
        
        return res.json({ 
          success: false, 
          message: "User has no wallet address for token distribution" 
        });
      }
      
      // Distribute tokens using Metal API if token has metalTokenId
      let distributionResult = { success: true, transactionHash: "simulated-tx-hash" };
      if (token.metalTokenId) {
        distributionResult = await metalApiService.distributeTokens(
          token.metalTokenId,
          user.walletAddress,
          airdrop.tokenAmount
        );
      }
      
      if (!distributionResult.success) {
        // Create activity with failed status
        await storage.createActivity({
          userId: user.id,
          airdropId: airdrop.id,
          eventType: "x_account_interaction",
          eventSubtype: interactionData.interactionType,
          tokensRewarded: airdrop.tokenAmount,
          status: "failed",
          transactionHash: distributionResult.transactionHash
        });
        
        return res.json({ 
          success: false, 
          message: distributionResult.error || "Token distribution failed" 
        });
      }
      
      // Update airdrop tokens distributed
      await storage.updateAirdrop(airdrop.id, {
        tokensDistributed: (airdrop.tokensDistributed || 0) + airdrop.tokenAmount
      });
      
      // Create activity record
      const activity = await storage.createActivity({
        userId: user.id,
        airdropId: airdrop.id,
        eventType: "x_account_interaction",
        eventSubtype: interactionData.interactionType,
        tokensRewarded: airdrop.tokenAmount,
        status: "completed",
        transactionHash: distributionResult.transactionHash
      });
      
      res.json({
        success: true,
        activity,
        message: `Successfully airdropped ${airdrop.tokenAmount} ${token.symbol} tokens`
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid interaction data" });
    }
  });

  // OpenRouter AI Assist Route
  app.post("/api/ai/assist", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(5)
      });
      
      const { prompt } = schema.parse(req.body);
      const response = await openRouterApiService.generateResponse(prompt);
      
      if (!response.success) {
        return res.status(500).json({ error: response.error || "Failed to generate AI response" });
      }
      
      res.json({ response: response.output });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  return httpServer;
}
