import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  UserCircle, FileText, Star, Bell, TrendingUp, Calendar, MessageSquare, Clock,
  Target, Award, Users, Eye, CheckCircle, AlertCircle, XCircle, PauseCircle,
  Send, ChevronRight, ShieldAlert, LayoutDashboard, Menu, Briefcase, Megaphone, Book
} from "lucide-react";
import { SidebarContext } from './Sidebar';
import safeFetch from '../utils/safeFetch'; // or your fetch helper

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

const ModernCard = ({ children, className = "", gradient = false, hover = true }) => (
  <div className={`
    ${gradient 
      ? 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30' 
      : 'bg-white/80 backdrop-blur-sm'
    }
    border border-white/20 rounded-2xl shadow-lg 
    ${hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
  <ModernCard className="p-6 relative overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          +{trend}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
    <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-${color}-100/20`} />
  </ModernCard>
);

const ApplicationStatusIcon = ({ status }) => {
  const statusConfig = {
    Applied: { icon: Send, color: "blue" },
    "Under Review": { icon: Eye, color: "yellow" },
    Interview: { icon: Users, color: "purple" },
    Offered: { icon: CheckCircle, color: "green" },
    Rejected: { icon: XCircle, color: "red" },
    Withdrawn: { icon: PauseCircle, color: "gray" }
  };
  const config = statusConfig[status] || statusConfig.Applied;
  const Icon = config.icon;
  return <Icon className={`w-4 h-4 text-${config.color}-500`} />;
};

