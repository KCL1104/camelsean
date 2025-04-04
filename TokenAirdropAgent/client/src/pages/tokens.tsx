import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Token } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, ExternalLinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

const createTokenSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol cannot exceed 10 characters"),
  totalSupply: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Total supply must be a positive number",
  }).transform(val => Number(val)),
});

type CreateTokenFormValues = z.infer<typeof createTokenSchema>;

export default function Tokens() {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: tokens, isLoading, error } = useQuery<Token[]>({
    queryKey: ["/api/tokens"],
  });

  const form = useForm<CreateTokenFormValues>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      totalSupply: "1000000",
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching tokens",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const onSubmit = async (data: CreateTokenFormValues) => {
    try {
      await apiRequest("POST", "/api/tokens", data);
      
      toast({
        title: "Token created",
        description: `${data.name} (${data.symbol}) has been created successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setIsCreateModalOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error creating token",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const truncateAddress = (address?: string) => {
    if (!address) return "Not deployed";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tokens</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your tokens on the Base network</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Token
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tokens && tokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map(token => (
              <Card key={token.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{token.name}</CardTitle>
                    <span className="text-xl font-bold text-primary-600">{token.symbol}</span>
                  </div>
                  <CardDescription>
                    Created {new Date(token.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Supply:</span>
                      <span className="text-sm text-gray-900">{token.totalSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Contract:</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 font-mono">{truncateAddress(token.contractAddress)}</span>
                        {token.contractAddress && (
                          <a 
                            href={`https://basescan.org/address/${token.contractAddress}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Metal ID:</span>
                      <span className="text-sm text-gray-900">{token.metalTokenId || "Not registered"}</span>
                    </div>
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "View details",
                            description: `Viewing details for token: ${token.symbol}`,
                          });
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
              <p className="text-gray-500 mb-4">No tokens found</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Token
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Token Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Token</DialogTitle>
            <DialogDescription>
              Create a new token that can be distributed through airdrops.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  placeholder="My Token"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs col-start-2 col-span-3">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">
                  Symbol
                </Label>
                <Input 
                  id="symbol" 
                  className="col-span-3" 
                  placeholder="TKN"
                  {...form.register("symbol")}
                />
                {form.formState.errors.symbol && (
                  <p className="text-red-500 text-xs col-start-2 col-span-3">
                    {form.formState.errors.symbol.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalSupply" className="text-right">
                  Total Supply
                </Label>
                <Input 
                  id="totalSupply" 
                  className="col-span-3" 
                  type="number"
                  min="1"
                  step="1"
                  {...form.register("totalSupply")}
                />
                {form.formState.errors.totalSupply && (
                  <p className="text-red-500 text-xs col-start-2 col-span-3">
                    {form.formState.errors.totalSupply.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Token"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
