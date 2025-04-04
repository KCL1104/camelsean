import { 
  users, 
  tokens, 
  airdrops, 
  activities, 
  type User, 
  type InsertUser, 
  type Token, 
  type InsertToken, 
  type Airdrop, 
  type InsertAirdrop, 
  type Activity, 
  type InsertActivity,
  type ActivityWithUserInfo,
  type AirdropWithTokenInfo,
  type DashboardStats
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByXHandle(xHandle: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Token operations
  getToken(id: number): Promise<Token | undefined>;
  getTokenBySymbol(symbol: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(id: number, updates: Partial<Token>): Promise<Token | undefined>;
  listTokens(): Promise<Token[]>;
  
  // Airdrop operations
  getAirdrop(id: number): Promise<Airdrop | undefined>;
  getAirdropWithToken(id: number): Promise<AirdropWithTokenInfo | undefined>;
  createAirdrop(airdrop: InsertAirdrop): Promise<Airdrop>;
  updateAirdrop(id: number, updates: Partial<Airdrop>): Promise<Airdrop | undefined>;
  listAirdrops(): Promise<Airdrop[]>;
  listActiveAirdrops(): Promise<AirdropWithTokenInfo[]>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivities(limit?: number): Promise<Activity[]>;
  listActivitiesWithUserInfo(limit?: number): Promise<ActivityWithUserInfo[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<number, Token>;
  private airdrops: Map<number, Airdrop>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private tokenIdCounter: number;
  private airdropIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.airdrops = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.tokenIdCounter = 1;
    this.airdropIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Add some initial data for testing
    this.initializeData();
  }

  private initializeData() {
    // Add a default token
    const token: Token = {
      id: this.tokenIdCounter++,
      name: "Metal Token Cloud",
      symbol: "MTCL",
      totalSupply: 1000000,
      metalTokenId: "mtcl-001",
      contractAddress: "0x7a2D3a8D1c77177187e06dFc439d62887D8C3316",
      createdAt: new Date()
    };
    this.tokens.set(token.id, token);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async getUserByXHandle(xHandle: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.xHandle === xHandle);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Token operations
  async getToken(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async getTokenBySymbol(symbol: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(token => token.symbol === symbol);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.tokenIdCounter++;
    const token: Token = { ...insertToken, id, createdAt: new Date() };
    this.tokens.set(id, token);
    return token;
  }

  async updateToken(id: number, updates: Partial<Token>): Promise<Token | undefined> {
    const token = this.tokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  async listTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  // Airdrop operations
  async getAirdrop(id: number): Promise<Airdrop | undefined> {
    return this.airdrops.get(id);
  }

  async getAirdropWithToken(id: number): Promise<AirdropWithTokenInfo | undefined> {
    const airdrop = this.airdrops.get(id);
    if (!airdrop) return undefined;
    
    const token = this.tokens.get(airdrop.tokenId);
    if (!token) return undefined;
    
    return {
      ...airdrop,
      token: {
        name: token.name,
        symbol: token.symbol
      }
    };
  }

  async createAirdrop(insertAirdrop: InsertAirdrop): Promise<Airdrop> {
    const id = this.airdropIdCounter++;
    const airdrop: Airdrop = { 
      ...insertAirdrop, 
      id, 
      tokensDistributed: 0, 
      createdAt: new Date() 
    };
    this.airdrops.set(id, airdrop);
    return airdrop;
  }

  async updateAirdrop(id: number, updates: Partial<Airdrop>): Promise<Airdrop | undefined> {
    const airdrop = this.airdrops.get(id);
    if (!airdrop) return undefined;
    
    const updatedAirdrop = { ...airdrop, ...updates };
    this.airdrops.set(id, updatedAirdrop);
    return updatedAirdrop;
  }

  async listAirdrops(): Promise<Airdrop[]> {
    return Array.from(this.airdrops.values());
  }

  async listActiveAirdrops(): Promise<AirdropWithTokenInfo[]> {
    const activeAirdrops = Array.from(this.airdrops.values())
      .filter(airdrop => airdrop.active)
      .filter(airdrop => {
        const now = new Date();
        const hasStarted = airdrop.startDate <= now;
        const hasNotEnded = !airdrop.endDate || airdrop.endDate >= now;
        const hasTokensLeft = !airdrop.maxTokens || airdrop.tokensDistributed < airdrop.maxTokens;
        return hasStarted && hasNotEnded && hasTokensLeft;
      });
    
    return Promise.all(activeAirdrops.map(async airdrop => {
      const token = this.tokens.get(airdrop.tokenId);
      if (!token) throw new Error(`Token not found for airdrop: ${airdrop.id}`);
      
      return {
        ...airdrop,
        token: {
          name: token.name,
          symbol: token.symbol
        }
      };
    }));
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { ...insertActivity, id, timestamp: new Date() };
    this.activities.set(id, activity);
    return activity;
  }

  async listActivities(limit: number = 100): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async listActivitiesWithUserInfo(limit: number = 100): Promise<ActivityWithUserInfo[]> {
    const activities = await this.listActivities(limit);
    
    return activities.map(activity => {
      const user = this.users.get(activity.userId);
      return {
        ...activity,
        user: {
          username: user?.username || "Unknown User",
          walletAddress: user?.walletAddress || "Unknown Address"
        }
      };
    });
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const allActivities = Array.from(this.activities.values());
    const totalTokensDistributed = allActivities.reduce((sum, activity) => sum + activity.tokensRewarded, 0);
    const uniqueUserIds = new Set(allActivities.map(activity => activity.userId));
    const contractInteractions = allActivities.filter(activity => activity.eventType === 'contract_interaction').length;
    const xAccountInteractions = allActivities.filter(activity => activity.eventType === 'x_account_interaction').length;
    const recentActivity = await this.listActivitiesWithUserInfo(5);
    
    return {
      totalTokensDistributed,
      totalUsersReached: uniqueUserIds.size,
      contractInteractions,
      xAccountInteractions,
      recentActivity
    };
  }
}

// Export storage instance
export const storage = new MemStorage();
