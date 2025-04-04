import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, SendIcon, WalletIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // API Key Settings
  const [metalApiKey, setMetalApiKey] = useState(process.env.METAL_API_KEY || "");
  const [openRouterApiKey, setOpenRouterApiKey] = useState(process.env.OPENROUTER_API_KEY || "");
  const [twitterApiKey, setTwitterApiKey] = useState(process.env.TWITTER_API_KEY || "");
  const [baseRpcUrl, setBaseRpcUrl] = useState(process.env.BASE_RPC_URL || "https://mainnet.base.org");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [airdropAlerts, setAirdropAlerts] = useState(true);
  const [contractAlerts, setContractAlerts] = useState(true);
  const [xAccountAlerts, setXAccountAlerts] = useState(true);

  const saveApiKeys = () => {
    // In a real app, this would update environment variables or a secure configuration
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been securely updated",
    });
  };

  const saveNotificationSettings = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated",
    });
  };

  const testAiConnection = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to test the AI",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await apiRequest("POST", "/api/ai/assist", { prompt: aiPrompt });
      const data = await response.json();
      setAiResponse(data.response);
      toast({
        title: "AI Response Received",
        description: "OpenRouter AI responded successfully",
      });
    } catch (error) {
      toast({
        title: "AI Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to OpenRouter AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure your airdrop system settings</p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="ai-testing">AI Testing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>API Configurations</CardTitle>
                <CardDescription>
                  Manage your API keys for various services. These keys are used to connect to external services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metal-api-key">Metal API Key</Label>
                  <Input
                    id="metal-api-key"
                    type="password"
                    placeholder="Enter your Metal API key"
                    value={metalApiKey}
                    onChange={(e) => setMetalApiKey(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                  <Input
                    id="openrouter-api-key"
                    type="password"
                    placeholder="Enter your OpenRouter API key"
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter-api-key">Twitter (X) API Key</Label>
                  <Input
                    id="twitter-api-key"
                    type="password"
                    placeholder="Enter your Twitter API key"
                    value={twitterApiKey}
                    onChange={(e) => setTwitterApiKey(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="base-rpc-url">Base Network RPC URL</Label>
                  <Input
                    id="base-rpc-url"
                    placeholder="Enter Base network RPC URL"
                    value={baseRpcUrl}
                    onChange={(e) => setBaseRpcUrl(e.target.value)}
                  />
                </div>
                
                <Button onClick={saveApiKeys}>
                  <WalletIcon className="w-4 h-4 mr-2" />
                  Save API Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-testing">
            <Card>
              <CardHeader>
                <CardTitle>Test AI Integration</CardTitle>
                <CardDescription>
                  Test your OpenRouter AI integration by sending a prompt and receiving a response.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">AI Prompt</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="Enter a prompt to test the AI"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button onClick={testAiConnection} disabled={isLoading}>
                  <Brain className="w-4 h-4 mr-2" />
                  {isLoading ? "Testing..." : "Test AI Connection"}
                </Button>
                
                {aiResponse && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">AI Response:</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications about airdrop activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive important updates via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="airdrop-alerts">Airdrop Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when tokens are distributed</p>
                  </div>
                  <Switch
                    id="airdrop-alerts"
                    checked={airdropAlerts}
                    onCheckedChange={setAirdropAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contract-alerts">Contract Interaction Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when users interact with your contract</p>
                  </div>
                  <Switch
                    id="contract-alerts"
                    checked={contractAlerts}
                    onCheckedChange={setContractAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="x-account-alerts">X Account Interaction Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when users interact with your X account</p>
                  </div>
                  <Switch
                    id="x-account-alerts"
                    checked={xAccountAlerts}
                    onCheckedChange={setXAccountAlerts}
                  />
                </div>
                
                <Button onClick={saveNotificationSettings}>
                  <SendIcon className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
