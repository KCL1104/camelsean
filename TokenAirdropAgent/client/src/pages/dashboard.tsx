import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DashboardStats } from "@shared/schema";
import StatsOverview from "@/components/dashboard/stats-overview";
import TokenInfo from "@/components/dashboard/token-info";
import TabNavigation from "@/components/dashboard/tab-navigation";
import ActivityTable from "@/components/dashboard/activity-table";
import CreateAirdropModal from "@/components/dashboard/create-airdrop-modal";
import { useAirdropContext } from "@/context/airdrop-context";

import TrackContracts from "../TrackContracts";

export default function Dashboard() {
  const { toast } = useToast();
  const { isCreateAirdropModalOpen, setIsCreateAirdropModalOpen } = useAirdropContext();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching dashboard data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleExport = () => {
    // In a real app, this would generate and download a CSV or JSON file
    toast({
      title: "Export initiated",
      description: "Your data export is being prepared",
    });
  };

  return (
    <div className="py-6 space-y-6">
      {/* Page Header */}
      <TrackContracts />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Airdrop Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage token airdrops</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            type="button"
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Export
          </button>
          <button 
            type="button"
            onClick={() => setIsCreateAirdropModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Airdrop
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {/* Stats Overview */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-6 animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <StatsOverview stats={stats} />
          )}

          {/* Token Info */}
          <TokenInfo isLoading={isLoading} />

          {/* Tab Navigation */}
          <TabNavigation />

          {/* Activity Table */}
          <ActivityTable activities={stats?.recentActivity || []} isLoading={isLoading} />
        </div>
      </div>

      {/* Create Airdrop Modal */}
      <CreateAirdropModal 
        isOpen={isCreateAirdropModalOpen} 
        onClose={() => setIsCreateAirdropModalOpen(false)} 
      />
    </div>
  );
}
