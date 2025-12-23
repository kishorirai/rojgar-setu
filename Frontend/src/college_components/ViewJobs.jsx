import { useState, useEffect } from 'react';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaSearch, FaMapMarkerAlt, FaBriefcase, FaClock, FaTimes, FaUserGraduate } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import CollegeSettingsModal from './CollegeSettingsModal';
import Loader from '../components/Loader';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
const apiUrl = import.meta.env.VITE_API_URL;
// Configure axios defaults

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;
const ViewJobs = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [college, setCollege] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const id = localStorage.getItem('collegeId');
        const name = localStorage.getItem('collegeName');
        
        if (!id) {
          return;
        }
        
        setCollegeId(id);
        setCollegeName(name);
        
        // Fetch college details
        const collegeResponse = await axios.get(`${apiUrl}/api/colleges/${id}`);
        setCollege(collegeResponse.data);
        
        await fetchRoles();
      } catch (error) {
        setError('Failed to initialize data');
      }
    };

    initializeData();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/roles`);
      setRoles(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch roles');
      setRoles([]);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/students/college/${collegeId}`);
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleApplyClick = async (role) => {
    setSelectedJob(role);
    await fetchStudents();
    setShowStudentModal(true);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student._id));
    }
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    if (typeof text === 'number') {
      text = text.toString();
    }
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={i} style={{ background: '#fef08a', padding: '0 2px', borderRadius: '2px' }}>{part}</span> : 
        part
    );
  };

  const handleSubmitApplications = async () => {
    try {
      setErrorMessage(null);
      const applicationData = {
        applicationFromCollege: collegeId,
        applicationToCompany: selectedJob.companyId._id,
        roleId: selectedJob._id,
        roleName: selectedJob.jobTitle,
        students: selectedStudents.map(studentId => ({
          studentId: studentId,
          status: 'applied' // Set default status to applied for new applications
        }))
      };
      
      const response = await axios.post(`${apiUrl}/api/applications`, applicationData);
      
      if (response.status === 201) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setShowStudentModal(false);
      setSelectedStudents([]);
          setSelectedJob(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit applications:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to submit applications. Please try again.');
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    (student.graduationYear && student.graduationYear.toString().includes(studentSearchTerm))
  );

  // Navigation items with college ID
  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: collegeName || 'College Admin',
    role: 'Administrator',
    initials: collegeName ? collegeName.substring(0, 2).toUpperCase() : 'CA'
  };

  // Filter roles based on search query and filters
  const filteredRoles = Array.isArray(roles) ? roles.filter(role => {
    const matchesSearch = searchTerm === '' || 
      (role.jobTitle && role.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (role.companyId && role.companyId.name && role.companyId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (role.skills && role.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (role.location && role.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (role.duration && role.duration.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (role.stipend && role.stipend.toString().includes(searchTerm)) ||
      (role.numberOfStudents && role.numberOfStudents.toString().includes(searchTerm));

    const matchesStatus = filterStatus === 'all' || role.status === filterStatus;
    const matchesLocation = selectedLocation === 'All' || (role.location && role.location.toLowerCase() === selectedLocation.toLowerCase());
    const matchesType = selectedType === 'All' || (role.jobType && role.jobType.toLowerCase() === selectedType.toLowerCase());
    return matchesSearch && matchesStatus && matchesLocation && matchesType;
  }) : [];

  // Get unique locations and types for filters
  const locations = ['All', ...new Set(roles.map(role => role.location).filter(Boolean))];
  const types = ['All', ...new Set(roles.map(role => role.jobType).filter(Boolean))];

  const handleCollegeUpdate = (updatedCollege) => {
    setCollege(updatedCollege);
    setCollegeName(updatedCollege.name);
  };

    return (
    <>
      <style>{`
        .demand-role-card {
          position: relative;
          transition: box-shadow 0.28s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
          z-index: 1;
          border: 2px solid #6366f1;
          border-radius: 18px;
          background: #fff;
          padding: 1.3rem 1.5rem 1.1rem 1.5rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          outline: none;
          box-shadow: none;
        }
        .demand-role-card:hover {
          box-shadow: inset 0 4px 32px 0 rgba(0,0,0,0.18) !important;
        }
        .demand-role-card .role-actions {
          display: flex;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s cubic-bezier(0.4,0,0.2,1);
          align-items: center;
        }
        .demand-role-card:hover .role-actions {
          opacity: 1;
          pointer-events: auto;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
        }
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          height: 95vh;
          display: flex;
          flex-direction: column;
          position: relative;
          margin: 0;
          box-sizing: border-box;
        }
      `}</style>
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COLLEGE SERVICES" />
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ padding: '0 24px' }}>
            <SearchBar onSettingsClick={() => setShowSettings(true)} />
        </div>
        <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex',
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px' 
            }}>
              <h2 style={{ color: '#1f2937' }}>Available Jobs</h2>
              <div style={{ display: 'flex', gap: '16px' }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                  padding: '8px 16px',
                    borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                    background: '#fff'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

            {/* Filters */}
            <div style={{ 
                display: 'flex',
              gap: '16px', 
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 16px 8px 40px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  minWidth: '150px'
                }}
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  minWidth: '150px'
                }}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

          {loading ? (
            <Loader message="Loading jobs..." />
          ) : error ? (
            <div style={{ color: '#dc2626' }}>{error}</div>
          ) : filteredRoles.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <p style={{ color: '#6b7280' }}>No jobs found matching your criteria</p>
              </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {filteredRoles.map(role => (
                <div
                  key={role._id}
                  className="demand-role-card"
                    style={{ position: 'relative', overflow: 'visible', minHeight: 220 }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    top: 24, 
                    right: 32, 
                    fontSize: '1.2rem', 
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#4338ca'
                  }}>
                    {role.companyId?.name || 'Techori'}
                    <div style={{ fontSize: '1rem', textAlign: 'right', fontWeight: 600, color: '#4338ca', marginBottom: 2, letterSpacing: 0.5 }}>{role.jobType}</div>
                  </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#4338ca', marginBottom: 2, letterSpacing: 0.5 }}>{role.jobTitle}</div>
                    <div style={{ color: '#6b7280', marginBottom: 16, fontSize: '1.1'}}><i>{role.description}</i></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ color: '#6366f1', fontSize: '1.07rem', fontWeight: 600 }}>
                      <b>Location:</b> {role.location} &nbsp; | &nbsp;
                      <b>Duration:</b> {role.duration} &nbsp; | &nbsp;
                      <b>Stipend:</b> ₹{role.stipend} &nbsp; | &nbsp;
                      <b>Openings:</b> {role.numberOfStudents}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        borderRadius: '999px',
                        padding: '4px 18px',
                        fontWeight: 700,
                        fontSize: '1.07rem',
                        boxShadow: '0 1px 6px #0001',
                        border: '1.5px solid #6366f1',
                        letterSpacing: 0.5,
                        display: 'inline-block',
                        minWidth: 70,
                        textAlign: 'center'
                      }}>
                        Applied: {role.applied}
                      </span>
                      <span style={{ 
                        background: role.status === 'active' ? '#dcfce7' : role.status === 'closed' ? '#fee2e2' : '#f3f4f6',
                        color: role.status === 'active' ? '#059669' : role.status === 'closed' ? '#dc2626' : '#6b7280',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'inline-block',
                        minWidth: 70,
                        textAlign: 'center'
                      }}>
                        {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: '#059669', fontWeight: 700, fontSize: '1.07rem', marginBottom: 2 }}>
                    <b>Skills:</b> <span style={{ fontWeight: 500 }}>{role.skills && role.skills.length > 0 ? role.skills.join(', ') : 'N/A'}</span>
                  </div>
                  <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.07rem', marginBottom: 2 }}>
                    <b>Requirements:</b>
                    <ul style={{ color: '#6366f1', fontWeight: 500, fontSize: '1.07rem', marginLeft: 24, marginTop: 6, marginBottom: 0, listStyleType: 'disc' }}>
                      {role.requirements && role.requirements.length > 0 ? role.requirements.map((req, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>{req}</li>
                      )) : <li>N/A</li>}
                    </ul>
                  </div>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '0.875rem', 
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Posted {formatDistanceToNow(new Date(role.createdAt), { addSuffix: true })}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {role.updatedAt && (
                        <span>Updated {formatDistanceToNow(new Date(role.updatedAt), { addSuffix: true })}</span>
                      )}
                  <div
                    className="role-actions"
                    style={{
                      position: 'absolute',
                      right: 32,
                      bottom: 24,
                      gap: 12,
                    }}
                  >
          <button
                              onClick={() => handleApplyClick(role)}
            style={{
                                background: '#059669',
                        color: '#fff',
              border: 'none',
                        borderRadius: 6,
                        padding: '7px 18px',
                        fontWeight: 600,
                        fontSize: '1rem',
                                boxShadow: '0 2px 8px #05966933',
              cursor: 'pointer',
                        transition: 'background 0.18s, box-shadow 0.18s',
            }}
                              onMouseOver={e => (e.currentTarget.style.background = '#047857')}
                              onMouseOut={e => (e.currentTarget.style.background = '#059669')}
          >
                              Apply For Students
          </button>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

            {/* Student Selection Modal */}
            {showStudentModal && (
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
        zIndex: 1001
      }}>
        <div style={{
          background: '#fff',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
                  {/* Modal Header */}
          <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                      color: '#1f2937',
                      margin: 0
                  }}>
                      Select Students for {selectedJob?.jobTitle} at {selectedJob?.companyId?.name || 'Techori'}
                  </h3>
            <button
                  onClick={() => {
                        setShowStudentModal(false);
                    setSelectedStudents([]);
                        setSelectedJob(null);
                  }}
              style={{
                    background: 'none',
                border: 'none',
                cursor: 'pointer',
                        padding: '4px',
                        color: '#6b7280',
                        transition: 'color 0.2s'
              }}
                      onMouseOver={e => e.currentTarget.style.color = '#1f2937'}
                      onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
            >
                      <FaTimes size={18} />
            </button>
          </div>
              
                  {/* Modal Content */}
              <div style={{ 
                    padding: '12px 16px',
                flex: 1, 
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {/* Combined Select All and Search Row */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                      padding: '6px',
                      background: '#f9fafb',
                      borderRadius: '6px'
                  }}>
                      {/* Select All Checkbox */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '8px',
                        flexShrink: 0
                    }}>
                        <div 
                        style={{
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #059669',
                            borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                            justifyContent: 'center',
                            background: selectedStudents.length === filteredStudents.length ? '#059669' : 'transparent',
                          cursor: 'pointer',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                          onClick={handleSelectAll}
                        >
                          {selectedStudents.length === filteredStudents.length && '✓'}
                        </div>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 500, 
                          color: '#4b5563',
                          whiteSpace: 'nowrap'
                        }}>
                          Select All ({filteredStudents.length})
                        </span>
                      </div>

                      {/* Search Input */}
                      <div style={{ position: 'relative', flex: 1 }}>
             <FaSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 16px 8px 40px',
                          borderRadius: '6px',
                border: '1px solid #e5e7eb',
                            background: '#fff',
                            fontSize: '0.875rem'
              }}
            />
          </div>
                </div>

                    {/* Student List */}
          <div style={{
                      flex: 1,
            overflowY: 'auto',
                      paddingRight: '4px'
                    }}>
                      {filteredStudents.map(student => (
                    <div
                      key={student._id}
                      style={{
                              padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            background: selectedStudents.includes(student._id) ? '#f0fdf4' : '#fff',
                            transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'flex-start',
                            gap: '12px'
                          }}
                          onClick={() => handleStudentSelect(student._id)}
                          onMouseOver={e => e.currentTarget.style.borderColor = '#059669'}
                          onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                        >
                          {/* Checkbox with Tick */}
                            <div style={{
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #059669',
                            borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            background: selectedStudents.includes(student._id) ? '#059669' : 'transparent',
                            flexShrink: 0,
                            marginTop: '2px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {selectedStudents.includes(student._id) && '✓'}
                          </div>

                          {/* Student Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <div style={{ 
                              fontWeight: 600,
                                    color: '#1f2937',
                                fontSize: '0.95rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {highlightText(student.name, studentSearchTerm)}
                                  </div>
                                  <div style={{ 
                                background: '#f3f4f6',
                                padding: '2px 6px',
                                              borderRadius: '4px',
                                              fontSize: '0.75rem',
                                color: '#4b5563',
                                fontWeight: 500,
                                whiteSpace: 'nowrap'
                              }}>
                                {highlightText(student.rollNumber, studentSearchTerm)}
                                      </div>
                                      </div>
                            
                                      <div style={{
                                        display: 'flex',
                              gap: '12px', 
                              flexWrap: 'wrap',
                              fontSize: '0.8rem',
                              color: '#4b5563'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaBriefcase style={{ color: '#6366f1', fontSize: '0.8rem' }} />
                                <span>{highlightText(student.department, studentSearchTerm)}</span>
                                      </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaChartLine style={{ color: '#6366f1', fontSize: '0.8rem' }} />
                                <span>CGPA: {student.cgpa || 'N/A'}</span>
                            </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaClock style={{ color: '#6366f1', fontSize: '0.8rem' }} />
                                <span>Grad: {student.graduationYear ? highlightText(student.graduationYear, studentSearchTerm) : 'N/A'}</span>
                          </div>
                        </div>
                              
                                  {student.skills && student.skills.length > 0 && (
                          <div style={{ marginTop: '6px' }}>
                                      <div style={{ 
                                  fontSize: '0.75rem', 
                                        color: '#6b7280',
                                  marginBottom: '2px'
                                      }}>
                                        Skills:
                                      </div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {student.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  style={{
                                        background: '#f3f4f6',
                                        padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                        color: '#4b5563',
                                              fontWeight: 500
                                  }}
                                >
                                      {highlightText(skill, studentSearchTerm)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                                        ))}
            </div>
          </div>

                  {/* Modal Footer */}
            <div style={{ 
                    padding: '12px 16px',
                    borderTop: '1px solid #e5e7eb',
                display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: '12px'
              }}>
                <button
                  onClick={() => {
                        setShowStudentModal(false);
                    setSelectedStudents([]);
                        setSelectedJob(null);
                  }}
                          style={{
                            padding: '6px 12px',
                    borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            color: '#4b5563',
                            cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500
                          }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          Cancel
                        </button>
                        <button
                      onClick={handleSubmitApplications}
                  disabled={selectedStudents.length === 0}
                          style={{
                            padding: '6px 12px',
                    borderRadius: '6px',
                            border: 'none',
                        background: selectedStudents.length === 0 ? '#e5e7eb' : '#059669',
                        color: selectedStudents.length === 0 ? '#9ca3af' : '#fff',
                    cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500
                  }}
                  onMouseOver={e => {
                    if (selectedStudents.length > 0) {
                          e.currentTarget.style.background = '#047857';
                    }
                  }}
                  onMouseOut={e => {
                    if (selectedStudents.length > 0) {
                          e.currentTarget.style.background = '#059669';
                    }
                  }}
                >
                      Apply for {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
                      </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Settings Modal */}
    <CollegeSettingsModal
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      college={college}
      onUpdate={handleCollegeUpdate}
    />
    </div>
  </>
  );
};

export default ViewJobs; 