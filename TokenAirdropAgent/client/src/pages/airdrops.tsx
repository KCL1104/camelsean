import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Airdrop } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useAirdropContext } from "@/context/airdrop-context";
import CreateAirdropModal from "@/components/dashboard/create-airdrop-modal";

export default function Airdrops() {
  const { toast } = useToast();
  const { isCreateAirdropModalOpen, setIsCreateAirdropModalOpen } = useAirdropContext();

  const { data: airdrops, isLoading, error } = useQuery<Airdrop[]>({
    queryKey: ["/api/airdrops"],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching airdrops",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Airdrops</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your token airdrop campaigns</p>
          </div>
          <Button onClick={() => setIsCreateAirdropModalOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Airdrop
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
        ) : airdrops && airdrops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airdrops.map(airdrop => (
              <Card key={airdrop.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{airdrop.name}</CardTitle>
                    <Badge variant={airdrop.active ? "success" : "secondary"}>
                      {airdrop.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created {new Date(airdrop.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Trigger Type:</span>
                      <span className="text-sm text-gray-900">{airdrop.triggerType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Token Amount:</span>
                      <span className="text-sm text-gray-900">{airdrop.tokenAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Distributed:</span>
                      <span className="text-sm text-gray-900">{airdrop.tokensDistributed || 0}</span>
                    </div>
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "View details",
                            description: `Viewing details for airdrop: ${airdrop.name}`,
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
              <p className="text-gray-500 mb-4">No airdrops found</p>
              <Button onClick={() => setIsCreateAirdropModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Airdrop
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Airdrop Modal */}
      <CreateAirdropModal 
        isOpen={isCreateAirdropModalOpen} 
        onClose={() => setIsCreateAirdropModalOpen(false)} 
      />
    </div>
  );
}
