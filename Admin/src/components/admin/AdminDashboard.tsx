import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { Analytics } from "@/components/dashboard/Analytics";
import { ContentModeration } from "@/components/dashboard/ContentModeration";
import { SupportPanel } from "@/components/dashboard/SupportPanel";
import { PlatformSettings } from "@/components/dashboard/PlatformSettings";
import { EmployeeManagement } from "@/components/dashboard/EmployeeManagement";
import { Payments } from "@/components/dashboard/payment";

export type AdminView =
  | "overview"
  | "users"
  | "employees"
  | "analytics"
  | "moderation"
  | "support"
  | "settings"
  | "payments";

interface AdminData {
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

// Permission mapping for views
const viewPermissionMapping = {
  "overview": "Dashboard",
  "users": "User Management",
  "employees": "Employee Management",
  "analytics": "Analytics",
  "moderation": "Content Moderation",
  "support": "Support Panel",
  "settings": "Platform Settings",
  "payments": "Payments"
};

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [availableViews, setAvailableViews] = useState<AdminView[]>(["overview"]);

  useEffect(() => {
    // Get admin data from localStorage
    const adminDataString = localStorage.getItem('adminData');
    if (adminDataString) {
      try {
        const data = JSON.parse(adminDataString);
        setAdminData(data);

        // Determine available views based on permissions
        const userPermissions = data.permissions || [];
        const available: AdminView[] = [];

        // Check each view against user permissions
        Object.entries(viewPermissionMapping).forEach(([view, permission]) => {
          if (userPermissions.includes(permission)) {
            available.push(view as AdminView);
          }
        });

        setAvailableViews(available);

        // If current view is not available, set to first available view
        if (!available.includes(currentView) && available.length > 0) {
          setCurrentView(available[0]);
        }

      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, []);

  // Check if user has permission for current view
  const hasPermissionForView = (view: AdminView): boolean => {
    if (!adminData) return false;
    const requiredPermission = viewPermissionMapping[view];
    return adminData.permissions.includes(requiredPermission);
  };

  // Safe set current view - only allow if user has permission
  const safeSetCurrentView = (view: AdminView) => {
    if (hasPermissionForView(view)) {
      setCurrentView(view);
    } else {
      console.warn(`User does not have permission to access ${view}`);
      // Fallback to first available view
      if (availableViews.length > 0) {
        setCurrentView(availableViews[0]);
      }
    }
  };

  const renderContent = () => {
    // Check if user has permission for current view
    if (!hasPermissionForView(currentView)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this section.
            </p>
            <p className="text-sm text-gray-500">
              Required permission: {viewPermissionMapping[currentView]}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your permissions: {adminData?.permissions.join(', ') || 'None'}
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case "overview":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "employees":
        return <EmployeeManagement />;
      case "analytics":
        return <Analytics />;
      case "moderation":
        return <ContentModeration />;
      case "support":
        return <SupportPanel />;
      case "settings":
        return <PlatformSettings />;
      case "payments":
        return <Payments />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AdminSidebar currentView={currentView} setCurrentView={safeSetCurrentView} />
        <div className="flex-1 flex flex-col">
          <AdminHeader setCurrentView={safeSetCurrentView} />
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;