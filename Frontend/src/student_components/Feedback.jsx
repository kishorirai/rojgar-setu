import React, { useState, useEffect, useContext } from 'react';
import {
  Star, Building2, Users, Calendar, Filter, Search, Plus, Eye, MessageSquare, ThumbsUp, Trash2, X, Check, Menu
} from 'lucide-react';
import Sidebar from './Sidebar';
import { SidebarContext } from './Sidebar';
import Loader from '../components/Loader';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${apiUrl}/api/feedback`;

const FeedbackCenter = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [activeTab, setActiveTab] = useState('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [receivedFeedbackList, setReceivedFeedbackList] = useState([]);
  const [givenFeedbackList, setGivenFeedbackList] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    company: '',
    position: '',
    rating: 5,
    feedback: ''
  });
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [editId, setEditId] = useState(null);
  const [editFeedback, setEditFeedback] = useState({
    company: '',
    position: '',
    rating: 5,
    feedback: ''
  });

  // Feedback targets
  const [studentJobs, setStudentJobs] = useState([]);
  const [studentInterviews, setStudentInterviews] = useState([]);
  const [studentInterviewers, setStudentInterviewers] = useState([]);
  const [studentInternships, setStudentInternships] = useState([]);

  // Track selected feedback target
  const [selectedFeedbackTarget, setSelectedFeedbackTarget] = useState(null); // {type, data}
  
  // Track feedback to highlight
  const [highlightedFeedbackId, setHighlightedFeedbackId] = useState(null);

  // Auto-fill form when feedback target is selected
  useEffect(() => {
    if (selectedFeedbackTarget) {
      const { type, data } = selectedFeedbackTarget;
      let company = '';
      let position = '';

      switch (type) {
        case 'job':
          company = data.companyId?.name || data.company || '';
          position = data.title || '';
          break;
        case 'interview':
          company = data.companyId?.name || data.company || '';
          position = data.role || '';
          break;
        case 'internship':
          company = data.companyId?.name || data.company || '';
          position = data.title || '';
          break;
        case 'interviewer':
          company = data.company || '';
          position = data.job || data.name || '';
          break;
        default:
          break;
      }

      setNewFeedback(prev => ({
        ...prev,
        company,
        position
      }));
    }
  }, [selectedFeedbackTarget]);

  // Fetch feedback lists from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/received`, {
        credentials: 'include'
      }).then(res => res.json()),
      fetch(`${API_BASE}/given`, {
        credentials: 'include'
      }).then(res => res.json())
    ])
      .then(([received, given]) => {
        setReceivedFeedbackList(
          (received.feedbacks || []).map(item => ({
            ...item,
            icon: item.type === 'review' ? 
              (item.metadata?.reviewedBy === 'Employee' ? Building2 : 
               item.metadata?.reviewedBy === 'Company' ? Building2 : 
               item.metadata?.reviewedBy === 'College' ? Users : 
               MessageSquare) : 
              (item.type && item.type.toLowerCase().includes('mock') ? Users : Building2),
            date: new Date(item.date).toLocaleDateString('en-GB')
          }))
        );
        setGivenFeedbackList(
          (given.feedbacks || []).map(item => ({
            ...item,
            icon: Building2,
            date: new Date(item.date).toLocaleDateString('en-GB')
          }))
        );
      })
      .finally(() => setLoading(false));

    // Fetch student-specific data
    const fetchStudentData = async () => {
      try {
        // Get student profile to get student ID
        const studentRes = await fetch(`${apiUrl}/api/student/me`, {
          credentials: 'include'
        });
        const studentData = await studentRes.json();
        const studentId = studentData._id || studentData.id;

        if (studentId) {
          console.log('Fetching data for student ID:', studentId);

          // Fetch jobs for this specific student
          const jobsRes = await fetch(`${apiUrl}/api/jobs/student/${studentId}`, {
            credentials: 'include'
          });
          const jobsData = await jobsRes.json();
          console.log('Jobs data received:', jobsData);
          setStudentJobs(jobsData || []);

          // Fetch interviews for this specific student
          const interviewsRes = await fetch(`${apiUrl}/api/interviews/student/${studentId}`, {
            credentials: 'include'
          });
          const interviewsData = await interviewsRes.json();
          console.log('Interviews data received:', interviewsData);
          setStudentInterviews(interviewsData || []);

          // Fetch internships for this specific student
          const internshipsRes = await fetch(`${apiUrl}/api/internships/student/${studentId}`, {
            credentials: 'include'
          });
          const internshipsData = await internshipsRes.json();
          console.log('Internships data received:', internshipsData);
          setStudentInternships(internshipsData || []);

          console.log('Student data fetched:', {
            jobs: jobsData?.length || 0,
            interviews: interviewsData?.length || 0,
            internships: internshipsData?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudentJobs([]);
        setStudentInterviews([]);
        setStudentInternships([]);
      }
    };

    fetchStudentData();
  }, []);

  // Extract unique interviewers from interviews
  useEffect(() => {
    if (studentInterviews.length > 0) {
      console.log('Processing interviews for interviewer extraction:', studentInterviews);
      const uniqueInterviewers = [];
      const seen = new Set();
      
      studentInterviews.forEach(intv => {
        // Handle populated interviewer data
        const interviewerId = intv.interviewer?._id || intv.interviewer;
        const interviewerName = intv.interviewer?.name || intv.interviewer;
        const companyName = intv.companyId?.name || intv.company || '';
        const role = intv.role || intv.jobTitle || intv.title || '';
        
        console.log('Processing interview:', {
          interviewerId,
          interviewerName,
          companyName,
          role,
          fullInterview: intv
        });
        
        if (interviewerId && !seen.has(interviewerId)) {
          uniqueInterviewers.push({
            id: interviewerId,
            name: interviewerName,
            job: role,
            company: companyName,
            interviewId: intv._id || intv.id
          });
          seen.add(interviewerId);
        }
      });
      
      setStudentInterviewers(uniqueInterviewers);
      console.log('Extracted interviewers:', uniqueInterviewers);
    } else {
      setStudentInterviewers([]);
    }
  }, [studentInterviews]);

  const filteredReceived = receivedFeedbackList.filter(item => {
    const matchesSearch = item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || item.rating?.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const filteredGiven = givenFeedbackList.filter(item => {
    const matchesSearch = item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || item.rating?.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const StarRating = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const InteractiveStarRating = ({ rating, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );

  const handleSubmitFeedback = async () => {
    if (!newFeedback.company.trim() || !newFeedback.position.trim() || !newFeedback.feedback.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedFeedbackTarget) {
      alert('Please select a feedback target');
      return;
    }

    try {
      setLoading(true);
      
      const feedbackData = {
        feedbackTargetType: selectedFeedbackTarget.type,
        feedbackTargetId: selectedFeedbackTarget.data._id || selectedFeedbackTarget.data.id,
        company: newFeedback.company,
        position: newFeedback.position,
        rating: newFeedback.rating,
        feedback: newFeedback.feedback
      };

      console.log('Submitting feedback:', feedbackData);

      const res = await fetch(`${API_BASE}/give`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(feedbackData)
      });
      
      const data = await res.json();
      if (data.success) {
        const item = {
          ...data.feedback,
          icon: Building2,
          date: new Date(data.feedback.date).toLocaleDateString('en-GB')
        };
        setGivenFeedbackList(prev => [item, ...prev]);
        setNewFeedback({ company: '', position: '', rating: 5, feedback: '' });
        setSelectedFeedbackTarget(null);
        setActiveTab('given');
        alert('Feedback submitted successfully!');
      } else {
        alert(data.message || "Failed to submit feedback.");
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert("Could not submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  const getSentiment = (rating, sentiment) => {
    // Use sentiment from database if available, otherwise calculate from rating
    if (sentiment) {
      return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    }
    return rating >= 4 ? 'Positive' : rating >= 2 ? 'Constructive' : 'Negative';
  };

  const getSentimentColor = (rating, sentiment) => {
    // Use sentiment from database if available, otherwise calculate from rating
    const finalSentiment = sentiment || (rating >= 4 ? 'positive' : rating >= 2 ? 'constructive' : 'negative');
    
    switch (finalSentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'constructive':
        return 'bg-blue-100 text-blue-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Edit Feedback Handlers ---
  const handleEditClick = (item) => {
    setEditId(item._id);
    setEditFeedback({
      company: item.company,
      position: item.position,
      rating: item.rating,
      feedback: item.feedback
    });
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/given/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFeedback)
      });
      const data = await res.json();
      if (data.success) {
        setGivenFeedbackList(prev =>
          prev.map(item => item._id === editId ? {
            ...item,
            ...data.feedback,
            date: new Date(data.feedback.date).toLocaleDateString('en-GB')
          } : item)
        );
        setEditId(null);
        setEditFeedback({ company: '', position: '', rating: 5, feedback: '' });
        alert('Feedback updated successfully!');
      } else {
        alert(data.message || 'Failed to update feedback.');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Could not update feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditFeedback({ company: '', position: '', rating: 5, feedback: '' });
  };

  // --- Delete Feedback Handler ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/given/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setGivenFeedbackList(prev => prev.filter(item => item._id !== id));
        alert('Feedback deleted.');
      } else {
        alert(data.message || 'Failed to delete feedback.');
      }
    } catch  {
      alert('Could not delete feedback.');
    } finally {
      setLoading(false);
    }
  };

  // Check if feedback already exists for a target
  const hasFeedbackForTarget = (type, targetId) => {
    return givenFeedbackList.some(feedback => 
      feedback.feedbackTarget?.type === type && 
      feedback.feedbackTarget?.targetId === targetId
    );
  };

  // Get feedback for a specific target
  const getFeedbackForTarget = (type, targetId) => {
    return givenFeedbackList.find(feedback => 
      feedback.feedbackTarget?.type === type && 
      feedback.feedbackTarget?.targetId === targetId
    );
  };

  // Function to view feedback and navigate to given feedback tab
  const handleViewFeedback = (type, targetId, itemName) => {
    const feedback = getFeedbackForTarget(type, targetId);
    if (feedback) {
      // Set the feedback to highlight
      setHighlightedFeedbackId(feedback._id);
      
      // Switch to given feedback tab
      setActiveTab('given');
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedFeedbackId(null);
      }, 3000);
      
      // Scroll to the feedback item after a short delay to ensure tab switch
      setTimeout(() => {
        const feedbackElement = document.getElementById(`feedback-${feedback._id}`);
        if (feedbackElement) {
          feedbackElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
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
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <Loader message="Loading feedback..." />
        </div>
          )}
        <div className="min-h-screen bg-gray-50 p-6 flex-1">
            <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Center</h1>
              <p className="text-gray-600">View feedback received and provide your own feedback</p>
            </div>

            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-6 w-fit">
              {[
                { id: 'received', label: 'Received Feedback' },
                { id: 'given', label: 'Given Feedback' },
                { id: 'give', label: 'Give Feedback' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab !== 'give' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by company or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'received' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">Loading...</div>
                ) : filteredReceived.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Received Yet</h3>
                    <p className="text-gray-600 mb-6">Reviews from companies, interviewers, or colleges will appear here.</p>
                  </div>
                ) : (
                  filteredReceived.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.company}</h3>
                            <p className="text-sm text-gray-600">{item.position} • {item.date}</p>
                            {item.reviewerName && item.entityName && (
                              <div className="text-xs text-gray-500 mt-1">
                                Reviewed by: <span className="font-semibold">{item.reviewerName}</span>
                                {' '}from{' '}
                                <span className="font-semibold">{item.entityName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating rating={item.rating} />
                          <span className={getSentimentColor(item.rating, item.sentiment)}>
                            {getSentiment(item.rating, item.sentiment)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Detailed scores for reviews */ console.log(item)}
                      {item.metadata && (item.metadata.technicalScore || item.metadata.communicationScore || item.metadata.problemSolvingScore) && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Scores</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {item.metadata.technicalScore !== undefined && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Technical Skills</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${(item.metadata.technicalScore / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{item.metadata.technicalScore.toFixed(1)}/10</span>
                                </div>
                              </div>
                            )}
                            {item.metadata.communicationScore !== undefined && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Communication</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-pink-500 h-2 rounded-full" 
                                      style={{ width: `${(item.metadata.communicationScore / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{item.metadata.communicationScore.toFixed(1)}/10</span>
                                </div>
                              </div>
                            )}
                            {item.metadata.problemSolvingScore !== undefined && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Problem Solving</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full" 
                                      style={{ width: `${(item.metadata.problemSolvingScore / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{item.metadata.problemSolvingScore.toFixed(1)}/10</span>
                                </div>
                              </div>
                            )}
                            {item.metadata.overallScore !== undefined && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Overall Score</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full" 
                                      style={{ width: `${(item.metadata.overallScore / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{item.metadata.overallScore.toFixed(1)}/10</span>
                                </div>
                              </div>
                            )}                            
                          </div>
                        </div>
                      )}
                      
                      <p className="text-gray-700 leading-relaxed">{item.feedback}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          Mark as Helpful
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'given' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">Loading...</div>
                ) : filteredGiven.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Given Yet</h3>
                    <p className="text-gray-600 mb-6">Start giving feedback to help others improve!</p>
                    <button
                      onClick={() => setActiveTab('give')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Give Your First Feedback
                    </button>
                  </div>
                ) : (
                  filteredGiven.map((item) => (
                    <div 
                      key={item._id} 
                      id={`feedback-${item._id}`}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 ${
                        highlightedFeedbackId === item._id 
                          ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 border-blue-200' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <item.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.company}</h3>
                            <p className="text-sm text-gray-600">{item.position} • {item.date}</p>
                            {highlightedFeedbackId === item._id && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                This is the feedback you were looking for
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating rating={item.rating} />
                          <span className={getSentimentColor(item.rating, item.sentiment)}>
                            {getSentiment(item.rating, item.sentiment)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item.feedback}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Edit Feedback
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Feedback
                        </button>
                      </div>
                      {editId === item._id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                            <button
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                              onClick={handleEditCancel}
                            >
                              <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-semibold mb-4">Edit Feedback</h2>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                                <input
                                  type="text"
                                  value={editFeedback.company}
                                  onChange={e => setEditFeedback({ ...editFeedback, company: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position/Role</label>
                                <input
                                  type="text"
                                  value={editFeedback.position}
                                  onChange={e => setEditFeedback({ ...editFeedback, position: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <InteractiveStarRating
                                  rating={editFeedback.rating}
                                  onChange={rating => setEditFeedback({ ...editFeedback, rating })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                                <textarea
                                  rows="4"
                                  value={editFeedback.feedback}
                                  onChange={e => setEditFeedback({ ...editFeedback, feedback: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                              <button
                                onClick={handleEditSave}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                disabled={loading}
                              >
                                <Check className="w-4 h-4" /> Save
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                                disabled={loading}
                              >
                                <X className="w-4 h-4" /> Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'give' && (
              <div className="space-y-8">
                {/* List all feedback targets */}
                {!selectedFeedbackTarget && (
                  <>
                  {(studentJobs.length === 0 && studentInterviews.length === 0 && studentInterviewers.length === 0 && studentInternships.length === 0) ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-lg shadow-sm">
                      No jobs, interviews, interviewers, or internships to give feedback upon.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Jobs */}
                      {studentJobs.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <h3 className="text-lg font-semibold mb-4 text-blue-700">Jobs</h3>
                          <ul className="space-y-3">
                            {studentJobs.map(job => {
                              const targetId = job._id || job.id;
                              const hasFeedback = hasFeedbackForTarget('job', targetId);
                              const existingFeedback = getFeedbackForTarget('job', targetId);
                              
                              return (
                                <li key={targetId} className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{job.title}</div>
                                    <div className="text-sm text-gray-500">
                                      {job.companyId?.name || job.company} • {job.department} • ₹{job.salary?.toLocaleString() || 'N/A'}
                                    </div>
                                    {hasFeedback && (
                                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Feedback given • Rating: {existingFeedback?.rating}/5
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      className={`px-3 py-1 rounded text-sm ${
                                        hasFeedback 
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      }`} 
                                      onClick={() => !hasFeedback && setSelectedFeedbackTarget({ type: 'job', data: job })}
                                      disabled={hasFeedback}
                                    >
                                      {hasFeedback ? 'Feedback Given' : 'Give Feedback'}
                                    </button>
                                    {hasFeedback && (
                                      <button 
                                        className="px-3 py-1 rounded text-sm bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        onClick={() => handleViewFeedback('job', targetId, job.title)}
                                      >
                                        View Feedback
                                      </button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      {/* Interviews */}
                      {studentInterviews.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <h3 className="text-lg font-semibold mb-4 text-purple-700">Interviews</h3>
                          <ul className="space-y-3">
                            {studentInterviews.map(intv => {
                              const targetId = intv._id || intv.id;
                              const hasFeedback = hasFeedbackForTarget('interview', targetId);
                              const existingFeedback = getFeedbackForTarget('interview', targetId);
                              
                              return (
                                <li key={targetId} className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{intv.role}</div>
                                    <div className="text-sm text-gray-500">
                                      {intv.companyId?.name || intv.company} • {intv.interviewer?.name || 'Interviewer'} • {new Date(intv.date).toLocaleDateString()}
                                    </div>
                                    {hasFeedback && (
                                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Feedback given • Rating: {existingFeedback?.rating}/5
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      className={`px-3 py-1 rounded text-sm ${
                                        hasFeedback 
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                      }`} 
                                      onClick={() => !hasFeedback && setSelectedFeedbackTarget({ type: 'interview', data: intv })}
                                      disabled={hasFeedback}
                                    >
                                      {hasFeedback ? 'Feedback Given' : 'Give Feedback'}
                                    </button>
                                    {hasFeedback && (
                                      <button 
                                        className="px-3 py-1 rounded text-sm bg-purple-50 text-purple-600 hover:bg-purple-100"
                                        onClick={() => handleViewFeedback('interview', targetId, intv.role)}
                                      >
                                        View Feedback
                                      </button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      {/* Interviewers */}
                      {studentInterviewers.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <h3 className="text-lg font-semibold mb-4 text-indigo-700">Interviewers</h3>
                          <ul className="space-y-3">
                            {studentInterviewers.map(interviewer => {
                              const targetId = interviewer.id;
                              const hasFeedback = hasFeedbackForTarget('interviewer', targetId);
                              const existingFeedback = getFeedbackForTarget('interviewer', targetId);
                              
                              return (
                                <li key={targetId} className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{interviewer.name}</div>
                                    <div className="text-sm text-gray-500">{interviewer.company} {interviewer.job ? `• ${interviewer.job}` : ''}</div>
                                    {hasFeedback && (
                                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Feedback given • Rating: {existingFeedback?.rating}/5
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      className={`px-3 py-1 rounded text-sm ${
                                        hasFeedback 
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                      }`} 
                                      onClick={() => !hasFeedback && setSelectedFeedbackTarget({ type: 'interviewer', data: interviewer })}
                                      disabled={hasFeedback}
                                    >
                                      {hasFeedback ? 'Feedback Given' : 'Give Feedback'}
                                    </button>
                                    {hasFeedback && (
                                      <button 
                                        className="px-3 py-1 rounded text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                        onClick={() => handleViewFeedback('interviewer', targetId, interviewer.name)}
                                      >
                                        View Feedback
                                      </button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      {/* Internships */}
                      {studentInternships.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <h3 className="text-lg font-semibold mb-4 text-green-700">Internships</h3>
                          <ul className="space-y-3">
                            {studentInternships.map(intern => {
                              const targetId = intern._id || intern.id;
                              const hasFeedback = hasFeedbackForTarget('internship', targetId);
                              const existingFeedback = getFeedbackForTarget('internship', targetId);
                              
                              return (
                                <li key={targetId} className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{intern.title}</div>
                                    <div className="text-sm text-gray-500">
                                      {intern.companyId?.name || intern.company} • {intern.department} • ₹{intern.stipend?.toLocaleString() || 'N/A'}
                                    </div>
                                    {hasFeedback && (
                                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Feedback given • Rating: {existingFeedback?.rating}/5
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      className={`px-3 py-1 rounded text-sm ${
                                        hasFeedback 
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`} 
                                      onClick={() => !hasFeedback && setSelectedFeedbackTarget({ type: 'internship', data: intern })}
                                      disabled={hasFeedback}
                                    >
                                      {hasFeedback ? 'Feedback Given' : 'Give Feedback'}
                                    </button>
                                    {hasFeedback && (
                                      <button 
                                        className="px-3 py-1 rounded text-sm bg-green-50 text-green-600 hover:bg-green-100"
                                        onClick={() => handleViewFeedback('internship', targetId, intern.title)}
                                      >
                                        View Feedback
                                      </button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  </>
                )}
                {/* Feedback form for selected target */}
                {selectedFeedbackTarget && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <button className="mb-4 text-xs text-gray-500 hover:underline" onClick={() => setSelectedFeedbackTarget(null)}>&larr; Back to list</button>
                    <h3 className="text-lg font-semibold mb-2">Give Feedback for {selectedFeedbackTarget.type.charAt(0).toUpperCase() + selectedFeedbackTarget.type.slice(1)}</h3>
                    <div className="mb-4 text-sm text-gray-700">
                      {selectedFeedbackTarget.type === 'job' && (
                        <>
                          <div><b>Job:</b> {selectedFeedbackTarget.data.title}</div>
                          <div><b>Company:</b> {selectedFeedbackTarget.data.companyId?.name || selectedFeedbackTarget.data.company || ''}</div>
                          <div><b>Department:</b> {selectedFeedbackTarget.data.department || 'N/A'}</div>
                          <div><b>Salary:</b> ₹{selectedFeedbackTarget.data.salary?.toLocaleString() || 'N/A'}</div>
                        </>
                      )}
                      {selectedFeedbackTarget.type === 'interview' && (
                        <>
                          <div><b>Role:</b> {selectedFeedbackTarget.data.role}</div>
                          <div><b>Company:</b> {selectedFeedbackTarget.data.companyId?.name || selectedFeedbackTarget.data.company || ''}</div>
                          <div><b>Interviewer:</b> {selectedFeedbackTarget.data.interviewer?.name || 'N/A'}</div>
                          <div><b>Date:</b> {new Date(selectedFeedbackTarget.data.date).toLocaleDateString()}</div>
                        </>
                      )}
                      {selectedFeedbackTarget.type === 'interviewer' && (
                        <>
                          <div><b>Interviewer:</b> {selectedFeedbackTarget.data.name}</div>
                          <div><b>Company:</b> {selectedFeedbackTarget.data.company}</div>
                          {selectedFeedbackTarget.data.job && <div><b>Role:</b> {selectedFeedbackTarget.data.job}</div>}
                        </>
                      )}
                      {selectedFeedbackTarget.type === 'internship' && (
                        <>
                          <div><b>Internship:</b> {selectedFeedbackTarget.data.title}</div>
                          <div><b>Company:</b> {selectedFeedbackTarget.data.companyId?.name || selectedFeedbackTarget.data.company || ''}</div>
                          <div><b>Department:</b> {selectedFeedbackTarget.data.department || 'N/A'}</div>
                          <div><b>Stipend:</b> ₹{selectedFeedbackTarget.data.stipend?.toLocaleString() || 'N/A'}</div>
                        </>
                      )}
                    </div>
                    {/* Feedback form (reuse existing form fields) */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                            value={newFeedback.company} 
                            onChange={e => setNewFeedback(fb => ({ ...fb, company: e.target.value }))} 
                            placeholder="Company name"
                            readOnly={selectedFeedbackTarget?.data?.companyId?.name || selectedFeedbackTarget?.data?.company}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position/Role</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                            value={newFeedback.position} 
                            onChange={e => setNewFeedback(fb => ({ ...fb, position: e.target.value }))} 
                            placeholder="Position or role (e.g. Software Engineer, HR Manager)" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <InteractiveStarRating rating={newFeedback.rating} onChange={r => setNewFeedback(fb => ({ ...fb, rating: r }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                        <textarea 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                          rows={4} 
                          value={newFeedback.feedback} 
                          onChange={e => setNewFeedback(fb => ({ ...fb, feedback: e.target.value }))} 
                          placeholder="Write your feedback..." 
                        />
                      </div>
                      <button 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" 
                        onClick={handleSubmitFeedback} 
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Received Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">{receivedFeedbackList.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Given Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">{givenFeedbackList.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating Received</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {receivedFeedbackList.length > 0 ? (receivedFeedbackList.reduce((acc, item) => acc + (item.rating || 0), 0) / receivedFeedbackList.length).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating Given</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {givenFeedbackList.length > 0 ? (givenFeedbackList.reduce((acc, item) => acc + (item.rating || 0), 0) / givenFeedbackList.length).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </SidebarContext.Provider>
  );
};

export default FeedbackCenter;