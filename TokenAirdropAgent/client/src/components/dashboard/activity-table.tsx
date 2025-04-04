import { ActivityWithUserInfo } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ActivityTableProps {
  activities: ActivityWithUserInfo[];
  isLoading: boolean;
}

export default function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  if (isLoading) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <div className="min-w-full divide-y divide-gray-200">
                <div className="bg-gray-50 h-10"></div>
                <div className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-gray-50"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate status badge variant based on activity status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // Function to format date from timestamp
  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get initials for avatar
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  // Truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Get event type display text
  const getEventTypeDisplay = (eventType: string, eventSubtype?: string) => {
    const mainType = eventType === 'contract_interaction' 
      ? 'Contract Interaction' 
      : 'X Account Interaction';
      
    return {
      main: mainType,
      sub: eventSubtype || ''
    };
  };
  
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">No activities found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => {
                    const eventType = getEventTypeDisplay(activity.eventType, activity.eventSubtype);
                    
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Avatar>
                                <AvatarFallback>{getInitials(activity.user.username)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{activity.user.username}</div>
                              <div className="text-sm text-gray-500 font-mono truncate">{truncateAddress(activity.user.walletAddress)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-gray-900">{eventType.main}</div>
                          <div className="text-xs text-gray-500">{eventType.sub}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-gray-900">{activity.tokensRewarded} MTCL</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-gray-500">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(activity.status)}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="link" className="text-primary-600 hover:text-primary-900">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage * itemsPerPage >= activities.length}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{1}</span> to <span className="font-medium">{Math.min(activities.length, 5)}</span> of{' '}
              <span className="font-medium">{activities.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {/* First page */}
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === 1 
                    ? "z-10 bg-primary-50 border-primary-500 text-primary-600" 
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              
              {/* More pages would be added here in a real application */}
              
              <Button
                variant="outline"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= activities.length}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
