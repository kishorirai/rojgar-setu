import React, { useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  FileText,  
  X,
  Sparkles,
  LogOut,
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SidebarContext = React.createContext({ isCollapsed: false });

const Sidebar = ({ 
  isOpen, 
  onClose, 
  user = { initials: '', name: '', role: '' },
  isCollapsed,
  setIsCollapsed,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const onLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('studentId');
    navigate("/");
  };

  const navigationItems = [
    { icon: FileText, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/studentProfile' },
    { icon: Briefcase, label: 'Jobs/Internships', path: '/jobs' },
    { icon: FileText, label: 'Applications', path: '/applications' },
    { icon: Calendar, label: 'Interview Schedule', path: '/interviews' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Sparkles, label: 'AI Portfolio', path: '/portfolio' },
    { icon: Bot, label: 'Support Centre', path: '/chat' },
  ];

  // Fallbacks for user info, omit initials if not present
  const initials = user?.initials
    ? user.initials
    : user?.name
      ? user.name[0]
      : '';

  const name = user?.name || '';
  const role = user?.role || '';

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
    <>
      {/* Backdrop for mobile only */}
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
          ${isOpen ? 'block lg:hidden opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 shadow-lg flex flex-col bg-blue-700 text-white transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:z-auto
        `}
        aria-label="Sidebar"
      >
        {/* Top Section - Header */}
        <div className="flex-shrink-0">
          <div className={`pt-6 pb-4 border-b border-blue-500 flex items-center justify-between ${isCollapsed ? 'px-2' : 'px-8'}`}>
            <div className={`font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden text-ellipsis leading-tight max-w-38 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'}`.trim()}>
              {!isCollapsed && 'Rojgaar Setu'}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed((v) => !v)}
                className="text-blue-200 hover:text-white flex-shrink-0 p-1 rounded transition"
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button
                onClick={onClose}
                className="lg:hidden text-blue-200 hover:text-white ml-2 flex-shrink-0"
                aria-label="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 mb-4 flex-1 pt-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`
                  flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5 px-8'} py-3 text-base mb-0.5 cursor-pointer text-left w-full
                  transition-all duration-200 max-w-55 whitespace-nowrap overflow-hidden text-ellipsis
                  rounded-r-lg
                  ${isActive 
                    ? 'text-white font-bold border-l-4 border-l-white bg-blue-800' 
                    : 'text-blue-200 font-semibold border-l-0 bg-transparent hover:bg-blue-800'
                  }
                `}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-40">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        {/* Logout button */}
        <div className="flex-shrink-0 border-t border-blue-500">
          <button
            onClick={onLogout}
            className={`w-full bg-blue-800 text-white flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5 px-8'} py-3 text-base font-semibold hover:bg-blue-900 transition-all duration-200`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
    </SidebarContext.Provider>
  );
};

export { SidebarContext };
export default Sidebar;