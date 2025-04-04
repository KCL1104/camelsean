import { useQuery } from "@tanstack/react-query";
import { Token } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenInfoProps {
  isLoading: boolean;
}

export default function TokenInfo({ isLoading }: TokenInfoProps) {
  const { toast } = useToast();

  const { data: tokens } = useQuery<Token[]>({
    queryKey: ["/api/tokens"],
  });

  // Get the first token (this is a simplified approach - in a real app we'd select the token)
  const token = tokens && tokens.length > 0 ? tokens[0] : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "The contract address has been copied to your clipboard",
        });
      },
      (err) => {
        toast({
          title: "Failed to copy",
          description: "Could not copy text: " + err,
          variant: "destructive",
        });
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8 animate-pulse">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="h-7 bg-gray-200 rounded w-1/4"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-1 sm:mt-0 sm:col-span-2"></div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">Metal Token Cloud</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">No tokens found. Create your first token to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900">{token.name}</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Token distribution and management details</p>
        </div>
        <div>
          <Badge variant="success">Active</Badge>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Token Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{token.symbol}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Chain</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Base</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Contract Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
              <span className="font-mono">{token.contractAddress || "Not deployed yet"}</span>
              {token.contractAddress && (
                <button
                  type="button"
                  className="ml-2 text-primary-500 hover:text-primary-600"
                  onClick={() => copyToClipboard(token.contractAddress!)}
                >
                  <Clipboard className="h-5 w-5" />
                </button>
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">X Account</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">@MetalTokenCloud</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">API Status</dt>
            <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
              <Badge variant="success">Connected</Badge>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