/** Modern notification card layout **/
const NotificationPanel = ({ notifications, onClose, onMarkAsRead, onDelete, onDeleteAll, deletingNotification, deletingAll }) => {
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleDeleteAllClick = () => {
    onDeleteAll();
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onMarkAsRead(notification.id);
  };

  // Utility to strip emoji from title
  const stripEmoji = (text) =>
    text
      ? text.replace(
          /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
          ""
        ).trim()
      : "";

  const getNotificationIcon = (category) => {
    switch (category) {
      case "system":
        return <ShieldAlert className="w-5 h-5 text-blue-500" />;
      case "placement":
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-blue-500" />;
      case "academic":
        return <Book className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type, category) => {
    if (type === 'alert') {
      return 'bg-blue-100 text-blue-800';
    } else if (type === 'system') {
      return 'bg-purple-100 text-purple-800';
    } else if (type === 'reminder') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-14 z-50 w-96 max-w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          Notifications ({notifications.length})
        </span>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllClick}
              disabled={deletingAll}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                deletingAll 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-800 hover:bg-red-50'
              }`}
              title="Delete all notifications"
            >
              {deletingAll ? 'Clearing...' : 'Clear All'}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 p-1 transition"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto p-2 bg-gray-50">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            All caught up!
          </div>
        ) : (
          notifications.map((notification, i) => (
            <div
              key={notification.id || i}
              className={`relative bg-white shadow-sm hover:shadow-md rounded-lg mb-3 border border-gray-100 cursor-pointer transition-all ${
                !notification.read ? "ring-2 ring-blue-100" : ""
              } ${deletingNotification === notification.id ? "opacity-50" : ""}`}
              onClick={() => handleNotificationClick(notification)}
              style={{ padding: "0.75rem 1rem" }}
            >
              {/* Header: icon, title, unread dot, delete */}
              <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{getNotificationIcon(notification.category)}</span>
                <span
                  className={`font-medium text-gray-900 text-base truncate flex-1 ${
                    !notification.read ? "font-semibold" : ""
                  }`}
                  style={{ lineHeight: "1.2" }}
                >
                  {stripEmoji(notification.title) || notification.text}
                </span>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-1" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(e, notification.id);
                  }}
                  disabled={deletingNotification === notification.id}
                  className={`ml-2 p-0.5 rounded transition-colors ${
                    deletingNotification === notification.id
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-red-100"
                  }`}
                  aria-label="Delete notification"
                  style={{ alignSelf: "flex-start" }}
                >
                  {deletingNotification === notification.id ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 hover:text-red-700" />
                  )}
                </button>
              </div>

              {/* Message */}
              {notification.title && (
                <div className="text-sm text-gray-600 mt-1 mb-1 ml-7">
                  {notification.text}
                </div>
              )}

              {/* Footer: date, badge, action, sender */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-7 flex-wrap">
                <span>{notification.date}</span>
                {notification.category && notification.category !== "general" && (
                  <span
                    className={`px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700`}
                  >
                    {notification.category}
                  </span>
                )}
                {notification.actionText && notification.actionUrl && (
                  <button
                    className="ml-2 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition text-xs"
                    style={{ marginLeft: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(notification.actionUrl);
                    }}
                  >
                    {notification.actionText} →
                  </button>
                )}
                {notification.sender && notification.sender !== "System" && (
                  <span className="text-gray-400 ml-2">from {notification.sender}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [opportunities, setOpportunities] = useState({ total: 0, saved: 0 });
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [kycStatus, setKycStatus] = useState("pending");
  const navigate = useNavigate();
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    safeFetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, { credentials: "include" })
      .then((data) => {
        setStudent(data.student || {});
        setProfileCompletion(data.profileCompletion || 0);
        setOpportunities(data.opportunitiesOverview || { total: 0, saved: 0 });
        setApplications(data.applicationsOverview || []);
        setKycStatus(data.kycStatus);
        setNotifications(
          (data.notificationsList || []).map((n) => {
            if (n.text && /internship|job/i.test(n.text)) return { ...n, type: "alert" };
            if (n.text && /system|update/i.test(n.text)) return { ...n, type: "system" };
            if (n.text && /complete|profile|remind/i.test(n.text)) return { ...n, type: "reminder" };
            return n;
          })
        );
        setFeedbacks(data.recentFeedback || []);
        setInterviews(data.interviewSchedule || []);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={student} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        {/* Main content area, margin logic remains unchanged */}
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <svg className="mb-4" width="64" height="64" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#3b82f6" style={{display: 'block'}}>
                <g fill="none" fillRule="evenodd" strokeWidth="4">
                  <circle cx="22" cy="22" r="20" strokeOpacity=".2" />
                  <path d="M42 22c0-11.046-8.954-20-20-20">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 22 22"
                      to="360 22 22"
                      dur="1s"
                      repeatCount="indefinite" />
                  </path>
                </g>
              </svg>
              <p className="text-gray-600 font-medium text-lg">Loading your dashboard...</p>
            </div>
          )}
          {/* Mobile Header */}
          <div className="lg:hidden p-4 bg-white shadow flex items-center">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold">Rojgar Setu</span>
          </div>
          {/* Header ---------------------- */}
          <div className="relative overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700" />
            <div 
              className="absolute inset-0 opacity-20" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative px-6 py-12 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-white">
                      Hey {student?.name || 'there'}! 👋
                    </h1>
                    <p className="text-xl text-blue-100 mb-1">Ready to land your dream job?</p>

                  </div>
                  {/* Notification Bell and Verification Badge/Button */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center relative">
                    <button
                      className="relative flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                      onClick={() => setShowNotifications((n) => !n)}
                      aria-label="Open notifications"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="hidden sm:inline">Notifications</span>
                      {notifications.length > 0 && (
                        <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                    {/* Verification status */}
                    {kycStatus === 'approved' || kycStatus === 'verified' ? (
                      <span className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold border border-green-200">
                        <CheckCircle className="w-5 h-5" />
                        {kycStatus}
                      </span>
                    ) : kycStatus === 'pending' || kycStatus === 'pending approval' ? (
                      <span className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold border border-yellow-200">
                        <ShieldAlert className="w-5 h-5" />
                        {kycStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate('/studentProfile?tab=verification')}
                        className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold border border-yellow-200 hover:bg-yellow-200 transition-colors"
                      >
                        <ShieldAlert className="w-5 h-5" />
                        {kycStatus}
                      </button>
                    )}
                    {showNotifications && (
                      <NotificationPanel
                        notifications={notifications}
                        onClose={() => setShowNotifications(false)}
                        onMarkAsRead={id =>
                          setNotifications(prev =>
                            prev.map(n => n.id === id ? { ...n, read: true } : n)
                          )
                        }
                        onDelete={async id => {
                          try {
                            await safeFetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, {
                              method: 'DELETE',
                              credentials: 'include'
                            });
                            setNotifications(prev => prev.filter(n => n.id !== id));
                          } catch (err) {
                            alert('Failed to delete notification.');
                          }
                        }}
                        onDeleteAll={() => setConfirmClearAll(true)}
                        deletingNotification={null}
                        deletingAll={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="px-6 lg:px-8 -mt-8 relative z-10">
            <div className="mx-auto max-w-7xl space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={Target}
                  title="Profile Strength"
                  value={`${profileCompletion}%`}
                  subtitle="Complete to get more opportunities"
                  color="blue"
                />
                <StatCard
                  icon={Eye}
                  title="Opportunities"
                  value={opportunities.total}
                  subtitle="Total Opportunities for you"
                  color="green"
                />
                <StatCard
                  icon={Award}
                  title="Applications"
                  value={applications.reduce((sum, app) => sum + app.count, 0)}
                  subtitle="Total Applications"
                  color="purple"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Completion & Applications */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Profile Completion */}
                  {profileCompletion < 100 && (
                    <ModernCard className="p-6" gradient>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Complete Your Profile</h3>
                          <p className="text-gray-600">Stand out to employers with a complete profile</p>
                        </div>
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <circle className="text-gray-200" cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                            <circle
                              className="text-blue-500 transition-all duration-700"
                              cx="18" cy="18" r="14" fill="none"
                              stroke="currentColor" strokeWidth="3"
                              strokeDasharray={`${profileCompletion * 0.88}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-bold text-blue-600">
                            {profileCompletion}%
                          </span>
                        </div>
                      </div>
                      <div className="flex">
                        <button
                          onClick={() => navigate('/studentProfile')}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow"
                        >
                          <UserCircle className="w-5 h-5" />
                          Complete Profile
                        </button>
                      </div>
                    </ModernCard>
                  )}

                  {/* Application Status */}
                  <ModernCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Application Pipeline</h3>
                        <p className="text-gray-600">Track your job applications</p>
                      </div>
                      <button
                        onClick={() => navigate('/applications')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View All Applications
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    {applications.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="font-semibold text-gray-600 mb-2">No applications yet</h4>
                        <p className="text-gray-500 mb-4">Start applying to track your progress here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {applications.map((app) => (
                          <div
                            key={app.status}
                            className={`p-4 rounded-xl border-2 ${colorMap[app.color] || colorMap.gray} hover:scale-105 transition-transform cursor-pointer`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <ApplicationStatusIcon status={app.status} />
                              <span className="text-2xl font-bold">{app.count}</span>
                            </div>
                            <p className="text-sm font-medium">{app.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ModernCard>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6 flex flex-col">
                  {/* Upcoming Interviews */}
                  <ModernCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Upcoming Interviews</h3>
                        <p className="text-sm text-gray-600">Don't miss these!</p>
                      </div>
                    </div>
                    {(!interviews || interviews.length === 0) ? (
                      <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No interviews scheduled</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {interviews.slice(0, 3).map((intv) => (
                          <div key={intv.id || intv._id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <p className="font-semibold text-blue-900">{intv.company}</p>
                            <p className="text-sm text-gray-600 mb-2">{intv.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {intv.date} • {intv.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ModernCard>

                  {/* Recent Feedback (in sidebar, below interviews) */}
                  <ModernCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Recent Feedback</h3>
                        <p className="text-gray-600">What employers are saying</p>
                      </div>
                    </div>
                    {feedbacks.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No feedback yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {feedbacks.slice(0, 3).map((fb, i) => (
                          <div key={i} className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{fb.company}</p>
                                <p className="text-sm text-gray-600">{fb.title}</p>
                              </div>
                              <StarRating rating={fb.rating} />
                            </div>
                            <p className="text-sm text-gray-700">{fb.comment || fb.feedback}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ModernCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
            <h2 className="font-bold text-lg mb-2">Clear All Notifications?</h2>
            <p className="mb-4 text-gray-600">Are you sure you want to delete all notifications? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setConfirmClearAll(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  try {
                    const studentId = localStorage.getItem('studentId');
                    await safeFetch(`${import.meta.env.VITE_API_URL}/api/notifications/student/${studentId}/all`, {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    setNotifications([]);
                    setConfirmClearAll(false);
                  } catch (err) {
                    alert('Failed to clear all notifications.');
                    setConfirmClearAll(false);
                  }
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarContext.Provider>
  );
};

export default Dashboard;