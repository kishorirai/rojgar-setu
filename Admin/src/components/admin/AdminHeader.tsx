import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Ticket,
  TrendingUp,
  Shield,
  Briefcase,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ProfileEditModal from "./ProfileEditModal";
import axios from "axios";
import moment from "moment";

interface AdminData {
  _id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  profileImage?: string;
  phone?: string;
}

export function AdminHeader({ setCurrentView }: { setCurrentView?: (view: string) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Get admin data from localStorage
    const adminDataString = localStorage.getItem('adminData');
    if (adminDataString) {
      try {
        const data = JSON.parse(adminDataString);
        setAdminData(data);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    // Fetch recent activity for notifications
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/recent-activity`)
      .then(res => {
        const { students, colleges, companies, supportTickets } = res.data;
        // Merge and sort by createdAt descending
        const merged = [
          ...students.map((s: any) => ({
            id: s._id,
            message: `New student registered: ${s.name}`,
            time: moment(s.createdAt).fromNow(),
            unread: true,
            type: "Student"
          })),
          ...colleges.map((c: any) => ({
            id: c._id,
            message: `New college added: ${c.name}`,
            time: moment(c.createdAt).fromNow(),
            unread: true,
            type: "College"
          })),
          ...companies.map((c: any) => ({
            id: c._id,
            message: `New company added: ${c.name}`,
            time: moment(c.createdAt).fromNow(),
            unread: true,
            type: "Company"
          })),
          ...supportTickets.map((t: any) => ({
            id: t._id,
            message: `New support ticket: ${t.subject}`,
            time: moment(t.createdAt).fromNow(),
            unread: true,
            type: "Support Ticket"
          }))
        ].sort((a, b) => (moment(b.time).valueOf() - moment(a.time).valueOf()));
        setNotifications(merged);
      })
      .catch(() => setNotifications([]));
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.success("Logged out successfully");
    navigate("/"); // Redirect to main page
  };

  const handleProfileUpdate = (updatedData: AdminData) => {
    setAdminData(updatedData);
    // Force re-render of sidebar by updating localStorage
    localStorage.setItem('adminData', JSON.stringify(updatedData));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('adminDataUpdated', {
      detail: updatedData
    }));
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

  const handleSettingsClick = () => {
    if (setCurrentView) {
      setCurrentView("settings");
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users, content, or reports..."
                className="pl-10 pr-4 py-2 w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5 text-gray-500" />
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
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm ${notification.unread ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </span>
                      {notification.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
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
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {adminData?.username || 'Admin User'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      {adminData && (
        <ProfileEditModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          adminData={adminData}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}