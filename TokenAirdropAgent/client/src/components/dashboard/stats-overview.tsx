import { DashboardStats } from "@shared/schema";
import { ArrowUp, Coins, MessageSquare, Shield, Users } from "lucide-react";

interface StatsOverviewProps {
  stats?: DashboardStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) return null;

  const statCards = [
    {
      title: "Total Tokens Distributed",
      value: stats.totalTokensDistributed.toLocaleString(),
      icon: Coins,
      increase: "12.5%",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      title: "Total Users Reached",
      value: stats.totalUsersReached.toLocaleString(),
      icon: Users,
      increase: "7.2%",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      title: "Contract Interactions",
      value: stats.contractInteractions.toLocaleString(),
      icon: Shield,
      increase: "24.3%",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      title: "X Account Interactions",
      value: stats.xAccountInteractions.toLocaleString(),
      icon: MessageSquare,
      increase: "9.1%",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${card.iconBgColor}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-500">
                    <ArrowUp className="h-5 w-5 self-center" />
                    <span className="sr-only">Increased by</span>
                    {card.increase}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
