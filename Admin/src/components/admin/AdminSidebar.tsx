import {
  Ticket,
  TrendingUp,
  Briefcase,
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Settings,
  School,
  Building2,
  GraduationCap,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AdminView } from "./AdminDashboard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AdminSidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
}

interface AdminData {
  username: string;
  email: string;
  role: string;
  permissions: string[];
  profileImage?: string;
}

// Permission mapping for sidebar items
const permissionMapping = {
  "Dashboard": "Dashboard",
  // "Analytics": "Analytics",
  "User Management": "User Management",
  // "Content Moderation": "Content Moderation",
  "Support Panel": "Support Panel",
  "Employee Management": "Employee Management",
  "Platform Settings": "Platform Settings"
};

const mainMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    view: "overview" as AdminView,
    permission: "Dashboard"
  },
  {
    title: "Payments",
    icon: UserCheck, // Or use a more appropriate icon
    view: "payments" as AdminView,
    permission: "Payments"
  },
  // {
  //   title: "Analytics",
  //   icon: BarChart3,
  //   view: "analytics" as AdminView,
  //   permission: "Analytics"
  // },
];

const managementItems = [
  {
    title: "User Management",
    icon: Users,
    view: "users" as AdminView,
    permission: "User Management"
  },
  // {
  //   title: "Content Moderation",
  //   icon: Shield,
  //   view: "moderation" as AdminView,
  //   permission: "Content Moderation"
  // },
  {
    title: "Support Panel",
    icon: Headphones,
    view: "support" as AdminView,
    permission: "Support Panel"
  },
];

const employeeItems = [
  {
    title: "Employee Management",
    icon: Briefcase,
    view: "employees" as AdminView,
    permission: "Employee Management"
  },
];

const systemItems = [
  {
    title: "Platform Settings",
    icon: Settings,
    view: "settings" as AdminView,
    permission: "Platform Settings"
  },
];

export function AdminSidebar({ currentView, setCurrentView }: AdminSidebarProps) {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [filteredMainItems, setFilteredMainItems] = useState(mainMenuItems);
  const [filteredManagementItems, setFilteredManagementItems] = useState(managementItems);
  const [filteredEmployeeItems, setFilteredEmployeeItems] = useState(employeeItems);
  const [filteredSystemItems, setFilteredSystemItems] = useState(systemItems);

  useEffect(() => {
    // Get admin data from localStorage
    const adminDataString = localStorage.getItem('adminData');
    
    if (adminDataString) {
      try {
        const data = JSON.parse(adminDataString);
        setAdminData(data);
        
        // Filter items based on permissions
        const userPermissions = data.permissions || [];
        
        // Filter main menu items
        const filteredMain = mainMenuItems.filter(item => 
          userPermissions.includes(item.permission)
        );
        setFilteredMainItems(filteredMain);
        
        // Filter management items
        const filteredManagement = managementItems.filter(item => 
          userPermissions.includes(item.permission)
        );
        setFilteredManagementItems(filteredManagement);
        
        // Filter employee items
        const filteredEmployee = employeeItems.filter(item => 
          userPermissions.includes(item.permission)
        );
        setFilteredEmployeeItems(filteredEmployee);
        
        // Filter system items
        const filteredSystem = systemItems.filter(item => 
          userPermissions.includes(item.permission)
        );
        setFilteredSystemItems(filteredSystem);
        
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminData' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setAdminData(data);
        } catch (error) {
          console.error('Error parsing admin data from storage event:', error);
        }
      }
    };

    // Listen for custom admin data update event
    const handleAdminDataUpdate = (e: CustomEvent) => {
      setAdminData(e.detail);
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminDataUpdated', handleAdminDataUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminDataUpdated', handleAdminDataUpdate as EventListener);
    };
  }, []);

  // Filter items based on permissions
  const filterItemsByPermission = (items: any[], permissions: string[]) => {
    return items.filter(item => permissions.includes(item.permission));
  };

  return (
    <Sidebar className="flex h-screen border-gray-100 bg-white shadow-md">
      <div className="hidden md:flex w-64 h-full flex-col bg-campus-blue text-white">
      <SidebarHeader className="p-6">
        <div className="p-4 font-bold text-xl">
                  <Link to="/admin_dashboard" className="flex items-center">
                    ROJGAR SETU
                  </Link>
                </div>
      </SidebarHeader>

      <SidebarContent className="flex-grow">
        {/* Main Menu Items */}
        {filteredMainItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white">Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => setCurrentView(item.view)}
                      isActive={currentView === item.view}
                      className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Management Items */}
        {filteredManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white">Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => setCurrentView(item.view)}
                      isActive={currentView === item.view}
                      className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Employee Items */}
        {filteredEmployeeItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white">Employees</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredEmployeeItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => setCurrentView(item.view)}
                      isActive={currentView === item.view}
                      className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* System Items */}
        {filteredSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white">System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => setCurrentView(item.view)}
                      isActive={currentView === item.view}
                      className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {adminData?.profileImage ? (
              <img 
                src={adminData.profileImage} 
                alt={adminData.username || 'Profile'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <span className="text-white text-sm font-medium" style={{ display: adminData?.profileImage ? 'none' : 'flex' }}>
              {adminData?.username?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {adminData?.username || 'Admin User'}
            </p>
            <p className="text-xs text-gray-200">
              {adminData?.email || 'admin@placementpro.com'}
            </p>
            <p className="text-xs text-gray-300">
              {adminData?.role || 'admin'}
            </p>
          </div>
        </div>
      </SidebarFooter>
      </div>
    </Sidebar>
  );
}