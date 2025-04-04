import { useState } from "react";

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState("recent-activity");
  
  // Tab options
  const tabs = [
    { id: "recent-activity", label: "Recent Activity" },
    { id: "airdrop-rules", label: "Airdrop Rules" },
    { id: "user-eligibility", label: "User Eligibility" }
  ];
  
  return (
    <div className="mb-6">
      {/* Mobile view dropdown */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select a tab</label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          {tabs.map(tab => (
            <option key={tab.id} value={tab.id}>{tab.label}</option>
          ))}
        </select>
      </div>
      
      {/* Desktop view tabs */}
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id 
                    ? "border-primary-500 text-primary-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
