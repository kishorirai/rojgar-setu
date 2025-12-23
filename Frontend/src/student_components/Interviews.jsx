import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Building,
  User,
  AlertCircle,
  Menu
} from 'lucide-react';
import Sidebar from './Sidebar';
import { SidebarContext } from './Sidebar';
import Loader from '../components/Loader';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Interviews = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [selectedView, setSelectedView] = useState('upcoming');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // const token = localStorage.getItem('token');
    async function fetchInterviews() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/studentInterviews/my`, {
          method: 'GET',
          credentials: 'include',
          // headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setInterviews(
            data.interviews.map(interview => ({
              ...interview,
              jobTitle: interview.job?.title || interview.jobTitle,
              company: interview.job?.company || interview.company,
              interviewer: interview.interviewerName || interview.interviewer,
              interviewerTitle: interview.interviewerTitle,
              date: interview.date,
              time: interview.time,
              duration: interview.duration,
              type: interview.type,
              platform: interview.platform,
              location: interview.location,
              round: interview.round,
              status: interview.status,
              notes: interview.notes,
              preparation: interview.preparation || [],
              preparationProgress: interview.preparationProgress || Array((interview.preparation || []).length).fill(false),
              // Compute upcoming/today based on date and status
              isToday: (() => {
                const today = new Date();
                const interviewDate = new Date(interview.date);
                return (
                  interviewDate.getFullYear() === today.getFullYear() &&
                  interviewDate.getMonth() === today.getMonth() &&
                  interviewDate.getDate() === today.getDate()
                );
              })(),
              isUpcoming: (() => {
                const today = new Date();
                const interviewDate = new Date(interview.date);
                return (
                  interviewDate > today ||
                  (
                    interviewDate.getFullYear() === today.getFullYear() &&
                    interviewDate.getMonth() === today.getMonth() &&
                    interviewDate.getDate() === today.getDate()
                  )
                ) && interview.status === 'scheduled';
              })()
            }))
          );
        } else {
          setInterviews([]);
        }
      } catch {
        setError("Failed to fetch interviews");
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const handlePreparationToggle = async (interviewId, index) => {
    const interview = interviews.find(i => (i._id || i.id) === interviewId);
    if (!interview) return;
    const newProgress = [...(interview.preparationProgress || Array(interview.preparation.length).fill(false))];
    newProgress[index] = !newProgress[index];

    // Optimistically update UI
    setInterviews(prev =>
      prev.map(i =>
        (i._id || i.id) === interviewId
          ? { ...i, preparationProgress: newProgress }
          : i
      )
    );

    // PATCH to backend
    const token = localStorage.getItem('token');
    try {
      await fetch(`${apiUrl}/api/studentInterviews/${interviewId}/preparation-progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ preparationProgress: newProgress })
      });
      // Optionally handle errors and revert if PATCH fails
    } catch {
      // On failure, revert UI change or show an error
      setError("Failed to update preparation progress");
      setInterviews(prev =>
        prev.map(i =>
          (i._id || i.id) === interviewId
            ? { ...i, preparationProgress: interview.preparationProgress }
            : i
        )
      );
    }
  };

  const upcomingInterviews = interviews.filter(interview => interview.isUpcoming);
  const completedInterviews = interviews.filter(interview => !interview.isUpcoming);
  const todayInterviews = interviews.filter(interview => interview.isToday);

  const displayedInterviews =
    selectedView === 'upcoming' ? upcomingInterviews : completedInterviews;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'phone':
        return <Phone size={16} />;
      case 'in-person':
        return <MapPin size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'phone':
        return 'bg-green-100 text-green-800';
      case 'in-person':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Mobile Header */}
          <div className="lg:hidden p-4 bg-white shadow flex items-center">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold">Rojgar Setu</span>
          </div>
          <div className="bg-gray-50 min-h-full flex-1">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Calendar className="text-gray-600" size={20} />
                  <h1 className="text-lg font-medium text-gray-900">Interview Schedule</h1>
                </div>
                <div className="text-sm text-gray-600">
                  {upcomingInterviews.length} Upcoming Interviews
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Loading/Error */}
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <Loader message="Loading interviews..." />
                </div>
              )}
              {error && (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">{error}</div>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* Today's Interviews Alert */}
                  {todayInterviews.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="text-yellow-600" size={20} />
                        <h3 className="text-lg font-medium text-yellow-800">
                          You have {todayInterviews.length} interview
                          {todayInterviews.length > 1 ? 's' : ''} today!
                        </h3>
                      </div>
                      <div className="mt-2 space-y-2">
                        {todayInterviews.map(interview => (
                          <div key={interview._id || interview.id} className="text-yellow-700">
                            <span className="font-medium">{interview.jobTitle}</span> at {interview.company} - {interview.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Toggle */}
                  <div className="bg-white rounded-lg border border-gray-200 p-1 mb-6 inline-flex">
                    <button
                      onClick={() => setSelectedView('upcoming')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        selectedView === 'upcoming'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Upcoming ({upcomingInterviews.length})
                    </button>
                    <button
                      onClick={() => setSelectedView('completed')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        selectedView === 'completed'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Completed ({completedInterviews.length})
                    </button>
                  </div>

                  {/* Interviews List */}
                  <div className="space-y-6">
                    {displayedInterviews.map((interview) => (
                      <div
                        key={interview._id || interview.id}
                        className={`bg-white rounded-lg border p-6 ${
                          interview.isToday ? 'border-yellow-300 shadow-md' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {interview.jobTitle}
                              </h3>
                              {interview.isToday && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Today
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Building size={16} />
                                <span>{interview.company}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User size={16} />
                                <span>
                                  {interview.interviewer}
                                  {interview.interviewerTitle
                                    ? ` - ${interview.interviewerTitle}`
                                    : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar size={16} />
                                <span>{new Date(interview.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={16} />
                                <span>
                                  {interview.time} ({interview.duration})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 mb-4">
                              <span
                                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                  interview.type
                                )}`}
                              >
                                {getTypeIcon(interview.type)}
                                <span>{interview.platform}</span>
                              </span>
                              <span className="text-sm text-gray-600">{interview.round}</span>
                            </div>
                          </div>

                          {interview.isUpcoming && (
                            <div className="flex space-x-2">
                              {interview.type === 'video' && interview.location && (
                                <a
                                  href={interview.location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Join Interview
                                </a>
                              )}
                              {(interview.type === 'in-person' || interview.type === 'phone') && (
                                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                                  {interview.type === 'in-person'
                                    ? 'On-site'
                                    : 'Phone Call'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {interview.location && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-2">
                              <MapPin size={16} className="text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">
                                Location/Link:
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 break-all">
                              {interview.location}
                            </p>
                          </div>
                        )}

                        {interview.notes && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Notes:</h4>
                            <p className="text-sm text-blue-800">{interview.notes}</p>
                          </div>
                        )}

                        {interview.preparation && interview.preparation.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-green-900 mb-2">
                              Preparation Checklist:
                            </h4>
                            <ul className="space-y-1">
                              {interview.preparation.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-center space-x-2 text-sm text-green-800"
                                >
                                  <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={interview.preparationProgress ? interview.preparationProgress[index] : false}
                                    onChange={() => handlePreparationToggle(interview._id || interview.id, index)}
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {displayedInterviews.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {selectedView} interviews
                      </h3>
                      <p className="text-gray-600">
                        {selectedView === 'upcoming'
                          ? "You don't have any upcoming interviews scheduled."
                          : "You haven't completed any interviews yet."}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Interviews;