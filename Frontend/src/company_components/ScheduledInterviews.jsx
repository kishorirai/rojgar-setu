// Zoom API configuration (support both Vite and CRA)
const ZOOM_API_KEY = import.meta.env ? import.meta.env.VITE_REACT_APP_ZOOM_API_KEY : process.env.REACT_APP_ZOOM_API_KEY;
const ZOOM_API_SECRET = import.meta.env ? import.meta.env.VITE_REACT_APP_ZOOM_API_SECRET : process.env.REACT_APP_ZOOM_API_SECRET;
const ZOOM_USER_ID = import.meta.env ? import.meta.env.VITE_REACT_APP_ZOOM_USER_ID : process.env.REACT_APP_ZOOM_USER_ID;

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import SearchBar from '../SearchBar';
import Sidebar from '../Sidebar';
import { FaChevronRight, FaCalendarAlt, FaClock, FaVideo, FaTimes, FaSpinner, FaTicketAlt, FaChartLine, FaUserGraduate, FaCheck, FaTrash, FaEye, FaCopy, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true;
import './ScheduledInterviews.css';
import '../index.css'; // Ensure global styles are applied
import calculateCampusScore from '../utils/calculateCampusScore';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import CompanySettingsModal from './CompanySettingsModal';
import { CSSTransition } from 'react-transition-group';
import { formatDistanceToNow } from 'date-fns';

const ScheduledInterviews = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortByMarks, setSortByMarks] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    avgScore: ''
  });
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    zoomLink: '',
    duration: '30',
    notes: ''
  });
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState(null);
  const itemsPerPage = showAll ? 10 : 3;
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedbackFormPosition, setFeedbackFormPosition] = useState({ top: 0, left: 0 });
  const [feedbackForm, setFeedbackForm] = useState({
    technicalScore: '',
    communicationScore: '',
    problemSolvingScore: '',
    overallScore: '',
    comments: ''
  });
  const [studentScores, setStudentScores] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [hoveredInterview, setHoveredInterview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [interviewToMarkDone, setInterviewToMarkDone] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [interviewToCancel, setInterviewToCancel] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailTitle, setEmailTitle] = useState('Interview Cancellation Notice');
  const [emailBody, setEmailBody] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [interviewToAccept, setInterviewToAccept] = useState(null);
  const [interviewToReject, setInterviewToReject] = useState(null);
  const [acceptEmailTitle, setAcceptEmailTitle] = useState('Congratulations - Interview Selection');
  const [acceptEmailBody, setAcceptEmailBody] = useState('');
  const [rejectEmailTitle, setRejectEmailTitle] = useState('Interview Result Update');
  const [rejectEmailBody, setRejectEmailBody] = useState('');
  const [validationError, setValidationError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    searchQuery: '',
    searchBy: 'candidate' // 'candidate', 'interviewer', 'position', 'status'
  });
  const [showLink, setShowLink] = useState({});
  const [copiedLink, setCopiedLink] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { companyId } = useParams();

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'developer', name: 'Developer' },
    { id: 'designer', name: 'Designer' },
    { id: 'manager', name: 'Manager' }
  ];

  const statusOptions = [
    'Scheduled',
    'Completed',
    'Cancelled',
    'Rescheduled'
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredInterviews = useMemo(() => {
    return scheduledInterviews.filter(interview => {
      // Status filter
      if (filters.status !== 'all' && interview.status !== filters.status) {
        return false;
      }

      // Date filter
      const interviewDate = new Date(interview.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.date === 'today' && interviewDate.toDateString() !== today.toDateString()) {
        return false;
      }
      if (filters.date === 'upcoming' && interviewDate < today) {
        return false;
      }
      if (filters.date === 'past' && interviewDate >= today) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        switch (filters.searchBy) {
          case 'candidate':
            return interview.studentDetails?.name?.toLowerCase().includes(query);
          case 'interviewer':
            return interview.interviewer?.name?.toLowerCase().includes(query);
          case 'position':
            return interview.jobId?.title?.toLowerCase().includes(query);
          case 'status':
            return interview.status?.toLowerCase().includes(query);
          default:
            return true;
        }
      }

      return true;
    });
  }, [scheduledInterviews, filters]);

  // Fetch interviews and student data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) {
          setError('Company ID not found');
          return;
        }

        // Use the new optimized endpoint
        const response = await axios.get(`${apiUrl}/api/company/${companyId}/interviews/complete`);
        setCompany(response.data.company);
        setScheduledInterviews(response.data.interviews);

        // Create student scores map from the student details
        const studentScoresMap = {};
        response.data.interviews.forEach(interview => {
          if (interview.studentDetails) {
            studentScoresMap[interview.studentDetails._id] = interview.studentDetails.campusScore;
          }
        });
        setStudentScores(studentScoresMap);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewAll = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  const handleEdit = (interview) => {
    setEditingId(interview.id);
    setEditForm({
      status: interview.status,
      avgScore: interview.avgScore
    });
  };

  const handleSave = (id) => {
    setScheduledInterviews(interviews =>
      interviews.map(interview =>
        interview.id === id
          ? { ...interview, ...editForm }
          : interview
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleForm(true);
  };

  const createZoomMeeting = async (meetingDetails) => {
    try {
      setIsCreatingMeeting(true);
      setMeetingError(null);

      // Generate JWT token for Zoom API
      const token = generateZoomToken();

      // Create meeting via Zoom API
      const response = await axios.post(
        `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
        {
          topic: `Interview with ${selectedCandidate.candidate} - ${selectedCandidate.position}`,
          type: 2, // Scheduled meeting
          start_time: `${meetingDetails.date}T${meetingDetails.time}:00`,
          duration: parseInt(meetingDetails.duration),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            meeting_authentication: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      setMeetingError('Failed to create Zoom meeting. Please try again.');
      throw error;
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const generateZoomToken = () => {
    // In production, this should be handled by your backend
    // This is a simplified version for demonstration
    const payload = {
      iss: ZOOM_API_KEY,
      exp: Date.now() + 5000
    };
    return btoa(JSON.stringify(payload));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create Zoom meeting (if needed)
      const zoomMeeting = await createZoomMeeting(scheduleForm);
      const newInterview = {
        candidateName: selectedCandidate?.candidateName || '',
        role: selectedCandidate?.role || '',
        status: 'Interview Scheduled',
        interviewDate: scheduleForm.date,
        interviewTime: scheduleForm.time,
        zoomLink: zoomMeeting.join_url,
        zoomMeetingId: zoomMeeting.id,
        zoomPassword: zoomMeeting.password,
        notes: scheduleForm.notes,
      };
      const res = await axios.post(`${apiUrl}/api/interviews`, newInterview);
      setScheduledInterviews(prev => [...prev, res.data]);
      setShowScheduleForm(false);
      setSelectedCandidate(null);
      setScheduleForm({ date: '', time: '', zoomLink: '', duration: '30', notes: '' });
    } catch (error) {
      setMeetingError('Error scheduling interview.');
      console.error('Error in scheduling interview:', error);
    }
  };

  // Update interview (edit)
  const handleEditInterview = async (id, updatedFields) => {
    try {
      const res = await axios.put(`${apiUrl}/api/interviews/${id}`, updatedFields);
      setScheduledInterviews(prev => prev.map(i => i._id === id ? res.data : i));
    } catch (error) {
      console.error('Error updating interview:', error);
    }
  };

  // Delete interview
  const handleDeleteInterview = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/interviews/${id}`);
      setScheduledInterviews(prev => prev.filter(i => i._id !== id));
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time helper function
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle giving feedback
  const handleGiveFeedback = async (interviewId, event) => {
    const interview = scheduledInterviews.find(i => i._id === interviewId);
    setSelectedInterview(interview);
    setSelectedAction(null);
    setFeedbackForm({
      technicalScore: '',
      communicationScore: '',
      problemSolvingScore: '',
      overallScore: '',
      comments: ''
    });

    // Calculate position for the popup
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const popupWidth = 300;
    const popupHeight = 280;
    const spacing = 10;

    let left = buttonRect.left - popupWidth - spacing;
    let top = buttonRect.top - (popupHeight / 2) + (buttonRect.height / 2);

    if (left < 0) {
      left = buttonRect.right + spacing;
    }

    if (top < 0) {
      top = 0;
    } else if (top + popupHeight > window.innerHeight) {
      top = window.innerHeight - popupHeight;
    }

    setFeedbackFormPosition({ top, left });
    setShowFeedbackForm(true);
  };

  // Close feedback form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFeedbackForm && !event.target.closest('.feedback-popup')) {
        setShowFeedbackForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFeedbackForm]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const feedback = {
        technicalScore: parseFloat(feedbackForm.technicalScore),
        communicationScore: parseFloat(feedbackForm.communicationScore),
        problemSolvingScore: parseFloat(feedbackForm.problemSolvingScore),
        overallScore: parseFloat(feedbackForm.overallScore),
        comments: feedbackForm.comments,
        date: new Date()
      };

      // Update interview with feedback and status
      const response = await axios.put(`${apiUrl}/api/interviews/${selectedInterview._id}`, {
        feedback,
        status: selectedAction === 'accept' ? 'accepted' : 
                selectedAction === 'reject' ? 'rejected' : 
                selectedAction === 'complete' ? 'completed' : 'completed',
        isDone: selectedAction === 'complete'
      });

      setScheduledInterviews(prev => 
        prev.map(interview => 
          interview._id === selectedInterview._id ? response.data : interview
        )
      );
      setShowFeedbackForm(false);
      setSelectedInterview(null);
      setSelectedAction(null);
    } catch (error) {
      console.error('Error giving feedback:', error);
      setError('Failed to submit feedback');
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle closing interview
  const handleCloseInterview = async (interviewId) => {
    try {
      const response = await axios.put(`${apiUrl}/api/interviews/${interviewId}`, {
        status: 'cancelled'
      });

      setScheduledInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewId ? response.data : interview
        )
      );
    } catch (error) {
      console.error('Error closing interview:', error);
      setError('Failed to close interview');
    }
  };

  // Navigation items with company ID
  const navItems = [
    { label: 'Dashboard', href: `/company/${localStorage.getItem('companyId')}/dashboard`, icon: <FaChevronRight /> },
    { label: 'Demand Roles', href: `/company/${localStorage.getItem('companyId')}/post-job`, icon: <FaChevronRight /> },
    { label: 'Scheduled Interviews', href: `/company/${localStorage.getItem('companyId')}/scheduled-interviews`, icon: <FaChevronRight /> },
    { label: 'Applications', href: `/company/${localStorage.getItem('companyId')}/applications`, icon: <FaChevronRight /> },
    { label: 'Manage Employees', href: `/company/${localStorage.getItem('companyId')}/employees`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/company/${localStorage.getItem('companyId')}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/company/${localStorage.getItem('companyId')}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: company?.name || 'Company Admin',
    role: 'Company Admin',
    initials: company?.name ? company.name.substring(0, 2).toUpperCase() : 'CA',
    profileImage: localStorage.getItem('profileImage') || company?.profileImage || ''
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await axios.get(`${apiUrl}/api/student/${studentId}`);
      setSelectedStudentProfile(res.data);
      setShowProfileModal(true);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setProfileError('Failed to fetch student profile');
    }
  };

  const handleViewProfile = async (studentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      const data = await response.json();
      setSelectedStudent(data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student profile');
    }
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedStudent(null);
  };

  // Handle marking interview as done
  const handleMarkAsDone = async (interviewId, event) => {
    const interview = scheduledInterviews.find(i => i._id === interviewId);
    setSelectedInterview(interview);
    setSelectedAction('complete');
    setFeedbackForm({
      technicalScore: '',
      communicationScore: '',
      problemSolvingScore: '',
      overallScore: '',
      comments: ''
    });

    // Calculate position for the popup
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const popupWidth = 300;
    const popupHeight = 280;
    const spacing = 10;

    let left = buttonRect.left - popupWidth - spacing;
    let top = buttonRect.top - (popupHeight / 2) + (buttonRect.height / 2);

    if (left < 0) {
      left = buttonRect.right + spacing;
    }

    if (top < 0) {
      top = 0;
    } else if (top + popupHeight > window.innerHeight) {
      top = window.innerHeight - popupHeight;
    }

    setFeedbackFormPosition({ top, left });
    setShowFeedbackForm(true);
  };

  // Handle cancel interview with email
  const handleCancelInterview = async (interviewId) => {
    const interview = scheduledInterviews.find(i => i._id === interviewId);
    setInterviewToCancel(interview);
    // Set default email body with professional message and common reasons
    setEmailBody(`Dear ${interview.candidateName},

We regret to inform you that the interview scheduled for ${formatDate(interview.date)} at ${formatTime(interview.date)} for the position of ${interview.role} has been cancelled.

This decision has been made due to unforeseen circumstances, which may include:
- Changes in the hiring requirements
- Internal restructuring
- Position being put on hold
- Scheduling conflicts

We sincerely apologize for any inconvenience this may cause. We value your interest in joining our team and would like to keep your application on file for future opportunities.

If you have any questions or would like to discuss this further, please don't hesitate to reach out to us.

Best regards,
${company?.name || 'The Hiring Team'}`);
    setShowCancelModal(true);
  };

  const confirmCancelInterview = async () => {
    try {
      setIsSendingEmail(true);
      
      // Send cancellation email
      await axios.post(`${apiUrl}/api/interviews/${interviewToCancel._id}/cancel`, {
        studentEmail: interviewToCancel.studentDetails?.email,
        emailTitle: emailTitle,
        emailBody: emailBody
      });

      // Update interview status
      const response = await axios.put(`${apiUrl}/api/interviews/${interviewToCancel._id}`, {
        status: 'cancelled'
      });

      setScheduledInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewToCancel._id ? { ...interview, status: 'cancelled' } : interview
        )
      );

      setShowCancelModal(false);
      setInterviewToCancel(null);
      setEmailTitle('Interview Cancellation Notice');
      setEmailBody('');
    } catch (error) {
      console.error('Error cancelling interview:', error);
      setError('Failed to cancel interview');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle accepting candidate
  const handleAcceptCandidate = async (interviewId) => {
    const interview = scheduledInterviews.find(i => i._id === interviewId);
    setInterviewToAccept(interview);
    setAcceptEmailBody(`Dear ${interview.candidateName},

We are pleased to inform you that you have been selected for the position of ${interview.role} at ${company?.name || 'our company'}.

Your performance in the interview was outstanding, and we believe you would be a valuable addition to our team. We were particularly impressed with your technical skills, problem-solving abilities, and communication style.

Next Steps:
1. We will send you a formal offer letter within the next 48 hours
2. The offer letter will include details about your compensation, benefits, and start date
3. Please review the offer and respond within the specified timeframe

If you have any questions or need clarification on any aspect of the offer, please don't hesitate to reach out to us.

Congratulations once again! We look forward to welcoming you to our team.

Best regards,
${company?.name || 'The Hiring Team'}`);
    setShowAcceptModal(true);
  };

  // Handle rejecting candidate
  const handleRejectCandidate = async (interviewId) => {
    const interview = scheduledInterviews.find(i => i._id === interviewId);
    setInterviewToReject(interview);
    setRejectEmailBody(`Dear ${interview.candidateName},

Thank you for your interest in the ${interview.role} position at ${company?.name || 'our company'} and for taking the time to interview with us.

After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your time and effort throughout the interview process. Your skills and experience are impressive, and we encourage you to apply for future positions that match your qualifications.

We wish you the best in your job search and future career endeavors.

Best regards,
${company?.name || 'The Hiring Team'}`);
    setShowRejectModal(true);
  };

  const confirmAcceptCandidate = async () => {
    try {
      setIsSendingEmail(true);
      
      // Send acceptance email
      await axios.post(`${apiUrl}/api/interviews/${interviewToAccept._id}/accept`, {
        studentEmail: interviewToAccept.studentDetails?.email,
        emailTitle: acceptEmailTitle,
        emailBody: acceptEmailBody
      });

      // Update interview status
      const response = await axios.put(`${apiUrl}/api/interviews/${interviewToAccept._id}`, {
        status: 'accepted'
      });

      // Update UI
      setScheduledInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewToAccept._id ? { ...interview, status: 'accepted' } : interview
        )
      );

      // Close modal and reset states
      setShowAcceptModal(false);
      setInterviewToAccept(null);
      setAcceptEmailTitle('Congratulations - Interview Selection');
      setAcceptEmailBody('');

      // Show success message
      setError(null);
      setValidationError('Candidate accepted successfully!');
      
      // Keep success message visible for 3 seconds
      setTimeout(() => {
        setValidationError('');
      }, 3000);

    } catch (error) {
      console.error('Error accepting candidate:', error);
      setError('Failed to accept candidate');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const confirmRejectCandidate = async () => {
    try {
      setIsSendingEmail(true);
      
      // Send rejection email
      await axios.post(`${apiUrl}/api/interviews/${interviewToReject._id}/reject`, {
        studentEmail: interviewToReject.studentDetails?.email,
        emailTitle: rejectEmailTitle,
        emailBody: rejectEmailBody
      });

      // Update interview status
      const response = await axios.put(`${apiUrl}/api/interviews/${interviewToReject._id}`, {
        status: 'rejected'
      });

      // Update UI
      setScheduledInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewToReject._id ? { ...interview, status: 'rejected' } : interview
        )
      );

      // Close modal and reset states
      setShowRejectModal(false);
      setInterviewToReject(null);
      setRejectEmailTitle('Interview Result Update');
      setRejectEmailBody('');

      // Show success message
      setError(null);
      setValidationError('Candidate rejected successfully!');
      
      // Keep success message visible for 3 seconds
      setTimeout(() => {
        setValidationError('');
      }, 3000);

    } catch (error) {
      console.error('Error rejecting candidate:', error);
      setError('Failed to reject candidate');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle conducting interview
  const handleConductInterview = async (interviewId) => {
    try {
      // Update interview status to in-progress
      const response = await axios.put(`${apiUrl}/api/interviews/${interviewId}`, {
        status: 'in-progress'
      });

      // Update the interview in the state
      setScheduledInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewId ? { ...interview, status: 'in-progress' } : interview
        )
      );

      // Get the interview details
      const interview = scheduledInterviews.find(i => i._id === interviewId);
      if (!interview) return;

      // Open the interview link in a new tab
      if (interview.link || interview.zoomLink) {
        window.open(interview.link || interview.zoomLink, '_blank');
      } else {
        setError('No interview link available');
      }
    } catch (error) {
      console.error('Error conducting interview:', error);
      setError('Failed to start interview');
    }
  };

  const handleCleanRejected = async () => {
    if (window.confirm('Are you sure you want to delete all rejected interviews? This action cannot be undone.')) {
      try {
        await axios.delete(`${apiUrl}/api/interviews/clean-rejected`);
        setScheduledInterviews(scheduledInterviews.filter(interview => interview.status !== 'rejected'));
        toast.success('Successfully cleaned rejected interviews');
      } catch (error) {
        console.error('Error cleaning rejected interviews:', error);
        toast.error('Failed to clean rejected interviews');
      }
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const toggleLinkVisibility = (interviewId) => {
    setShowLink(prev => ({
      ...prev,
      [interviewId]: !prev[interviewId]
    }));
  };

  const handleViewLink = (link) => {
    setSelectedLink(link);
    setShowLinkModal(true);
  };

  const handleCloseLinkModal = () => {
    setShowLinkModal(false);
    setSelectedLink(null);
  };

  // Helper function to highlight text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.toString().split(regex).map((part, i) => 
      regex.test(part) ? 
        <span key={i} style={{ 
          backgroundColor: '#FEF3C7', 
          padding: '0 2px',
          borderRadius: '2px'
        }}>{part}</span> : 
        part
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
      <div className="main-container" style={{ 
        marginLeft: 260, 
        flex: 1,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 24px' }}>
          <SearchBar onSettingsClick={() => setShowSettings(true)} />
        </div>
        <div style={{ 
          padding: '2rem 24px 2rem 24px',
          width: '100%'
        }}>
          <h2>Scheduled Interviews</h2>

          {/* Filters Section */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ 
                color: '#4B5563',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Search by:
              </label>
              <select
                value={filters.searchBy}
                onChange={(e) => handleFilterChange('searchBy', e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#4B5563',
                  fontSize: '0.875rem'
                }}
              >
                <option value="candidate">Candidate Name</option>
                <option value="interviewer">Interviewer Name</option>
                <option value="position">Position</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder={`Search by ${filters.searchBy}...`}
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#4B5563',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ 
                color: '#4B5563',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Status:
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#4B5563',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ 
                color: '#4B5563',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Date:
              </label>
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#4B5563',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div className="modal-content" style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'slideIn 0.3s ease-out',
                position: 'relative'
              }}>
                <div className="modal-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>Confirm Interview Completion</h3>
                  <button 
                    className="close-button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setInterviewToMarkDone(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      transition: 'color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body" style={{
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <p style={{
                      margin: '0 0 16px 0',
                      color: '#374151',
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>Are you sure you want to mark this interview as completed?</p>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Candidate:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToMarkDone?.candidateName}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Role:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToMarkDone?.role}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Date:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{formatDate(interviewToMarkDone?.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setInterviewToMarkDone(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={confirmMarkAsDone}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#10B981',
                      color: 'white',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
                  >
                    <FaCheck style={{ fontSize: '0.9rem' }} />
                    Confirm Completion
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Interview Form Modal */}
          {showScheduleForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Schedule Zoom Interview</h3>
                  <button 
                    className="close-button"
                    onClick={() => setShowScheduleForm(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleScheduleSubmit} className="schedule-form">
                  <div className="form-group">
                    <label>
                      <FaCalendarAlt /> Interview Date
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaClock /> Interview Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <select
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({...scheduleForm, duration: e.target.value})}
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                      placeholder="Add any specific instructions or requirements..."
                      rows="3"
                    />
                  </div>

                  {meetingError && (
                    <div className="error-message">
                      {meetingError}
                    </div>
                  )}

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={() => setShowScheduleForm(false)}
                      disabled={isCreatingMeeting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isCreatingMeeting}
                    >
                      {isCreatingMeeting ? (
                        <>
                          <FaSpinner className="spinner" /> Creating Meeting...
                        </>
                      ) : (
                        'Schedule Interview'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feedback Form Popup */}
          {showFeedbackForm && (
            <div 
              className="feedback-popup"
              style={{
                position: 'absolute',
                top: `${feedbackFormPosition.top}px`,
                left: `${feedbackFormPosition.left}px`,
                zIndex: 1000
              }}
            >
              <div className="feedback-popup-content">
                <div className="feedback-popup-header">
                  <h3>Feedback for {selectedAction === 'accept' ? 'Accepting' : 
                                  selectedAction === 'reject' ? 'Rejecting' : 
                                  'Completing'} Interview</h3>
                  <button 
                    className="close-button"
                    onClick={() => {
                      setShowFeedbackForm(false);
                      setSelectedInterview(null);
                      setSelectedAction(null);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Technical</label>
                      <input
                        type="number"
                        name="technicalScore"
                        value={feedbackForm.technicalScore}
                        onChange={handleFeedbackChange}
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        placeholder="0-10"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Communication</label>
                      <input
                        type="number"
                        name="communicationScore"
                        value={feedbackForm.communicationScore}
                        onChange={handleFeedbackChange}
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        placeholder="0-10"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Problem Solving</label>
                      <input
                        type="number"
                        name="problemSolvingScore"
                        value={feedbackForm.problemSolvingScore}
                        onChange={handleFeedbackChange}
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        placeholder="0-10"
                      />
                    </div>

                    <div className="form-group">
                      <label>Overall</label>
                      <input
                        type="number"
                        name="overallScore"
                        value={feedbackForm.overallScore}
                        onChange={handleFeedbackChange}
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        placeholder="0-10"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Comments</label>
                    <textarea
                      name="comments"
                      value={feedbackForm.comments}
                      onChange={handleFeedbackChange}
                      placeholder="Add comments..."
                      rows="2"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setSelectedInterview(null);
                        setSelectedAction(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      style={{
                        background: selectedAction === 'accept' ? '#10B981' : 
                                   selectedAction === 'reject' ? '#EF4444' : 
                                   '#3B82F6'
                      }}
                    >
                      {selectedAction === 'accept' ? 'Accept & Submit' : 
                       selectedAction === 'reject' ? 'Reject & Submit' : 
                       'Complete & Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Student Profile Modal */}
          {showProfileModal && selectedStudent && (
            <div className="modal-overlay" onClick={handleCloseProfileModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ 
                maxWidth: '800px', 
                width: '90%',
                maxHeight: '90vh',
              display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '12px'
              }}>
                <div className="modal-header" style={{ 
                  flexShrink: 0,
                  background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                  color: 'white',
                  padding: '16px 24px',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Student Profile</h3>
                  <button 
                    className="close-button"
                    onClick={handleCloseProfileModal}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
              justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FaTimes style={{ color: 'white' }} />
                  </button>
                </div>
                <div style={{ 
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1
                }}>
                  {/* Personal Information Section */}
              <div style={{
                    marginBottom: '24px',
                    background: 'white',
                borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Personal Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Name</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.name}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Roll Number</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.rollNumber}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Email</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.email}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Department</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.department || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Batch</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.batch|| 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Joining Year</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.joiningYear || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>Graduation Year</p>
                        <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.graduationYear || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Performance Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Academic Performance</h4>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.875rem' }}>CGPA</p>
                          <p style={{ margin: 0, fontWeight: '500' }}>{selectedStudent.cgpa || 'N/A'}</p>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                  alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '2rem',
                          fontWeight: '600',
                          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                        }}>
                          {selectedStudent.campusScore || 'N/A'}
                        </div>
                        <p style={{ 
                          margin: 0, 
                          color: '#1e40af',
                          fontWeight: '500',
                          fontSize: '0.875rem'
                        }}>Campus Score</p>
                      </div>
                    </div>
                    {selectedStudent.resume && (
                      <div style={{ marginTop: '16px' }}>
                        <a 
                          href={selectedStudent.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                    style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#2563eb',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaFileAlt />
                          View Resume
                        </a>
                </div>
                    )}
                    </div>

                  {/* Technical Skills Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Technical Skills</h4>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px' 
                    }}>
                      {selectedStudent.skills?.map((skill, index) => (
                            <span
                              key={index}
                              style={{
                            background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
                            color: 'white',
                            padding: '6px 12px',
                                borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                  {/* Projects Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Projects</h4>
                    {selectedStudent.projects?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.projects.map((project, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.projects.length - 1 ? '20px' : 0,
                            paddingBottom: index < selectedStudent.projects.length - 1 ? '20px' : 0,
                            borderBottom: index < selectedStudent.projects.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {project.title}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {project.description}
                            </p>
                            {project.technologies && (
                              <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '8px',
                                marginTop: '8px'
                              }}>
                                {project.technologies.map((tech, techIndex) => (
                                  <span 
                                    key={techIndex}
                                    style={{
                                      background: '#e5e7eb',
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8rem',
                                      color: '#4B5563'
                                    }}
                                  >
                                    {tech}
                                  </span>
                        ))}
                      </div>
                    )}
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginTop: '8px',
                                  color: '#2563eb',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem'
                                }}
                              >
                                <FaExternalLinkAlt />
                                View Project
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No projects recorded</p>
                    )}
                  </div>

                  {/* Jobs Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Jobs</h4>
                    {selectedStudent.jobs?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.jobs.map((job, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.jobs.length - 1 ? '20px' : 0,
                            paddingBottom: index < selectedStudent.jobs.length - 1 ? '20px' : 0,
                            borderBottom: index < selectedStudent.jobs.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {job.title} at {job.company}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {new Date(job.startDate).toLocaleDateString()} - {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {job.description}
                            </p>
                            {job.technologies && (
                              <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '8px',
                                marginTop: '8px'
                              }}>
                                {job.technologies.map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    style={{
                                      background: '#e5e7eb',
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8rem',
                                      color: '#4B5563'
                                    }}
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No job experience recorded</p>
                            )}
                          </div>

                  {/* Internships Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Internships</h4>
                    {selectedStudent.internships?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.internships.map((internship, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.internships.length - 1 ? '20px' : 0,
                            paddingBottom: index < selectedStudent.internships.length - 1 ? '20px' : 0,
                            borderBottom: index < selectedStudent.internships.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {internship.title} at {internship.company}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {new Date(internship.startDate).toLocaleDateString()} - {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {internship.description}
                            </p>
                            {internship.technologies && (
                              <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '8px',
                                marginTop: '8px'
                              }}>
                                {internship.technologies.map((tech, techIndex) => (
                                  <span 
                                    key={techIndex}
                                    style={{
                                      background: '#e5e7eb',
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8rem',
                                      color: '#4B5563'
                                    }}
                                  >
                                    {tech}
                                  </span>
                        ))}
                      </div>
                    )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No internships recorded</p>
                    )}
                  </div>

                  {/* Previous Interviews Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Previous Interviews</h4>
                    {selectedStudent.interviews?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.interviews.map((interview, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.interviews.length - 1 ? '20px' : 0,
                            paddingBottom: index < selectedStudent.interviews.length - 1 ? '20px' : 0,
                            borderBottom: index < selectedStudent.interviews.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {interview.companyId?.name || 'Unknown Company'} - {interview.role}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {new Date(interview.date).toLocaleDateString()}
                            </p>
                            {interview.feedback && (
                              <div style={{ 
                                marginTop: '8px',
                                background: '#f8fafc',
                                padding: '12px',
                                borderRadius: '8px'
                              }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                                  <strong style={{ color: '#1e40af' }}>Technical Score:</strong> {interview.feedback.technicalScore || 'N/A'}
                                </p>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                                  <strong style={{ color: '#1e40af' }}>Communication Score:</strong> {interview.feedback.communicationScore || 'N/A'}
                                </p>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                                  <strong style={{ color: '#1e40af' }}>Overall Score:</strong> {interview.feedback.overallScore || 'N/A'}
                                </p>
                                {interview.feedback.comments && (
                                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                                    <strong style={{ color: '#1e40af' }}>Comments:</strong> {interview.feedback.comments}
                                  </p>
                                )}
                          </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No previous interviews recorded</p>
                    )}
                  </div>

                  {/* Reviews Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Reviews</h4>
                    {selectedStudent.reviews?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.reviews.map((review, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.reviews.length - 1 ? '20px' : 0,
                            paddingBottom: index < selectedStudent.reviews.length - 1 ? '20px' : 0,
                            borderBottom: index < selectedStudent.reviews.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start', 
                              marginBottom: '8px' 
                            }}>
                              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                                {review.reviewer?.name || 'Anonymous'}
                              </p>
                              <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                          </div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {review.content}
                            </p>
                            {review.rating && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                marginTop: '8px'
                              }}>
                                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Rating:</span>
                                <span style={{ 
                                  color: '#F59E0B',
                                  fontWeight: '500',
                                  background: '#FEF3C7',
                                  padding: '2px 8px',
                                  borderRadius: '12px'
                                }}>
                                  {review.rating}/5
                                </span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No reviews recorded</p>
                    )}
                      </div>

                  {/* Achievements & Certifications Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Achievements & Certifications</h4>
                    {selectedStudent.achievements?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.achievements.map((achievement, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.achievements.length - 1 ? '16px' : 0,
                            paddingBottom: index < selectedStudent.achievements.length - 1 ? '16px' : 0,
                            borderBottom: index < selectedStudent.achievements.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {achievement.title}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {achievement.issuer} - {new Date(achievement.date).toLocaleDateString()}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {achievement.description}
                            </p>
                            {achievement.link && (
                              <a 
                                href={achievement.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  color: '#2563eb',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem'
                                }}
                              >
                                <FaExternalLinkAlt />
                                View Certificate
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No achievements or certifications recorded</p>
                    )}
                  </div>

                  {/* Extracurricular Activities Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Extracurricular Activities</h4>
                    {selectedStudent.extracurricular?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.extracurricular.map((activity, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.extracurricular.length - 1 ? '16px' : 0,
                            paddingBottom: index < selectedStudent.extracurricular.length - 1 ? '16px' : 0,
                            borderBottom: index < selectedStudent.extracurricular.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {activity.name}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {activity.role}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {activity.achievement}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No extracurricular activities recorded</p>
                    )}
                          </div>

                  {/* Research & Hackathons Section */}
                  <div style={{ 
                    marginBottom: '24px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}>
                    <h4 style={{ 
                      color: '#1e40af',
                      marginBottom: '16px',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px'
                    }}>Research & Hackathons</h4>
                    {selectedStudent.research?.length > 0 ? (
                      <ul style={{ 
                        margin: 0, 
                        padding: 0, 
                        listStyle: 'none' 
                      }}>
                        {selectedStudent.research.map((item, index) => (
                          <li key={index} style={{ 
                            marginBottom: index < selectedStudent.research.length - 1 ? '16px' : 0,
                            paddingBottom: index < selectedStudent.research.length - 1 ? '16px' : 0,
                            borderBottom: index < selectedStudent.research.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
                              {item.title}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280', fontSize: '0.9rem' }}>
                              {item.role} - {item.year}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              {item.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No research or hackathons recorded</p>
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '12px',
                    marginTop: '20px'
                  }}>
                    <button 
                      onClick={handleCloseProfileModal}
                      style={{
                        padding: '8px 16px',
                        background: '#e5e7eb',
                        color: '#4B5563',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
                      </div>
                    )}

          {/* Cancel Interview Modal */}
          {showCancelModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Cancel Interview</h3>
                  <button 
                    className="close-button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setInterviewToCancel(null);
                      setEmailTitle('Interview Cancellation Notice');
                      setEmailBody('');
                    }}
                  >
                    <FaTimes />
                  </button>
                            </div>
                <div className="modal-body">
                  <div style={{
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <p style={{
                      margin: '0 0 16px 0',
                      color: '#374151',
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>Are you sure you want to cancel this interview? An email will be sent to the candidate.</p>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Candidate:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToCancel?.candidateName}</span>
                              </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Role:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToCancel?.role}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Date:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{formatDate(interviewToCancel?.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Email Title</label>
                    <input
                      type="text"
                      value={emailTitle}
                      onChange={(e) => setEmailTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        marginTop: '8px'
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Body</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows="6"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        marginTop: '8px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setInterviewToCancel(null);
                      setEmailTitle('Interview Cancellation Notice');
                      setEmailBody('');
                    }}
                    disabled={isSendingEmail}
                  >
                    Back
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={confirmCancelInterview}
                    disabled={!emailBody.trim() || isSendingEmail}
                    style={{
                      background: '#EF4444',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSendingEmail ? (
                      <>
                        <FaSpinner className="spinner" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <FaTimes />
                        Cancel Interview
                      </>
                    )}
                  </button>
                          </div>
              </div>
                      </div>
                    )}

          {/* Accept Candidate Modal */}
          {showAcceptModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Accept Candidate</h3>
                  <button 
                    className="close-button"
                    onClick={() => {
                      setShowAcceptModal(false);
                      setInterviewToAccept(null);
                      setAcceptEmailTitle('Congratulations - Interview Selection');
                      setAcceptEmailBody('');
                    }}
                    disabled={isSendingEmail}
                  >
                    <FaTimes />
                  </button>
                      </div>
                <div className="modal-body">
                  <div style={{
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Candidate:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToAccept?.candidateName}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Role:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToAccept?.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Email Title</label>
                    <input
                      type="text"
                      value={acceptEmailTitle}
                      onChange={(e) => setAcceptEmailTitle(e.target.value)}
                      disabled={isSendingEmail}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        opacity: isSendingEmail ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Email Body</label>
                    <textarea
                      value={acceptEmailBody}
                      onChange={(e) => setAcceptEmailBody(e.target.value)}
                      disabled={isSendingEmail}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        minHeight: '150px',
                        opacity: isSendingEmail ? 0.7 : 1
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowAcceptModal(false);
                      setInterviewToAccept(null);
                      setAcceptEmailTitle('Congratulations - Interview Selection');
                      setAcceptEmailBody('');
                    }}
                    disabled={isSendingEmail}
                    style={{
                      opacity: isSendingEmail ? 0.7 : 1,
                      cursor: isSendingEmail ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={confirmAcceptCandidate}
                    disabled={!acceptEmailBody.trim() || isSendingEmail}
                    style={{
                      background: '#10B981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: (!acceptEmailBody.trim() || isSendingEmail) ? 0.7 : 1,
                      cursor: (!acceptEmailBody.trim() || isSendingEmail) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSendingEmail ? (
                      <>
                        <FaSpinner className="spinner" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Accept & Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
                  </div>
                )}

          {/* Reject Candidate Modal */}
          {showRejectModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Reject Candidate</h3>
                  <button 
                    className="close-button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setInterviewToReject(null);
                      setRejectEmailTitle('Interview Result Update');
                      setRejectEmailBody('');
                    }}
                    disabled={isSendingEmail}
                  >
                    <FaTimes />
                  </button>
              </div>
                <div className="modal-body">
                  <div style={{
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Candidate:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToReject?.candidateName}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.9rem',
                          minWidth: '80px'
                        }}>Role:</span>
                        <span style={{
                          color: '#111827',
                          fontWeight: '500'
                        }}>{interviewToReject?.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Email Title</label>
                    <input
                      type="text"
                      value={rejectEmailTitle}
                      onChange={(e) => setRejectEmailTitle(e.target.value)}
                      disabled={isSendingEmail}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        opacity: isSendingEmail ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Email Body</label>
                    <textarea
                      value={rejectEmailBody}
                      onChange={(e) => setRejectEmailBody(e.target.value)}
                      disabled={isSendingEmail}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        minHeight: '150px',
                        opacity: isSendingEmail ? 0.7 : 1
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setInterviewToReject(null);
                      setRejectEmailTitle('Interview Result Update');
                      setRejectEmailBody('');
                    }}
                    disabled={isSendingEmail}
                    style={{
                      opacity: isSendingEmail ? 0.7 : 1,
                      cursor: isSendingEmail ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={confirmRejectCandidate}
                    disabled={!rejectEmailBody.trim() || isSendingEmail}
                    style={{
                      background: '#EF4444',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: (!rejectEmailBody.trim() || isSendingEmail) ? 0.7 : 1,
                      cursor: (!rejectEmailBody.trim() || isSendingEmail) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSendingEmail ? (
                      <>
                        <FaSpinner className="spinner" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <FaTimes />
                        Reject & Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="recent-applications">
            <div className="section-header">
              <h3>Upcoming Interviews</h3>
              <div className="header-actions">
                <div className="filter-container">
                  <button 
                    className="filter-button"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <span className="filter-icon">🔍</span>
                    Filter
                  </button>
                  {showFilter && (
                    <div className="filter-dropdown">
                      <div className="filter-section">
                        <label>Filter by Role</label>
                        <select 
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="filter-select"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="filter-section">
                        <label>Sort by Marks</label>
                        <div className="filter-options">
                          <label className="filter-option">
                            <input
                              type="checkbox"
                              checked={sortByMarks}
                              onChange={(e) => setSortByMarks(e.target.checked)}
                            />
                            <span>Show highest marks first</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  className="view-all-button"
                  onClick={handleViewAll}
                >
                  {showAll ? 'Show Less' : 'View All'}
                </button>
              </div>
            </div>

            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Interviewer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ 
                        padding: '48px',
                        textAlign: 'center',
                        background: 'white',
                        verticalAlign: 'middle',
                        height: '200px'
                      }}>
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <span className="ml-3 text-gray-600">Loading interviews...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" style={{ 
                        color: '#dc2626', 
                        textAlign: 'center', 
                        padding: '24px',
                        verticalAlign: 'middle',
                        height: '100px'
                      }}>
                        {error}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {paginatedInterviews.map((interview) => (
                        <tr key={interview._id}>
                          <td>
                            <span 
                              onClick={() => handleViewProfile(interview.studentDetails?._id)} 
                              style={{ 
                                color: '#3B82F6', 
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                position: 'relative'
                              }}
                              title={`Click to view full profile
Name: ${interview.candidateName}
Roll Number: ${interview.studentDetails?.rollNumber || 'N/A'}
Department: ${interview.studentDetails?.department || 'N/A'}
CGPA: ${interview.studentDetails?.cgpa || 'N/A'}`}
                            >
                              {highlightText(interview.candidateName, filters.searchBy === 'candidate' ? filters.searchQuery : '')}
                            </span>
                          </td>
                          <td>{highlightText(interview.role, filters.searchBy === 'position' ? filters.searchQuery : '')}</td>
                          <td>
                            {interview.interviewer ? (
                              <span 
                                style={{ 
                                  color: '#4B5563',
                                  fontWeight: '500',
                                  position: 'relative'
                                }}
                                title={`Interviewer Details
Name: ${interview.interviewer.name}
Email: ${interview.interviewer.email}
Position: ${interview.interviewer.position || 'N/A'}`}
                              >
                                {highlightText(interview.interviewer.name, filters.searchBy === 'interviewer' ? filters.searchQuery : '')}
                              </span>
                            ) : (
                              <span style={{ 
                                color: '#9CA3AF',
                                fontStyle: 'italic'
                              }}>
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td>{formatDate(interview.date)}</td>
                          <td>{formatTime(interview.date)}</td>
                          <td>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: 4, 
                              fontSize: 12,
                              fontWeight: 500,
                              background: 
                                interview.status === 'completed' ? '#dcfce7' : 
                                interview.status === 'scheduled' ? '#e0f2fe' :
                                interview.status === 'cancelled' ? '#fee2e2' :
                                interview.status === 'in-progress' ? '#fef3c7' :
                                interview.status === 'accepted' ? '#dcfce7' :
                                interview.status === 'rejected' ? '#fee2e2' :
                                interview.status === 'selected' ? '#dcfce7' : '#f3f4f6',
                              color: 
                                interview.status === 'completed' ? '#059669' :
                                interview.status === 'scheduled' ? '#0284c7' :
                                interview.status === 'cancelled' ? '#dc2626' :
                                interview.status === 'in-progress' ? '#d97706' :
                                interview.status === 'accepted' ? '#059669' :
                                interview.status === 'rejected' ? '#dc2626' :
                                interview.status === 'selected' ? '#059669' : '#6b7280'
                            }}>
                              {highlightText(interview.status.charAt(0).toUpperCase() + interview.status.slice(1), filters.searchBy === 'status' ? filters.searchQuery : '')}
                            </span>
                          </td>
                          <td>
                            {interview.studentDetails?.campusScore !== undefined 
                              ? interview.studentDetails.campusScore || 'N/A'
                              : 'N/A'}
                          </td>
                          <td>
                            {interview.feedback ? (
                              <span
                                style={{ position: 'relative' }}
                                title={`Interview Feedback
Technical Score: ${interview.feedback.technicalScore || 'N/A'}
Communication Score: ${interview.feedback.communicationScore || 'N/A'}
Problem Solving Score: ${interview.feedback.problemSolvingScore || 'N/A'}
Overall Score: ${interview.feedback.overallScore || 'N/A'}
Comments: ${interview.feedback.comments || 'No comments'}`}
                              >
                                {interview.feedback.overallScore || 'N/A'}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td>
                            {interview.link || interview.zoomLink ? (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px'
                              }}>
                                <button
                                  onClick={() => handleViewLink(interview.link || interview.zoomLink)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#3B82F6',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="View meeting link"
                                >
                                  <FaEye />
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                                No link available
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <div className="interview-actions">
                                <input
                                  type="checkbox"
                                  className="mark-done-checkbox"
                                  checked={interview.isDone}
                                  onChange={(e) => handleMarkAsDone(interview._id, e)}
                                  disabled={interview.status === 'completed' || interview.status === 'rejected' || interview.status === 'accepted'}
                                  style={{ 
                                    marginRight: '10px',
                                    opacity: (interview.status === 'completed' || interview.status === 'rejected' || interview.status === 'accepted') ? '0.5' : '1',
                                    cursor: (interview.status === 'completed' || interview.status === 'rejected' || interview.status === 'accepted') ? 'not-allowed' : 'pointer'
                                  }}
                                />
                                <span style={{ 
                                  marginRight: '10px',
                                  opacity: (interview.status === 'completed' || interview.status === 'rejected' || interview.status === 'accepted') ? '0.5' : '1'
                                }}>Mark as Done</span>
                                {interview.status === 'scheduled' && (
                                  <div className="action-buttons-container">
                                    <div className="button-group">
                                      <button 
                                        className="action-button conduct"
                                        onClick={() => handleConductInterview(interview._id)}
                                      >
                                        <FaVideo style={{ marginRight: '6px' }} />
                                        Conduct Interview
                                      </button>
                                      <button 
                                        className="action-button cancel"
                                        onClick={() => handleCancelInterview(interview._id)}
                                      >
                                        <FaTimes style={{ marginRight: '6px' }} />
                                        Cancel Interview
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {interview.status === 'in-progress' && (
                                  <div className="action-buttons-container">
                                    <div className="button-group">
                                      <button 
                                        className="action-button conduct"
                                        onClick={() => handleConductInterview(interview._id)}
                                      >
                                        <FaVideo style={{ marginRight: '6px' }} />
                                        Continue Interview
                                      </button>
                                      <button 
                                        className="action-button cancel"
                                        onClick={() => handleCancelInterview(interview._id)}
                                      >
                                        <FaTimes style={{ marginRight: '6px' }} />
                                        Cancel Interview
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {interview.isDone && (
                                  <div className="action-buttons-container">
                                    <div className="button-group">
                                      <button 
                                        className="action-button accept"
                                        onClick={() => handleAcceptCandidate(interview._id)}
                                        disabled={interview.status === 'accepted' || interview.status === 'rejected'}
                                        style={{
                                          opacity: (interview.status === 'accepted' || interview.status === 'rejected') ? 0.5 : 1,
                                          cursor: (interview.status === 'accepted' || interview.status === 'rejected') ? 'not-allowed' : 'pointer'
                                        }}
                                      >
                                        {interview.status === 'accepted' ? (
                                          <>
                                            <FaCheck style={{ marginRight: '6px' }} />
                                            Accepted
                                          </>
                                        ) : (
                                          'Accept Candidate'
                                        )}
                                      </button>
                                      <button 
                                        className="action-button reject"
                                        onClick={() => handleRejectCandidate(interview._id)}
                                        disabled={interview.status === 'accepted' || interview.status === 'rejected'}
                                        style={{
                                          opacity: (interview.status === 'accepted' || interview.status === 'rejected') ? 0.5 : 1,
                                          cursor: (interview.status === 'accepted' || interview.status === 'rejected') ? 'not-allowed' : 'pointer'
                                        }}
                                      >
                                        {interview.status === 'rejected' ? (
                                          <>
                                            <FaTimes style={{ marginRight: '6px' }} />
                                            Rejected
                                          </>
                                        ) : (
                                          'Reject Candidate'
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
              {showAll && (
                <div className="pagination">
                  <button 
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Link Modal */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={handleCloseLinkModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>Meeting Link</h3>
              <button 
                className="close-button"
                onClick={handleCloseLinkModal}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: '#F3F4F6',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <a 
                  href={selectedLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#3B82F6',
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1
                  }}
                >
                  <FaVideo style={{ fontSize: '0.9rem' }} />
                  {selectedLink}
                </a>
                <button
                  onClick={() => handleCopyLink(selectedLink)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedLink === selectedLink ? '#10B981' : '#6B7280',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  title="Copy meeting link"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaCopy />
                </button>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={handleCloseLinkModal}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: '#fff',
                    color: '#4B5563',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <CompanySettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          company={company}
          onUpdate={(updatedCompany) => {
            setCompany(updatedCompany);
            setSidebarUser({
              initials: updatedCompany.name.substring(0, 2).toUpperCase(),
              name: updatedCompany.name,
              role: 'Company Admin',
              profileImage: localStorage.getItem('profileImage') || updatedCompany?.profileImage || ''
            });
          }}
        />
      )}
    </div>
  );
};

export default ScheduledInterviews; 