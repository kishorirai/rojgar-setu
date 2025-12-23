
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Ticket, 
  TrendingUp, 
  Shield,
  Briefcase,
  Search, 
  Bell, 
  User,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { jwtDecode} from "jwt-decode";
interface AppLayoutProps {
  children: React.ReactNode;
}

interface DecodeToken{
  firstName: string;
  lastName: string;
  email: string;
  role: string; 
  iat: number;
  exp: number;
  salesId?: string; // Optional field for sales ID
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  let firstName = "User";
  let lastName = "Name";
  let SalesID = "";
  const token = localStorage.getItem("token");

  if(token){
    try{
      const decode = jwtDecode<DecodeToken>(token);
      firstName = decode.firstName || "User";
      const lastNameOnly = decode.lastName || "Name";
      SalesID = decode.salesId || "";
      lastName = lastNameOnly + " " + SalesID;
    }catch(error){
     console.error("Error decoding token:", error); 
    }
  }

  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New job application received", time: "5 minutes ago", unread: true, type: "application" },
    { id: 2, message: "KYC verification pending", time: "1 hour ago", unread: true, type: "kyc" },
    { id: 3, message: "Listing approved: Software Engineer", time: "2 hours ago", unread: true, type: "approval" },
    { id: 4, message: "Application deadline reminder", time: "1 day ago", unread: false, type: "reminder" },
    { id: 5, message: "Profile update required", time: "2 days ago", unread: false, type: "profile" }
  ]);
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-blue-800" : "";
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully");
    
    // In a real app, this would redirect to login page
    // For now, redirect to support page as requested
    window.location.href = "https://company.rojgarsetu.org/";
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
    toast.success("All notifications marked as read");
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application': return '👤';
      case 'kyc': return '🛡️';
      case 'approval': return '✅';
      case 'reminder': return '⏰';
      case 'profile': return '📝';
      default: return '📢';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white">
        <div className="p-4 font-bold text-xl">
          <Link to="/support" className="flex items-center">
            Campus Connect
          </Link>
        </div>
        
        <div className="mt-6 px-4 text-sm text-gray-300 font-semibold">
          CAMPUS SERVICES
        </div>
        
        <nav className="mt-2">
          <Link 
            to="/support" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/support")}`}
          >
            <Ticket className="h-5 w-5 mr-3" />
            Support
          </Link>
          
          <Link 
            to="/placement-analysis" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/placement-analysis")}`}
          >
            <TrendingUp className="h-5 w-5 mr-3" />
            Placement Analysis
          </Link>

          <Link 
            to="/kyc-dashboard" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/kyc-dashboard")}`}
          >
            <Shield className="h-5 w-5 mr-3" />
            KYC Dashboard
          </Link>

          <Link 
            to="/sales" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/sales")}`}
          >
            <Briefcase className="h-5 w-5 mr-3" />
            Sales & Jobs
          </Link>
          <Link 
            to="/onboard" 
            className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 ${isActive("/onboard")}`}
          >
            <Briefcase className="h-5 w-5 mr-3" />
            Onboard
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 bg-blue-900 border-t border-blue-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white text-blue-900 flex items-center justify-center mr-3">
              <span className="font-semibold">{firstName[0]}{lastName[0]}</span>
            </div>
            <div>
              <div className="text-sm font-semibold">{firstName} {lastName}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
          <div className="w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Enhanced Notification Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 relative bg-white border border-gray-200 shadow-sm">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border border-gray-200 shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <DropdownMenuLabel className="text-gray-900 font-semibold">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-start gap-2">
                          <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <span className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.message}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                          </div>
                        </div>
                        {notification.unread && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 bg-white border border-gray-200 shadow-sm">
                  <User className="h-5 w-5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-[1500] profile-dropdown">
                <DropdownMenuLabel className="text-gray-900">{firstName} {lastName}</DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleProfile}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-600 cursor-pointer hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
