import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SendIcon } from "lucide-react";
export default function Settings() {
  const { toast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [airdropAlerts, setAirdropAlerts] = useState(true);
  const [contractAlerts, setContractAlerts] = useState(true);
  const [xAccountAlerts, setXAccountAlerts] = useState(true);

  const saveNotificationSettings = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated",
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Notification Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure how and when you receive notifications about airdrop activities.</p>
        </div>

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
      </div>
    </div>
  );
}
