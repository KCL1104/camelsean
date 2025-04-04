import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base database schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  xHandle: text("x_handle"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  totalSupply: integer("total_supply").notNull(),
  metalTokenId: text("metal_token_id"),
  contractAddress: text("contract_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const airdrops = pgTable("airdrops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tokenId: integer("token_id").notNull(),
  triggerType: text("trigger_type").notNull(), // 'contract', 'x_account', 'both'
  contractAddress: text("contract_address"),
  xAccount: text("x_account"),
  interactionType: text("interaction_type"), // 'any', 'deposit', 'trade', etc
  xInteractionConfig: jsonb("x_interaction_config"), // {like: boolean, retweet: boolean, comment: boolean, follow: boolean}
  tokenAmount: integer("token_amount").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  maxTokens: integer("max_tokens"),
  tokensDistributed: integer("tokens_distributed").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  airdropId: integer("airdrop_id").notNull(),
  eventType: text("event_type").notNull(), // 'contract_interaction', 'x_account_interaction'
  eventSubtype: text("event_subtype"), // 'deposit', 'trade', 'like', 'retweet', etc
  tokensRewarded: integer("tokens_rewarded").notNull(),
  status: text("status").notNull(), // 'completed', 'processing', 'failed'
  transactionHash: text("transaction_hash"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schema validation for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  xHandle: true,
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  name: true,
  symbol: true,
  totalSupply: true,
  metalTokenId: true,
  contractAddress: true,
});

export const insertAirdropSchema = createInsertSchema(airdrops).pick({
  name: true,
  tokenId: true,
  triggerType: true,
  contractAddress: true,
  xAccount: true,
  interactionType: true,
  xInteractionConfig: true,
  tokenAmount: true,
  startDate: true,
  endDate: true,
  maxTokens: true,
  active: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  airdropId: true,
  eventType: true,
  eventSubtype: true,
  tokensRewarded: true,
  status: true,
  transactionHash: true,
});

// Types for database interactions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type InsertAirdrop = z.infer<typeof insertAirdropSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type User = typeof users.$inferSelect;
export type Token = typeof tokens.$inferSelect;
export type Airdrop = typeof airdrops.$inferSelect;
export type Activity = typeof activities.$inferSelect;

// Extended types for API responses
export type ActivityWithUserInfo = Activity & {
  user: {
    username: string;
    walletAddress: string;
  };
};

export type AirdropWithTokenInfo = Airdrop & {
  token: {
    name: string;
    symbol: string;
  };
};

export type DashboardStats = {
  totalTokensDistributed: number;
  totalUsersReached: number;
  contractInteractions: number;
  xAccountInteractions: number;
  recentActivity: ActivityWithUserInfo[];
};
