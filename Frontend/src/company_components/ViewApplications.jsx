import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaCheck, FaTimes, FaCalendarAlt, FaUsers, FaUser, FaStar, FaUserGraduate } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true;
import SearchBar from '../SearchBar';
import calculateCampusScore from '../utils/calculateCampusScore';
import CompanySettingsModal from './CompanySettingsModal';
import Loader from '../components/Loader';
const apiUrl = import.meta.env.VITE_API_URL;



const ViewApplications = () => {
  const { companyId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [company, setCompany] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewLink, setInterviewLink] = useState('');
  const [closingApplicationId, setClosingApplicationId] = useState(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(null);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [showInterviewerModal, setShowInterviewerModal] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [interviewerSearch, setInterviewerSearch] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [acceptMailSubject, setAcceptMailSubject] = useState('');
  const [acceptMailBody, setAcceptMailBody] = useState('');
  const [rejectMailSubject, setRejectMailSubject] = useState('');
  const [rejectMailBody, setRejectMailBody] = useState('');
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarUser, setSidebarUser] = useState({
    name: 'Company Admin',
    role: 'Company Admin',
    initials: 'CA',
    profileImage: localStorage.getItem('profileImage') || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch complete company data
        const [applicationsResponse, companyResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/company/${companyId}/applications/complete`),
          axios.get(`${apiUrl}/api/company/${companyId}`)
        ]);
        
        const { applications } = applicationsResponse.data;
        const companyData = companyResponse.data;
        
        setCompany(companyData);
        setApplications(applications);
        // Update sidebar user when company data is loaded
        if (companyData && companyData.name) {
          setSidebarUser({
            name: companyData.name,
            role: 'Company Admin',
            initials: companyData.name.substring(0, 2).toUpperCase(),
            profileImage: localStorage.getItem('profileImage') || companyData.profileImage || ''
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const navItems = [
    { label: 'Dashboard', href: `/company/${localStorage.getItem('companyId')}/dashboard`, icon: <FaChevronRight /> },
    { label: 'Demand Roles', href: `/company/${localStorage.getItem('companyId')}/post-job`, icon: <FaChevronRight /> },
    { label: 'Scheduled Interviews', href: `/company/${localStorage.getItem('companyId')}/scheduled-interviews`, icon: <FaChevronRight /> },
    { label: 'Applications', href: `/company/${localStorage.getItem('companyId')}/applications`, icon: <FaChevronRight /> },
    { label: 'Manage Employees', href: `/company/${localStorage.getItem('companyId')}/employees`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/company/${localStorage.getItem('companyId')}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/company/${localStorage.getItem('companyId')}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const handleViewStudents = (application) => {
    setSelectedApplication(application);
    setShowStudentsModal(true);
  };

  const fetchStudentDetails = async (studentId) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      // Using the new endpoint
      const res = await axios.get(`${apiUrl}/api/students/${studentId}`);
      const completeProfile = await fetchCompleteStudentProfile(studentId);
      setSelectedStudentProfile(completeProfile);
      setShowProfileModal(true);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setProfileError('Failed to fetch student profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Add new function to fetch complete student profile for campus score
  const fetchCompleteStudentProfile = async (studentId) => {
    try {
      const res = await axios.get(`${apiUrl}/api/students/${studentId}`);
      // Also fetch internships, jobs and interview data
      const [internshipsRes, interviewsRes, jobsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/internships/student/${studentId}`),
        axios.get(`${apiUrl}/api/interviews/student/${studentId}`),
        axios.get(`${apiUrl}/api/jobs/student/${studentId}`)
      ]);
      
      return {
        ...res.data,
        internships: internshipsRes.data,
        interview_scheduled: interviewsRes.data,
        jobs: jobsRes.data
      };
    } catch (err) {
      console.error('Error fetching complete student profile:', err);
      return null;
    }
  };

  const handleScheduleInterviewModal = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/interviews`, {
        interviewer: selectedInterviewer,
        interviewee: selectedStudent._id,
        candidateName: selectedStudent.name,
        date: new Date(`${interviewDate}T${interviewTime}`),
        mailSubject,
        mailBody,
        applicationId: selectedApplication._id
      });

      // Update both the main applications list and the selected application in the modal
      setApplications(prevApplications => prevApplications.map(app => {
        if (app._id === selectedApplication._id) {
          return {
            ...app,
            students: app.students.map(student => {
              if (student.studentId._id === selectedStudent._id) {
                return { ...student, status: 'interview-scheduled' };
              }
              return student;
            })
          };
        }
        return app;
      }));

      // Update the selected application in the modal
      setSelectedApplication(prevApp => ({
        ...prevApp,
        students: prevApp.students.map(student => {
          if (student.studentId._id === selectedStudent._id) {
            return { ...student, status: 'interview-scheduled' };
          }
          return student;
        })
      }));

      // Show success message
      setError(null);
      setValidationError('Interview scheduled successfully!');
      setCreatingMeeting(false);
      // Reset form states
      setInterviewDate('');
      setInterviewTime('');
      setMailSubject('');
      setMailBody('');
      setSelectedInterviewer('');
      setZoomLink('');

      // Close modals and clear success message after a short delay
      setTimeout(() => {
      setShowScheduleModal(false);
        setShowInterviewerModal(false);
        setValidationError('');
        setError(null);
      }, 1500);

    } catch (err) {
      setError('Failed to schedule interview');
      setValidationError('');
    }
  };

  const handleCloseApplication = async (applicationId) => {
    // Start the exit animation
    setClosingApplicationId(applicationId);

    try {
      // Make the API call to update the status
      await axios.patch(`${apiUrl}/api/applications/${applicationId}/status`, {
        status: 'closed'
      });

      // Wait for the animation to complete before removing the card
      setTimeout(() => {
        // Update local state by removing the closed application
        setApplications(applications.filter(app => app._id !== applicationId));
        setClosingApplicationId(null); // Reset closing state
      }, 500); // Match this timeout to the CSS animation duration

    } catch (err) {
      // If API call fails, stop the animation and show error
      setClosingApplicationId(null);
      setError('Failed to close application');
    }
  };

  const handleRequestClose = (applicationId) => {
    setShowCloseConfirmation(applicationId);
  };

  const handleConfirmClose = async () => {
    if (showCloseConfirmation) {
      const appIdToClose = showCloseConfirmation;
      setShowCloseConfirmation(null); // Close the confirmation UI
      await handleCloseApplication(appIdToClose); // Trigger the closing logic
    }
  };

  const handleCancelClose = () => {
    setShowCloseConfirmation(null); // Close the confirmation UI
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'interview-scheduled': return '#1e40af';
      case 'accepted': return '#065f46';
      case 'rejected': return '#991b1b';
      case 'interview-rescheduled': return '#92400e';
      case 'interview-cancelled': return '#4b5563';
      default: return '#4b5563';
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'interview-scheduled': return '#dbeafe';
      case 'accepted': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      case 'interview-rescheduled': return '#fef3c7';
      case 'interview-cancelled': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const handleOpenScheduleModal = async (student) => {
    setSelectedStudent(student);
    setMailSubject(`Interview Invitation for ${student.name}`);
    setMailBody(`Dear ${student.name},\n\nYou are invited for an interview. Please join using the Zoom link at the scheduled time.\n\nBest regards,\n${localStorage.getItem('employeeName') || 'HR Team'}`);
    setShowScheduleModal(true);
    setZoomLink('');
    setSelectedInterviewer('');
    // Fetch employees for the company
    const res = await axios.get(`${apiUrl}/api/employees?companyId=${localStorage.getItem('companyId')}`);
    setInterviewers(res.data);
  };

  function validateSchedule() {
    if (!mailSubject.trim() || !mailBody.trim()) return 'Mail subject and body are required.';
    if (!interviewDate || !interviewTime) return 'Date and time are required.';
    const selectedDateTime = new Date(`${interviewDate}T${interviewTime}`);
    if (selectedDateTime < new Date()) return 'Date and time must be in the future.';
    if (!selectedInterviewer) return 'Please select an interviewer.';
    return '';
  }

  // Filter interviewers based on search
  const filteredInterviewers = interviewers.filter(emp => {
    const search = interviewerSearch.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(search) ||
      emp.department?.toLowerCase().includes(search) ||
      (emp.ratings && String(emp.ratings).toLowerCase().includes(search)) ||
      emp.position?.toLowerCase().includes(search)
    );
  });

  // Helper function to highlight search text
  function highlightText(text, search) {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <span key={i} style={{ background: '#fef08a', color: '#b45309', borderRadius: 3 }}>{part}</span>
        : part
    );
  }

  const handleAccept = async (studentObj) => {
    // Show modal with email template
    setSelectedStudentForAction(studentObj);
    setAcceptMailSubject(`Congratulations! You've been selected for ${selectedApplication.roleId?.jobTitle}`);
    setAcceptMailBody(`Dear ${studentObj.studentId.name},\n\nWe are pleased to inform you that you have been selected for the position of ${selectedApplication.roleId?.jobTitle} at ${company?.name}.\n\nWe were impressed with your qualifications and believe you would be a great addition to our team.\n\nPlease let us know your decision at the earliest.\n\nBest regards,\n${localStorage.getItem('employeeName') || 'HR Team'}`);
    setShowAcceptModal(true);
  };

  const handleReject = async (studentObj) => {
    // Show modal with email template
    setSelectedStudentForAction(studentObj);
    setRejectMailSubject(`Application Status Update - ${selectedApplication.roleId?.jobTitle}`);
    setRejectMailBody(`Dear ${studentObj.studentId.name},\n\nThank you for your interest in the ${selectedApplication.roleId?.jobTitle} position at ${company?.name}.\n\nAfter careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe appreciate your time and interest in our company and wish you success in your job search.\n\nBest regards,\n${localStorage.getItem('employeeName') || 'HR Team'}`);
    setShowRejectModal(true);
  };

  const handleConfirmAccept = async () => {
    try {
      // Store the student ID before clearing the state
      const studentId = selectedStudentForAction.studentId._id;
      const applicationId = selectedApplication._id;

      // Make API call first
      await axios.post(`${apiUrl}/api/applications/${applicationId}/students/${studentId}/accept`, {
        mailSubject: acceptMailSubject,
        mailBody: acceptMailBody
      });

      // Update both the main applications list and the selected application in the modal
      setApplications(prevApplications => prevApplications.map(app => {
        if (app._id === applicationId) {
          return {
            ...app,
            students: app.students.map(student => {
              if (student.studentId._id === studentId) {
                return { ...student, status: 'accepted' };
              }
              return student;
            })
          };
        }
        return app;
      }));

      // Update the selected application in the modal
      setSelectedApplication(prevApp => ({
        ...prevApp,
        students: prevApp.students.map(student => {
          if (student.studentId._id === studentId) {
            return { ...student, status: 'accepted' };
          }
          return student;
        })
      }));
      
      // Close modal and reset states
      setShowAcceptModal(false);
      setSelectedStudentForAction(null);
      setAcceptMailSubject('');
      setAcceptMailBody('');

      // Show success message
      setError(null);
      setValidationError('Student accepted successfully!');
      
      // Keep success message visible for 3 seconds
      setTimeout(() => {
        setValidationError('');
      }, 3000);

    } catch (err) {
      console.error('Error accepting student:', err);
      setError('Failed to accept student');
      setValidationError('');
    }
  };

  const handleConfirmReject = async () => {
    try {
      // Store the student ID before clearing the state
      const studentId = selectedStudentForAction.studentId._id;
      const applicationId = selectedApplication._id;

      // Make API call first
      await axios.post(`${apiUrl}/api/applications/${applicationId}/students/${studentId}/reject`, {
        mailSubject: rejectMailSubject,
        mailBody: rejectMailBody
      });

      // Update both the main applications list and the selected application in the modal
      setApplications(prevApplications => prevApplications.map(app => {
        if (app._id === applicationId) {
          return {
            ...app,
            students: app.students.map(student => {
              if (student.studentId._id === studentId) {
                return { ...student, status: 'rejected' };
              }
              return student;
            })
          };
        }
        return app;
      }));

      // Update the selected application in the modal
      setSelectedApplication(prevApp => ({
        ...prevApp,
        students: prevApp.students.map(student => {
          if (student.studentId._id === studentId) {
            return { ...student, status: 'rejected' };
          }
          return student;
        })
      }));
      
      // Close modal and reset states
      setShowRejectModal(false);
      setSelectedStudentForAction(null);
      setRejectMailSubject('');
      setRejectMailBody('');

      // Show success message
      setError(null);
      setValidationError('Student rejected successfully!');
      
      // Keep success message visible for 3 seconds
      setTimeout(() => {
        setValidationError('');
      }, 3000);

    } catch (err) {
      console.error('Error rejecting student:', err);
      setError('Failed to reject student');
      setValidationError('');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
        <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
          <div style={{ padding: '0 24px' }}>
            <SearchBar onSettingsClick={() => setShowSettings(true)} />
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 64px)', // adjust if you have a header
              width: '100%',
              background: '#fff'
            }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600" style={{ fontSize: 16 }}>Loading applications...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
        <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: '24px' }}>
          <div style={{ color: '#dc2626' }}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ padding: '0 24px' }}>
          <SearchBar onSettingsClick={() => setShowSettings(true)} />
        </div>
        {/* Add validation/error message display */}
        {(validationError || error) && (
          <div style={{
            padding: '12px 24px',
            background: validationError.includes('successfully') ? '#dcfce7' : '#fee2e2',
            color: validationError.includes('successfully') ? '#059669' : '#dc2626',
            borderBottom: '1px solid',
            borderColor: validationError.includes('successfully') ? '#059669' : '#dc2626',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: 12
          }}>
            {validationError || error}
          </div>
        )}
        <div style={{ 
          padding: '24px',
          flex: 1,
          overflowY: 'auto'
        }}>
          <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>Student Applications</h2>
          {applications.length === 0 ? (
            <div>No applications found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
              {applications
                .filter(application => application.status === 'active')
                .map(application => (
                <div
                  key={application._id}
                  style={{
                    position:'relative',
                    minHeight:'230px',
                    minWidth:'100px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    opacity: closingApplicationId === application._id ? 0 : 1,
                    transform: closingApplicationId === application._id ? 'scale(0.9)' : 'scale(1)'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '1.1rem' }}>
                      {application.collegeName || 'College Name Not Available'}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '0.9rem' }}>
                      Role: {application.roleName || 'Role Not Specified'}
                    </p>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                      Students: {application.students?.length || 0}
                    </p>
                  </div>
                  
                  {/* Conditional Confirmation Overlay */}
                  {showCloseConfirmation === application._id ? (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white overlay
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      textAlign: 'center',
                      zIndex: 10 // Ensure it's above other card content
                    }}>
                      <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Confirm Close?</h4>
                      <p style={{ margin: '0 0 20px 0', color: '#4b5563' }}><i> The scheduled interviews however won't be affected</i></p>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                          onClick={handleCancelClose}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#4b5563',
                            cursor: 'pointer'
                          }}
                        >
                          No
                        </button>
                        <button
                          onClick={handleConfirmClose}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                            background: '#dc2626',
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          Yes, Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Original Buttons */
                    <div style={{ display: 'flex', gap: '8px' , position:'absolute', bottom: '1rem'}}>
                      <button
                        onClick={() => handleViewStudents(application)}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#3b82f6',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                      }}
                    >
                        <FaUsers /> View Students
                    </button>
                    <button
                        onClick={() => handleRequestClose(application._id)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#dc2626',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        }}
                      >
                        <FaTimes /> Close
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Students Modal */}
        {showStudentsModal && selectedApplication && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              height: '90vh',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                flexShrink: 0
              }}>
                <h3 style={{ margin: 0 }}>Students from {selectedApplication.applicationFromCollege?.name}</h3>
                    <button
                  onClick={() => setShowStudentsModal(false)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                overflowY: 'auto',
                flex: 1
              }}>
                {selectedApplication.students?.map((studentObj, index) => {
                  const student = studentObj.studentId;
                  return (
                    <div
                      key={student._id}
                      style={{ 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '10px',
                        background: '#fff',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '10px',
                        cursor: 'pointer'
                      }}
                      onClick={() => fetchStudentDetails(student._id)}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 2px 0', color: '#1f2937' }}><b>{student.name}</b></h4>
                        <p style={{ margin: '0 0 2px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                          <b>Batch:</b> {student.batch}
                        </p>
                        <p style={{ margin: '0 0 2px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                          <b>Campus Score:</b> <span style={{ 
                            color: '#f59e0b', 
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FaStar /> {calculateCampusScore(student)}
                          </span>
                        </p>
                        {student.email && (
                          <p style={{ margin: '0 0 2px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                            <b>Email:</b> <i>{student.email}</i>
                          </p>
                        )}
                        {student.resume && (
                          <p style={{ margin: '0 0 2px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                            <a href={student.resume} target="_blank" rel="noopener noreferrer"><b>View Resume</b></a>
                          </p>
                        )}
                        <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                          <b>{student.department}</b> • <b>CGPA:</b> {student.cgpa}
                        </p>
                        {student.skills?.length > 0 && (
                          <div style={{ marginTop: '6px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {student.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  style={{
                                    background: '#e0f2f7',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    color: '#0891b2'
                                  }}
                                >
                                  <i>{skill}</i>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px', alignItems: 'flex-end' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          backgroundColor: getStatusBackground(studentObj.status),
                          color: getStatusColor(studentObj.status)
                        }}>
                          {studentObj.status === 'interview-scheduled' ? 'Interview Scheduled' :
                           studentObj.status === 'accepted' ? 'Accepted' :
                           studentObj.status === 'rejected' ? 'Rejected' :
                           studentObj.status === 'interview-rescheduled' ? 'Interview Rescheduled' :
                           studentObj.status === 'interview-cancelled' ? 'Interview Cancelled' :
                           'Applied'}
                        </span>
                        {studentObj.status === 'applied' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(studentObj);
                              }}
                              style={{
                                padding: '3px 6px',
                                border: 'none',
                                borderRadius: '4px',
                                background: '#059669',
                                color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.8rem',
                                width: '100%'
                      }}
                    >
                              <FaCheck /> Accept
                    </button>
                    <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(studentObj);
                              }}
                      style={{
                                padding: '3px 6px',
                        border: 'none',
                                borderRadius: '4px',
                        background: '#dc2626',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.8rem',
                                width: '100%'
                      }}
                    >
                      <FaTimes /> Reject
                    </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenScheduleModal(student);
                              }}
                              style={{
                                padding: '3px 6px',
                                border: 'none',
                                borderRadius: '4px',
                                background: '#6366f1',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.8rem',
                                width: '100%'
                              }}
                            >
                              <FaCalendarAlt /> Schedule Interview
                            </button>
                          </>
                        ) : studentObj.status === 'interview-scheduled' ? (
                          <button
                            disabled
                            style={{
                              padding: '3px 6px',
                              border: 'none',
                              borderRadius: '4px',
                              background: '#059669',
                              color: '#fff',
                              cursor: 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.8rem',
                              width: '100%',
                              opacity: 0.8
                            }}
                          >
                            <FaCalendarAlt /> Scheduled
                          </button>
                        ) : null}
                  </div>
                </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Student Profile Modal */}
        {showProfileModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1001,
            paddingTop: '20px'
          }}>
            <div style={{
              background: '#fff',
              padding: '0px 20px 20px 20px',
              borderRadius: '12px',
              width: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '0 0',
                paddingBottom: '0px',
                borderBottom: '1px solid #eee',
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 10,
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <h3 style={{ margin: 0, color: '#333' }}>Student Profile</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: '#555'
                  }}
                >
                  ×
                </button>
              </div>
              
              {profileLoading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading profile...</div>}
              {profileError && <div style={{ color: '#dc2626', textAlign: 'center', padding: '20px' }}>Error: {profileError}</div>}
              
              {selectedStudentProfile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Profile Image and Basic Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#eef2ff', padding: '15px', borderRadius: '8px' }}>
                    {selectedStudentProfile.profileImage && (
                      <img 
                        src={selectedStudentProfile.profileImage}
                        alt={`${selectedStudentProfile.name}'s profile`} 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{selectedStudentProfile.name}</h4>
                      <p style={{ margin: '3px 0', color: '#4b5563', fontSize: '0.9rem' }}>{selectedStudentProfile.department} • CGPA: {selectedStudentProfile.cgpa}</p>
                      <p style={{ margin: '3px 0', color: '#4b5563', fontSize: '0.9rem' }}>Roll Number: {selectedStudentProfile.rollNumber} • Batch: {selectedStudentProfile.batch}</p>
                      <p style={{ margin: '3px 0', color: '#4b5563', fontSize: '0.9rem' }}>Joining Year: {selectedStudentProfile.joiningYear} • Graduation Year: {selectedStudentProfile.graduationYear}</p>
                      <p style={{ margin: '3px 0', color: '#4b5563', fontSize: '0.9rem' }}>
                        <span style={{ 
                          color: '#f59e0b', 
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FaStar /> Campus Score: {calculateCampusScore(selectedStudentProfile)}
                        </span>
                      </p>
                       {selectedStudentProfile.email && <p style={{ margin: '3px 0', color: '#4b5563', fontSize: '0.9rem' }}>Email: {selectedStudentProfile.email}</p>}
                       {selectedStudentProfile.resume && 
                          <p style={{ margin: '3px 0', color: '#4b5563', fontSize: '0.9rem' }}>
                              <strong>Resume:</strong> <a href={selectedStudentProfile.resume} target="_blank" rel="noopener noreferrer">View Resume</a>
                          </p>
                       }
                    </div>
                  </div>

                  {/* Campus Score Breakdown */}
                  <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                    <h5 style={{ margin: '0 0 15px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaStar /> Campus Score Breakdown
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {/* Academic Performance */}
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.9rem' }}>Academic Performance</h6>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>CGPA</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.cgpa}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Department Rank</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.departmentRank || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Technical Skills */}
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.9rem' }}>Technical Skills</h6>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Skills Count</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.skills?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Projects</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.projects?.length || 0}</span>
                        </div>
                      </div>

                      {/* Experience */}
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.9rem' }}>Experience</h6>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Internships</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.experience?.filter(exp => exp.type === 'internship').length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Work Experience</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.experience?.filter(exp => exp.type === 'work').length || 0}</span>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.9rem' }}>Achievements</h6>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Hackathons</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.hackathons?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Research Papers</span>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedStudentProfile.research?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Calculation Explanation */}
                    <div style={{ marginTop: '15px', padding: '12px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <h6 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.9rem' }}>Score Calculation</h6>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        The campus score is calculated based on multiple factors including academic performance (CGPA, department rank), 
                        technical skills (number of skills, projects), experience (internships, work experience), and achievements 
                        (hackathons, research papers). Each component is weighted differently to provide a comprehensive assessment 
                        of the student's capabilities.
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedStudentProfile.skills?.length > 0 && (
                    <div style={{ background: '#e0f2f7', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#0891b2' }}>Skills</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedStudentProfile.skills.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              background: '#bae6fd',
                              padding: '5px 10px',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              color: '#0369a1',
                              fontWeight: 'bold'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
            </div>
          )}

                  {/* Education */}
                  {selectedStudentProfile.education?.length > 0 && (
                    <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#0ea5e9' }}>Education</h5>
                      {selectedStudentProfile.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.education.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{edu.degree} in {edu.major}</p>
                          <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}>{edu.institution}</p>
                          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>{edu.startDate} - {edu.endDate || 'Present'}</p>
        </div>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {selectedStudentProfile.experience?.length > 0 && (
                    <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#22c55e' }}>Experience</h5>
                      {selectedStudentProfile.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.experience.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{exp.jobTitle} at {exp.company}</p>
                          <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}>{exp.location}</p>
                          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>{exp.startDate} - {exp.endDate || 'Present'}</p>
                           {exp.description && <p style={{ margin: '5px 0 0 0', color: '#4b5563', fontSize: '0.9rem' }}>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                   {/* Projects */}
                   {selectedStudentProfile.projects?.length > 0 && (
                    <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>Projects</h5>
                      {selectedStudentProfile.projects.map((project, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.projects.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{project.title}</p>
                          {project.link && <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}><a href={project.link} target="_blank" rel="noopener noreferrer">Link</a></p>}
                           {project.description && <p style={{ margin: '0 0 5px 0', color: '#4b5563', fontSize: '0.9rem' }}>{project.description}</p>}
                           {project.technologies && project.technologies.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                {project.technologies.map((tech, techIndex) => (
                                   <span
                                      key={techIndex}
                                      style={{
                                        background: '#fee2e2',
                                        padding: '3px 8px',
                                        borderRadius: '15px',
                                        fontSize: '0.8rem',
                                        color: '#b91c1c'
                                      }}
                                   >
                                      {tech}
                                   </span>
                                ))}
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Research */}
                   {selectedStudentProfile.research?.length > 0 && (
                    <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>Research</h5>
                      {selectedStudentProfile.research.map((item, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.research.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{item.title}</p>
                          <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}>Role: {item.role} • Year: {item.year}</p>
                           {item.description && <p style={{ margin: '0 0 5px 0', color: '#4b5563', fontSize: '0.9rem' }}>{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                   {/* Extracurricular Activities */}
                   {selectedStudentProfile.extracurricular?.length > 0 && (
                    <div style={{ background: '#f5f3ff', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#7c3aed' }}>Extracurricular Activities</h5>
                      {selectedStudentProfile.extracurricular.map((item, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.extracurricular.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{item.activity} ({item.role})</p>
                           {item.achievement && <p style={{ margin: '0 0 5px 0', color: '#4b5563', fontSize: '0.9rem' }}>Achievement: {item.achievement}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                   {/* Hackathons */}
                   {selectedStudentProfile.hackathons?.length > 0 && (
                    <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#0ea5e9' }}>Hackathons</h5>
                      {selectedStudentProfile.hackathons.map((item, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.hackathons.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{item.name} ({item.year})</p>
                           {item.achievement && <p style={{ margin: '0 0 5px 0', color: '#4b5563', fontSize: '0.9rem' }}>Achievement: {item.achievement}</p>}
                           {item.description && <p style={{ margin: '0 0 5px 0', color: '#4b5563', fontSize: '0.9rem' }}>{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interview Schedule */}
                  {selectedStudentProfile.interview_scheduled?.length > 0 && (
                    <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#22c55e' }}>Interview Schedule</h5>
                      {selectedStudentProfile.interview_scheduled.map((interview, index) => (
                        <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: index < selectedStudentProfile.interview_scheduled.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <p style={{ margin: '0 0 5px 0', color: '#374151', fontWeight: 'bold' }}>{interview.role}</p>
                          <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}>{interview.interviewDate} at {interview.interviewTime}</p>

                          {interview.interviewLink && (
                            <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '0.9rem' }}>
                              <a href={interview.interviewLink} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7' }}>Join Interview</a>
                            </p>
                          )}
                          {interview.feedback && (
                            <div style={{ marginTop: '8px', padding: '8px', background: '#f0f4f8', borderRadius: '4px' }}>
                              <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '0.9rem' }}>Feedback:</p>
                              <p style={{ margin: '2px 0', color: '#4b5563', fontSize: '0.85rem' }}>Technical Score: {interview.feedback.technicalScore}</p>
                              <p style={{ margin: '2px 0', color: '#4b5563', fontSize: '0.85rem' }}>Communication Score: {interview.feedback.communicationScore}</p>
                              <p style={{ margin: '2px 0', color: '#4b5563', fontSize: '0.85rem' }}>Problem Solving Score: {interview.feedback.problemSolvingScore}</p>
                              <p style={{ margin: '2px 0', color: '#4b5563', fontSize: '0.85rem' }}>Overall Score: {interview.feedback.overallScore}</p>
                              {interview.feedback.comments && <p style={{ margin: '2px 0', color: '#4b5563', fontSize: '0.85rem' }}>Comments: {interview.feedback.comments}</p>}
                            </div>
                          )}
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: 4, 
                              fontSize: 12,
                              fontWeight: 500,
                              background: interview.status === 'completed' ? '#dcfce7' : 
                                        interview.status === 'scheduled' ? '#e0f2fe' :
                                        interview.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                              color: interview.status === 'completed' ? '#059669' :
                                    interview.status === 'scheduled' ? '#0284c7' :
                                    interview.status === 'cancelled' ? '#dc2626' : '#6b7280'
                            }}>
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact Information */}
                  {selectedStudentProfile.contact && (
                    <div style={{ background: '#e0f7fa', padding: '15px', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#00bcd4' }}>Contact Information</h5>
                      {selectedStudentProfile.contact.phone && <p style={{ margin: '5px 0', color: '#374151' }}><strong>Phone:</strong> {selectedStudentProfile.contact.phone}</p>}
                      {selectedStudentProfile.contact.linkedin && <p style={{ margin: '5px 0', color: '#374151' }}><strong>LinkedIn:</strong> <a href={selectedStudentProfile.contact.linkedin} target="_blank" rel="noopener noreferrer">{selectedStudentProfile.contact.linkedin}</a></p>}
                      {selectedStudentProfile.contact.github && <p style={{ margin: '5px 0', color: '#374151' }}><strong>GitHub:</strong> <a href={selectedStudentProfile.contact.github} target="_blank" rel="noopener noreferrer">{selectedStudentProfile.contact.github}</a></p>}
                    </div>
                  )}

                </div>
              )}

              {/* Action Buttons */}
              {selectedStudentProfile && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                      onClick={() => {
                      setSelectedStudent(selectedStudentProfile);
                        setShowScheduleModal(true);
                      }}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#6366f1',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                    <FaCalendarAlt /> Schedule Interview
                    </button>
                   {/* You can add Shortlist/Reject buttons here too if needed */}
                </div>
              )}

            </div>
        </div>
        )}

        {/* Schedule Interview Modal */}
        {showScheduleModal && selectedStudent && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: 480,
              minHeight: 350,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 2000,
              transition: 'none'
            }}>
              <h3 style={{ marginBottom: 24 }}>Schedule Interview for {selectedStudent.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label>
                  Subject:
                  <input
                    type="text"
                    value={mailSubject}
                    onChange={e => setMailSubject(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      marginBottom: 0,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      fontSize: 15
                    }}
                  />
                </label>
                <label>
                  Body:
                  <textarea
                    value={mailBody}
                    onChange={e => setMailBody(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      marginBottom: 0,
                      minHeight: 80,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      fontSize: 15
                    }}
                  />
                </label>
                <label>
                  Date:
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      marginBottom: 0,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      fontSize: 15
                    }}
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={e => setInterviewTime(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      marginBottom: 0,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      fontSize: 15
                    }}
                  />
                </label>
                <label>
                  Interviewer:
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedInterviewer ? (
                      <div style={{ flex: 1 }}>
                        {/* Show interviewer card with highlight */}
                        {(() => {
                          const emp = interviewers.find(emp => emp._id === selectedInterviewer);
                          if (!emp) return null;
                          return (
                            <div
                      style={{
                                border: '2px solid #6366f1',
                                borderRadius: 12,
                                padding: 12,
                                background: '#eef2ff',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                                gap: 18,
                                position: 'relative',
                                marginBottom: 4
                              }}
                            >
                              <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: '#c7d2fe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 18,
                                color: '#3730a3',
                                flexShrink: 0
                              }}>
                                {emp.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 16, color: '#3730a3', marginBottom: 2 }}>{highlightText(emp.name, interviewerSearch)}</div>
                                <div style={{ color: '#6366f1', fontSize: 13, fontWeight: 500 }}>{highlightText(emp.position || 'N/A', interviewerSearch)}</div>
                                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{highlightText(emp.department || 'N/A', interviewerSearch)}</div>
                                <div style={{ color: '#f59e42', fontSize: 12, marginTop: 2 }}>Rating: <b>{highlightText(emp.ratings || 'N/A', interviewerSearch)}</b></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value=""
                        readOnly
                        style={{ flex: 1, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px' }}
                        placeholder="No interviewer selected"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowInterviewerModal(true)}
                      style={{ padding: '6px 12px', borderRadius: 6, background: '#6366f1', color: '#fff', border: 'none' }}
                    >
                      Select Interviewer
                    </button>
                  </div>
                </label>
              </div>
              {zoomLink && (
                <div style={{ marginTop: 16 }}>
                  <div><b>Zoom Link:</b> <a href={zoomLink} target="_blank" rel="noopener noreferrer">{zoomLink}</a></div>
                  <button onClick={() => navigator.clipboard.writeText(zoomLink)} style={{ marginTop: 8 }}>Copy Link</button>
                </div>
              )}
              {validationError && (validationError.includes('error') || validationError.includes('success')) && (
                <div style={{
                  padding: '12px 24px',
                  background: validationError.includes('success') ? '#dcfce7' : '#fee2e2',
                  color: validationError.includes('success') ? '#059669' : '#dc2626',
                  borderBottom: '1px solid',
                  borderColor: validationError.includes('success') ? '#059669' : '#dc2626',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: 12
                }}>{validationError}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
                <button
                  onClick={async () => {
                    const error = validateSchedule();
                    if (error) {
                      setValidationError(error);
                      return;
                    }
                    setValidationError('');
                    setCreatingMeeting(true);
                    try {
                      const res = await axios.post(`${apiUrl}/api/interviews`, {
                        interviewer: selectedInterviewer,
                        interviewee: selectedStudent._id,
                        candidateName: selectedStudent.name,
                        campusScore: selectedStudent.campusScore,
                        role: selectedApplication.roleId?.jobTitle,
                        date: new Date(`${interviewDate}T${interviewTime}`),
                        mailSubject,
                        mailBody,
                        applicationId: selectedApplication._id
                      });
                      
                      // Set the Zoom link from the response
                      setZoomLink(res.data.interview.link);
                      setCreatingMeeting(false);

                      // Update both the main applications list and the selected application in the modal
                      setApplications(prevApplications => prevApplications.map(app => {
                        if (app._id === selectedApplication._id) {
                          return {
                            ...app,
                            students: app.students.map(student => {
                              if (student.studentId._id === selectedStudent._id) {
                                return { ...student, status: 'interview-scheduled' };
                              }
                              return student;
                            })
                          };
                        }
                        return app;
                      }));

                      // Update the selected application in the modal
                      setSelectedApplication(prevApp => ({
                        ...prevApp,
                        students: prevApp.students.map(student => {
                          if (student.studentId._id === selectedStudent._id) {
                            return { ...student, status: 'interview-scheduled' };
                          }
                          return student;
                        })
                      }));

                      // Show success message
                      setError(null);
                      setValidationError('Interview scheduled successfully!');
                      setTimeout(()=>{
                        setValidationError('')
                        
                      },1500)
                    } catch (err) {
                      console.error('Error scheduling interview:', err);
                      setError('Failed to schedule interview');
                      setValidationError('');
                    }
                  }}
                  disabled={creatingMeeting || !interviewDate || !interviewTime}
                  style={{
                    background: '#6366f1',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 6,
                    border: 'none',
                    fontWeight: 500,
                    fontSize: 15
                  }}
                >
                  {creatingMeeting ? 'Scheduling...' : 'Create Zoom Meeting'}
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    background: '#fff',
                    color: '#4b5563',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '10px 20px',
                    fontWeight: 500,
                    fontSize: 15
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            {/* Interviewer Modal to the left, slightly overlapping the schedule modal */}
            {showInterviewerModal && (
              <div style={{
                position: 'fixed',
                top: '50%',
                left: 'calc(50% - 480px - 40px + 60px)', // 60px overlap
                transform: 'translateY(-50%)',
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                width: 400,
                minHeight: 350,
                zIndex: 2001,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                border: '2px solid #6366f1',
                boxShadow: '0 8px 32px rgba(99,102,241,0.12)',
                marginRight: '-60px' // visually overlap
              }}>
                <h3 style={{ margin: 0, color: '#3730a3', fontWeight: 700, letterSpacing: 1 }}>Select Interviewer</h3>
                <input
                  type="text"
                  value={interviewerSearch}
                  onChange={e => setInterviewerSearch(e.target.value)}
                  placeholder="Search by name, department, rating, or position"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    marginBottom: 8,
                    fontSize: 15,
                    background: '#f3f4f6',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredInterviewers.length === 0 ? (
                    <div style={{ color: '#6b7280', textAlign: 'center', marginTop: 32 }}>No interviewers found</div>
                  ) : (
                    filteredInterviewers.map(emp => (
                      <div
                        key={emp._id}
                        style={{
                          border: selectedInterviewer === emp._id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                          borderRadius: 12,
                          padding: 18,
                          background: selectedInterviewer === emp._id ? '#eef2ff' : '#fff',
                          boxShadow: selectedInterviewer === emp._id ? '0 2px 8px rgba(99,102,241,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 18,
                          position: 'relative',
                        }}
                        onClick={() => {
                          setSelectedInterviewer(emp._id);
                          setShowInterviewerModal(false);
                        }}
                      >
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: '#c7d2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 20,
                          color: '#3730a3',
                          flexShrink: 0
                        }}>
                          {emp.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: '#3730a3', marginBottom: 2 }}>{highlightText(emp.name, interviewerSearch)}</div>
                          <div style={{ color: '#6366f1', fontSize: 14, fontWeight: 500 }}>{highlightText(emp.position || 'N/A', interviewerSearch)}</div>
                          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{highlightText(emp.department || 'N/A', interviewerSearch)}</div>
                          <div style={{ color: '#f59e42', fontSize: 13, marginTop: 2 }}>Rating: <b>{highlightText(emp.ratings || 'N/A', interviewerSearch)}</b></div>
                        </div>
                        {selectedInterviewer === emp._id && (
                          <div style={{ position: 'absolute', top: 10, right: 10, color: '#6366f1', fontWeight: 700, fontSize: 18 }}>✓</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => setShowInterviewerModal(false)} style={{ marginTop: 8, alignSelf: 'flex-end', background: '#fff', color: '#6366f1', border: '1px solid #6366f1', borderRadius: 8, padding: '8px 18px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
        )}

        {showInterviewModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '400px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Schedule Interview</h3>
                <button
                  onClick={() => setShowInterviewModal(false)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563' }}>Date</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563' }}>Link</label>
                <input
                  type="text"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  placeholder="Interview Link (Zoom/Meet)"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleScheduleInterviewModal}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#6366f1',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Schedule
                </button>
                <button
                  onClick={() => {
                    setShowInterviewModal(false);
                    setInterviewDate('');
                    setInterviewLink('');
                    setSelectedApplication(null);
                    setSelectedStudent(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: '#fff',
                    color: '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accept Modal */}
        {showAcceptModal && selectedStudentForAction && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '500px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Accept Student</h3>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563' }}>Email Subject</label>
                <input
                  type="text"
                  value={acceptMailSubject}
                  onChange={(e) => setAcceptMailSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563' }}>Email Body</label>
                <textarea
                  value={acceptMailBody}
                  onChange={(e) => setAcceptMailBody(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    minHeight: '150px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleConfirmAccept}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#059669',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Send & Accept
                </button>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: '#fff',
                    color: '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedStudentForAction && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '500px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Reject Student</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563' }}>Email Subject</label>
                <input
                  type="text"
                  value={rejectMailSubject}
                  onChange={(e) => setRejectMailSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563' }}>Email Body</label>
                <textarea
                  value={rejectMailBody}
                  onChange={(e) => setRejectMailBody(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    minHeight: '150px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleConfirmReject}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#dc2626',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Send & Reject
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: '#fff',
                    color: '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Settings Modal */}
      {showSettings && company && (
        <CompanySettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          company={company}
          onUpdate={(updatedCompany) => {
            if (updatedCompany) {
              setCompany(updatedCompany);
              // Update sidebar user info
              const updatedSidebarUser = {
                name: updatedCompany.name,
                role: 'Company Admin',
                initials: updatedCompany.name.substring(0, 2).toUpperCase(),
                profileImage: localStorage.getItem('profileImage') || updatedCompany.profileImage || ''
              };
              setSidebarUser(updatedSidebarUser);
            }
          }}
        />
      )}
    </div>
  );
};

export default ViewApplications; 