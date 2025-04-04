import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Token } from "@shared/schema";

interface CreateAirdropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Schema for form validation
const createAirdropSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  tokenId: z.string().min(1, "Token selection is required"),
  triggerType: z.enum(["contract", "x_account", "both"]),
  contractAddress: z.string().optional(),
  xAccount: z.string().optional(),
  interactionType: z.string().optional(),
  tokenAmount: z.string().min(1, "Token amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Token amount must be a positive number",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  maxTokens: z.string().optional().refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Maximum tokens must be a positive number if provided",
  }),
  // X interaction config
  likeEnabled: z.boolean().optional(),
  retweetEnabled: z.boolean().optional(),
  commentEnabled: z.boolean().optional(),
  followEnabled: z.boolean().optional(),
}).refine(data => {
  if (data.triggerType === "contract" || data.triggerType === "both") {
    return !!data.contractAddress;
  }
  return true;
}, {
  message: "Contract address is required for contract interactions",
  path: ["contractAddress"],
}).refine(data => {
  if (data.triggerType === "x_account" || data.triggerType === "both") {
    return !!data.xAccount;
  }
  return true;
}, {
  message: "X account is required for X account interactions",
  path: ["xAccount"],
});

type CreateAirdropFormValues = z.infer<typeof createAirdropSchema>;

export default function CreateAirdropModal({ isOpen, onClose }: CreateAirdropModalProps) {
  const { toast } = useToast();
  const [showXSettings, setShowXSettings] = useState(false);
  const [showContractSettings, setShowContractSettings] = useState(true);
  
  // Get tokens for the dropdown
  const { data: tokens } = useQuery<Token[]>({
    queryKey: ["/api/tokens"],
  });
  
  const form = useForm<CreateAirdropFormValues>({
    resolver: zodResolver(createAirdropSchema),
    defaultValues: {
      name: "",
      tokenId: "",
      triggerType: "contract",
      contractAddress: "",
      xAccount: "",
      interactionType: "any",
      tokenAmount: "10",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      maxTokens: "",
      likeEnabled: true,
      retweetEnabled: true,
      commentEnabled: true,
      followEnabled: false,
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: CreateAirdropFormValues) => {
    try {
      // Prepare the data for API
      const formattedData = {
        name: data.name,
        tokenId: parseInt(data.tokenId),
        triggerType: data.triggerType,
        contractAddress: data.contractAddress || null,
        xAccount: data.xAccount || null,
        interactionType: data.interactionType || null,
        xInteractionConfig: (data.triggerType === "x_account" || data.triggerType === "both") ? {
          like: !!data.likeEnabled,
          retweet: !!data.retweetEnabled,
          comment: !!data.commentEnabled,
          follow: !!data.followEnabled,
        } : null,
        tokenAmount: parseInt(data.tokenAmount),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxTokens: data.maxTokens ? parseInt(data.maxTokens) : null,
        active: true,
      };
      
      await apiRequest("POST", "/api/airdrops", formattedData);
      
      toast({
        title: "Airdrop Created",
        description: `"${data.name}" airdrop was created successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error creating airdrop",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Update visibility of settings based on trigger type
  useEffect(() => {
    const triggerType = form.watch("triggerType");
    
    if (triggerType === "contract") {
      setShowContractSettings(true);
      setShowXSettings(false);
    } else if (triggerType === "x_account") {
      setShowContractSettings(false);
      setShowXSettings(true);
    } else if (triggerType === "both") {
      setShowContractSettings(true);
      setShowXSettings(true);
    }
  }, [form.watch("triggerType")]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Create New Airdrop</DialogTitle>
          <DialogDescription className="text-center">
            Configure your airdrop settings to automatically distribute tokens when users interact with your contract or X account.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Airdrop Name</Label>
              <Input 
                id="name" 
                placeholder="Spring Campaign"
                {...form.register("name")} 
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="token">Select Token</Label>
              <Select
                defaultValue={form.getValues("tokenId")}
                onValueChange={(value) => form.setValue("tokenId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens?.map(token => (
                    <SelectItem key={token.id} value={token.id.toString()}>
                      {token.name} ({token.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.tokenId && (
                <p className="text-red-500 text-xs">{form.formState.errors.tokenId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trigger-type">Trigger Type</Label>
              <Select
                defaultValue={form.getValues("triggerType")}
                onValueChange={(value) => form.setValue("triggerType", value as "contract" | "x_account" | "both")}
              >
                <SelectTrigger id="trigger-type">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract Interaction</SelectItem>
                  <SelectItem value="x_account">X Account Interaction</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Contract Settings */}
            {showContractSettings && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium">Contract Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="contract-address">Contract Address</Label>
                  <Input 
                    id="contract-address" 
                    placeholder="0x..."
                    {...form.register("contractAddress")} 
                  />
                  {form.formState.errors.contractAddress && (
                    <p className="text-red-500 text-xs">{form.formState.errors.contractAddress.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interaction-type">Interaction Type</Label>
                  <Select
                    defaultValue={form.getValues("interactionType")}
                    onValueChange={(value) => form.setValue("interactionType", value)}
                  >
                    <SelectTrigger id="interaction-type">
                      <SelectValue placeholder="Select interaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Interaction</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="trade">Trade</SelectItem>
                      <SelectItem value="stake">Stake</SelectItem>
                      <SelectItem value="custom">Custom Function Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* X Account Settings */}
            {showXSettings && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium">X Account Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="x-account">X Account</Label>
                  <Input 
                    id="x-account" 
                    placeholder="@username"
                    {...form.register("xAccount")} 
                  />
                  {form.formState.errors.xAccount && (
                    <p className="text-red-500 text-xs">{form.formState.errors.xAccount.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Interaction Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="like" 
                        checked={form.watch("likeEnabled")}
                        onCheckedChange={(checked) => form.setValue("likeEnabled", !!checked)}
                      />
                      <Label htmlFor="like" className="cursor-pointer">Like</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="retweet"
                        checked={form.watch("retweetEnabled")}
                        onCheckedChange={(checked) => form.setValue("retweetEnabled", !!checked)}
                      />
                      <Label htmlFor="retweet" className="cursor-pointer">Retweet</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="comment"
                        checked={form.watch("commentEnabled")}
                        onCheckedChange={(checked) => form.setValue("commentEnabled", !!checked)}
                      />
                      <Label htmlFor="comment" className="cursor-pointer">Comment</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="follow"
                        checked={form.watch("followEnabled")}
                        onCheckedChange={(checked) => form.setValue("followEnabled", !!checked)}
                      />
                      <Label htmlFor="follow" className="cursor-pointer">Follow</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="token-amount">Token Amount</Label>
              <div className="relative">
                <Input 
                  id="token-amount" 
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  {...form.register("tokenAmount")} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">MTCL</span>
                </div>
              </div>
              {form.formState.errors.tokenAmount && (
                <p className="text-red-500 text-xs">{form.formState.errors.tokenAmount.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input 
                  id="start-date" 
                  type="date"
                  {...form.register("startDate")} 
                />
                {form.formState.errors.startDate && (
                  <p className="text-red-500 text-xs">{form.formState.errors.startDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input 
                  id="end-date" 
                  type="date"
                  {...form.register("endDate")} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Maximum Tokens (Optional)</Label>
              <div className="relative">
                <Input 
                  id="max-tokens" 
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Unlimited"
                  {...form.register("maxTokens")} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">MTCL</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">Leave blank for unlimited tokens.</p>
              {form.formState.errors.maxTokens && (
                <p className="text-red-500 text-xs">{form.formState.errors.maxTokens.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Airdrop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
