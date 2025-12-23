import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  Database,
  Mail,
  Bell,
  Users,
  Lock,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export function PlatformSettings() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // State for settings
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/platform-settings`)
      .then((res) => {
        setSettings(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate required fields
  const validateSettings = () => {
    if (
      !settings?.platformName ||
      !settings?.supportEmail ||
      settings?.maxFileSize === undefined ||
      settings?.sessionTimeout === undefined
      // Add more required fields as needed
    ) {
      return false;
    }
    return true;
  };

  // Save settings
  const handleSave = async () => {
    if (!validateSettings()) {
      toast.error("Please fill all details.");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/admin/platform-settings`, settings);
      toast.success("Details saved successfully!");
    } catch (err) {
      toast.error("Failed to save details.");
    }
    setSaving(false);
  };

  // If loading, show nothing or a loader
  if (loading) return <div>Loading...</div>;

  const systemHealth = [
    { component: "Database", status: "healthy", uptime: "99.9%" },
    { component: "API Server", status: "healthy", uptime: "99.8%" },
    { component: "Email Service", status: "warning", uptime: "98.5%" },
    { component: "File Storage", status: "healthy", uptime: "99.7%" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure and manage platform settings</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleSave}
          disabled={saving}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* System Health Overview */}
        {/* <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>Real-time platform component status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {systemHealth.map((component) => (
                <div key={component.component} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{component.component}</h4>
                    {getStatusBadge(component.status)}
                  </div>
                  <p className="text-sm text-gray-500">Uptime: {component.uptime}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="users">User Settings</TabsTrigger>
              {/* <TabsTrigger value="integrations">Integrations</TabsTrigger> */}
              {/* <TabsTrigger value="maintenance">Maintenance</TabsTrigger> */}
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Platform Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input
                          id="platform-name"
                          value={settings?.platformName || ""}
                          onChange={e => handleChange("platformName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input
                          id="support-email"
                          value={settings?.supportEmail || ""}
                          onChange={e => handleChange("supportEmail", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">Enable maintenance mode for platform updates</p>
                        </div>
                        <Switch
                          checked={!!settings?.maintenanceMode}
                          onCheckedChange={val => handleChange("maintenanceMode", val)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-file-size">Max File Upload Size (MB)</Label>
                        <Input
                          id="max-file-size"
                          type="number"
                          value={settings?.maxFileSize || ""}
                          onChange={e => handleChange("maxFileSize", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          value={settings?.sessionTimeout || ""}
                          onChange={e => handleChange("sessionTimeout", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Public Registration</Label>
                          <p className="text-sm text-gray-500">Allow public user registration</p>
                        </div>
                        <Switch
                          checked={!!settings?.publicRegistration}
                          onCheckedChange={val => handleChange("publicRegistration", val)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Security Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                      </div>
                      <Switch
                        checked={!!settings?.twoFactorAuth}
                        onCheckedChange={val => handleChange("twoFactorAuth", val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Password Complexity</Label>
                        <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                      </div>
                      <Switch
                        checked={!!settings?.passwordComplexity}
                        onCheckedChange={val => handleChange("passwordComplexity", val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rate Limiting</Label>
                        <p className="text-sm text-gray-500">Limit API requests per user</p>
                      </div>
                      <Switch
                        checked={!!settings?.rateLimiting}
                        onCheckedChange={val => handleChange("rateLimiting", val)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input
                        id="max-login-attempts"
                        type="number"
                        value={settings?.maxLoginAttempts || ""}
                        onChange={e => handleChange("maxLoginAttempts", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
                      <Input
                        id="lockout-duration"
                        type="number"
                        value={settings?.lockoutDuration || ""}
                        onChange={e => handleChange("lockoutDuration", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jwt-expiry">JWT Token Expiry (hours)</Label>
                      <Input
                        id="jwt-expiry"
                        type="number"
                        value={settings?.jwtExpiry || ""}
                        onChange={e => handleChange("jwtExpiry", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={!!settings?.emailNotifications}
                      onCheckedChange={val => handleChange("emailNotifications", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Send SMS for critical updates</p>
                    </div>
                    <Switch
                      checked={!!settings?.smsNotifications}
                      onCheckedChange={val => handleChange("smsNotifications", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={!!settings?.pushNotifications}
                      onCheckedChange={val => handleChange("pushNotifications", val)}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {/* Email templates or other notification settings can go here */}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* User Settings Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">User Management Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Students</Label>
                        <p className="text-sm text-gray-500">Automatically approve student registrations</p>
                      </div>
                      <Switch
                        checked={!!settings?.autoApproveStudents}
                        onCheckedChange={val => handleChange("autoApproveStudents", val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Companies</Label>
                        <p className="text-sm text-gray-500">Automatically approve company registrations</p>
                      </div>
                      <Switch
                        checked={!!settings?.autoApproveCompanies}
                        onCheckedChange={val => handleChange("autoApproveCompanies", val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Verification Required</Label>
                        <p className="text-sm text-gray-500">Require profile verification for all users</p>
                      </div>
                      <Switch
                        checked={!!settings?.profileVerificationRequired}
                        onCheckedChange={val => handleChange("profileVerificationRequired", val)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max-resume-size">Max Resume Size (MB)</Label>
                      <Input
                        id="max-resume-size"
                        type="number"
                        value={settings?.maxResumeSize || ""}
                        onChange={e => handleChange("maxResumeSize", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-completion">Required Profile Completion (%)</Label>
                      <Input
                        id="profile-completion"
                        type="number"
                        value={settings?.profileCompletion || ""}
                        onChange={e => handleChange("profileCompletion", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inactivity-period">User Inactivity Period (days)</Label>
                      <Input
                        id="inactivity-period"
                        type="number"
                        value={settings?.inactivityPeriod || ""}
                        onChange={e => handleChange("inactivityPeriod", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}