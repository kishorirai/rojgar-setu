import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import { 
  FaUserGraduate, 
  FaEnvelope, 
  FaIdCard, 
  FaGraduationCap, 
  FaStar, 
  FaCode, 
  FaTrophy, 
  FaBriefcase, 
  FaCalendarAlt,
  FaChevronRight,
  FaTicketAlt,
  FaChartLine,
  FaBuilding,
  FaLaptopCode,
  FaFlask,
  FaMedal,
  FaClock,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import calculateCampusScore from '../utils/calculateCampusScore';
const apiUrl = import.meta.env.VITE_API_URL;

const CollegeProfile = () => {
  const { studentId, collegeId } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [student, setStudent] = useState(null);
  const [college, setCollege] = useState(null);
  const [internships, setInternships] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const scrollContainersRef = useRef({});

  const ScrollableContainer = ({ children, containerId }) => (
    <div 
      ref={el => scrollContainersRef.current[containerId] = el}
      style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        paddingRight: '0.5rem',
        scrollBehavior: 'auto'
      }}
    >
      {children}
    </div>
  );

  const handleInputChange = (e, section, index = null) => {
    const { name, value } = e.target;
    
    if (index !== null) {
      setEditForm(prevForm => {
        const newArray = [...prevForm];
        if (typeof newArray[index] === 'object') {
          newArray[index] = { 
            ...newArray[index], 
            [name]: value
          };
        } else {
          newArray[index] = value;
        }
        return newArray;
      });
    } else {
      setEditForm(prevForm => ({
        ...prevForm,
        [name]: value
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state

        // First fetch student data
        const studentUrl = `${apiUrl}/api/colleges/${collegeId}/student/${studentId}`;
        const studentResponse = await axios.get(studentUrl);
        setStudent(studentResponse.data);

        // Then fetch college data
        const collegeUrl = `${apiUrl}/api/colleges/${collegeId}`;
        const collegeResponse = await axios.get(collegeUrl);
        setCollege(collegeResponse.data);
        
        // Only fetch internships, jobs, and interviews if we have student data
        if (studentResponse.data) {
          try {
            // Fetch internships
            const internshipsResponse = await axios.get(`${apiUrl}/api/internships/student/${studentId}`);
            setInternships(internshipsResponse.data || []);
          } catch (err) {
            console.error('Error fetching internships:', err);
            setInternships([]); // Set empty array on error
          }

          try {
            // Fetch jobs
            const jobsResponse = await axios.get(`${apiUrl}/api/jobs/student/${studentId}`);
            setJobs(jobsResponse.data || []);
          } catch (err) {
            console.error('Error fetching jobs:', err);
            setJobs([]); // Set empty array on error
          }

          try {
            // Fetch interviews
            const interviewsResponse = await axios.get(`${apiUrl}/api/interviews/student/${studentId}`);
            setInterviews(interviewsResponse.data || []);
          } catch (err) {
            console.error('Error fetching interviews:', err);
            setInterviews([]); // Set empty array on error
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, collegeId]);

  const navItems = [
    { label: 'Dashboard', href: `/college/${college?._id}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${college?._id}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${college?._id}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${college?._id}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${college?._id}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${college?._id}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: college?.name || 'College Admin',
    role: 'Administrator',
    initials: college?.name ? college.name.substring(0, 2).toUpperCase() : 'CA'
  };

  const handleEditClick = (section, data) => {
    // Prevent default behavior
    if (section === 'nameCard') {
      setEditForm({
        name: student.name || '',
        rollNumber: student.rollNumber || '',
        department: student.department || '',
        cgpa: student.cgpa || '',
        campusScore: student.campusScore || ''
      });
    } else if (section === 'basicInfo') {
      setEditForm({
        email: student.email || '',
        rollNumber: student.rollNumber || '',
        department: student.department || '',
        cgpa: student.cgpa || '',
        batch: student.batch || '',
        joiningYear: student.joiningYear || '',
        graduationYear: student.graduationYear || ''
      });
      } else {
      // For array sections, make sure we have proper defaults
      const sectionData = student[section] || [];
      setEditForm(Array.isArray(sectionData) ? [...sectionData] : []);
    }
    setEditingSection(section);
  };

  const handleCancelEdit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingSection(null);
    setEditForm({});
  };

  const handleSaveEdit = async (section, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const updated = { ...student };
      
      if (section === 'nameCard') {
        updated.name = editForm.name;
        updated.rollNumber = editForm.rollNumber;
        updated.department = editForm.department;
        updated.cgpa = editForm.cgpa;
        updated.campusScore = editForm.campusScore;
      } else if (section === 'basicInfo') {
        updated.email = editForm.email;
        updated.rollNumber = editForm.rollNumber;
        updated.department = editForm.department;
        updated.cgpa = editForm.cgpa;
        updated.batch = editForm.batch;
        updated.joiningYear = editForm.joiningYear;
        updated.graduationYear = editForm.graduationYear;
      } else {
        // For array-based sections (skills, extracurricular, internships, etc.)
        updated[section] = editForm;
      }

      // Update the backend
      await axios.put(`${apiUrl}/api/colleges/${collegeId}/student/${studentId}`, updated);
      
      // Update the local state
      setStudent(updated);
      setEditingSection(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Error updating student data');
    }
  };

  const handleAddSkill = () => {
    setEditForm([...editForm, '']);
  };

  const handleRemoveSkill = (index) => {
    const newSkills = [...editForm];
    newSkills.splice(index, 1);
    setEditForm(newSkills);
  };

  const handleAddActivity = () => {
    setEditForm([...editForm, { activity: '', role: '', achievement: '' }]);
  };

  const handleAddResearch = () => {
    setEditForm([...editForm, { title: '', role: '', description: '', year: '' }]);
  };

  const handleAddHackathon = () => {
    setEditForm([...editForm, { name: '', year: '', achievement: '', description: '' }]);
  };

  const EditButton = ({ onClick }) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
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
      <FaEdit size={16} />
    </button>
  );

  const SaveCancelButtons = ({ onSave, onCancel }) => (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave(e);
        }}
                              style={{
                                background: '#059669',
                                color: '#fff',
                                border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500
        }}
        onMouseOver={e => e.currentTarget.style.background = '#047857'}
        onMouseOut={e => e.currentTarget.style.background = '#059669'}
                            >
                              Save
                            </button>
                            <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCancel(e);
        }}
                              style={{
          background: '#f3f4f6',
          color: '#4b5563',
                                border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500
        }}
        onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
        onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                            >
                              Cancel
                            </button>
                          </div>
  );

  const InfoCard = ({ title, icon, children, style, section, hideEdit }) => (
    <div className="info-card" style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
                    position: 'relative',
      ...style
    }}>
      <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        color: '#4338ca',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <span style={{ marginLeft: '0.5rem' }}>{title}</span>
                        </div>
        {!hideEdit && (
        <div className="edit-button" style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem'
        }}>
          {editingSection === section ? (
            <SaveCancelButtons onSave={(e) => handleSaveEdit(section, e)} onCancel={handleCancelEdit} />
          ) : (
            <EditButton onClick={() => handleEditClick(section, student[section])} />
                    )}
                  </div>
        )}
                </div>
      {children}
                  </div>
  );

  const InfoItem = ({ icon, label, value, name, section, index = null }) => {
    const isEditing = editingSection === section;
    const inputId = `${section}-${name}-${index !== null ? index : 'single'}`;

    return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
        marginBottom: '0.75rem',
        color: '#4b5563'
      }}>
        {icon}
        <span style={{ marginLeft: '0.5rem', fontWeight: 500 }}>{label}:</span>
                      {isEditing ? (
                        <input
            id={inputId}
            type="text"
            name={name}
            defaultValue={index !== null ? (editForm[index]?.[name] || '') : (editForm[name] || '')}
            onBlur={(e) => handleInputChange(e, section, index)}
            style={{
              marginLeft: '0.5rem',
              padding: '0.25rem 0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              width: '200px',
              background: '#fff',
              transition: 'all 0.2s ease'
            }}
                        />
                      ) : (
          <span style={{ marginLeft: '0.5rem', color: '#1f2937' }}>{value}</span>
                      )}
                    </div>
    );
  };

  const Tag = ({ text, index, section }) => {
    const isEditing = editingSection === section;
    const inputId = `${section}-skill-${index}`;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
              id={inputId}
              type="text"
              defaultValue={editForm[index] || ''}
              onBlur={(e) => {
                const newSkills = [...editForm];
                newSkills[index] = e.target.value;
                setEditForm(newSkills);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                width: '120px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
                        />
                        <button
              onClick={() => handleRemoveSkill(index)}
                          style={{
                background: 'none',
                            border: 'none',
                color: '#ef4444',
                            cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <FaTimes />
                        </button>
                      </div>
        ) : (
          <span style={{
            background: '#f3f4f6',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            color: '#4b5563',
            marginRight: '0.5rem',
            marginBottom: '0.5rem',
            display: 'inline-block'
          }}>
            {text}
          </span>
        )}
                </div>
    );
  };

  const ActivityItem = ({ activity, index, section }) => {
    const isEditing = editingSection === section;
    return (
      <div style={{ 
        marginBottom: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        border: isEditing ? '1px solid #4338ca' : 'none',
        minHeight: isEditing ? 'auto' : '100px'
      }}>
                      {isEditing ? (
          <>
            <input
              type="text"
              name="activity"
              defaultValue={editForm[index].activity}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Activity"
                          style={{
                            width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
            />
            <input
              type="text"
              name="role"
              defaultValue={editForm[index].role}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Role"
                      style={{
                        width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
            />
            <input
              type="text"
              name="achievement"
              defaultValue={editForm[index].achievement}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Achievement"
                            style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
            />
            <button
              onClick={() => {
                const newActivities = [...editForm];
                newActivities.splice(index, 1);
                setEditForm(newActivities);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <FaTimes />
            </button>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 500, color: '#1f2937', marginBottom: '0.5rem' }}>{activity.activity}</div>
            <div style={{ color: '#4b5563', marginBottom: '0.25rem' }}>Role: {activity.role}</div>
            <div style={{ color: '#4b5563' }}>Achievement: {activity.achievement}</div>
          </>
        )}
      </div>
    );
  };

  const ResearchItem = ({ research, index, section }) => {
    const isEditing = editingSection === section;
    return (
                    <div style={{ 
        marginBottom: '1rem',
                      padding: '1rem', 
        background: '#f9fafb',
                      borderRadius: '8px',
        transition: 'all 0.2s ease',
        border: isEditing ? '1px solid #4338ca' : 'none'
                    }}>
        {isEditing ? (
          <>
                        <input
              type="text"
                          name="title"
              defaultValue={editForm[index].title}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Research Title"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
                        />
                        <input
              type="text"
                          name="role"
              defaultValue={editForm[index].role}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Role"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
                        />
                        <textarea
                          name="description"
              defaultValue={editForm[index].description}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Description"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="text"
              name="year"
              defaultValue={editForm[index].year}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Year"
                          style={{
                width: '100px',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
            />
              <button
                onClick={() => {
                  const newResearch = [...editForm];
                  newResearch.splice(index, 1);
                  setEditForm(newResearch);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaTimes />
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
              {research.title}
                      </div>
            <div style={{ color: '#4b5563', marginBottom: '0.5rem' }}>Role: {research.role}</div>
            <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>{research.description}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Year: {research.year}
                    </div>
          </>
                  )}
                </div>
    );
  };

  const HackathonItem = ({ hackathon, index, section }) => {
    const isEditing = editingSection === section;
    return (
                    <div style={{ 
        marginBottom: '1rem',
                      padding: '1rem', 
        background: '#f9fafb',
                      borderRadius: '8px',
        transition: 'all 0.2s ease',
        border: isEditing ? '1px solid #4338ca' : 'none'
                    }}>
        {isEditing ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <input
                type="text"
                name="name"
                defaultValue={editForm[index].name}
                onBlur={(e) => handleInputChange(e, section, index)}
                placeholder="Hackathon Name"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: '#fff',
                  transition: 'all 0.2s ease'
                }}
                        />
                        <input
                type="text"
                          name="year"
                defaultValue={editForm[index].year}
                onBlur={(e) => handleInputChange(e, section, index)}
                          placeholder="Year"
                style={{
                  width: '100px',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: '#fff',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
            <input
              type="text"
              name="achievement"
              defaultValue={editForm[index].achievement}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Achievement"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
                        />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <textarea
                          name="description"
              defaultValue={editForm[index].description}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Description"
                          style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
              <button
                onClick={() => {
                  const newHackathons = [...editForm];
                  newHackathons.splice(index, 1);
                  setEditForm(newHackathons);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  marginLeft: '0.5rem'
                }}
              >
                <FaTimes />
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: '#1f2937' }}>{hackathon.name}</div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{hackathon.year}</div>
                      </div>
            <div style={{ color: '#059669', fontWeight: 500, marginBottom: '0.5rem' }}>
              {hackathon.achievement}
                    </div>
            <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>{hackathon.description}</div>
          </>
                  )}
                </div>
    );
  };

  const InternshipItem = ({ internship, index, section }) => {
    const isEditing = editingSection === section;
    return (
                    <div style={{ 
        marginBottom: '1rem',
                      padding: '1rem', 
        background: '#f9fafb',
                      borderRadius: '8px',
        border: isEditing ? '1px solid #4338ca' : '1px solid #e5e7eb',
        transition: 'all 0.2s ease'
                    }}>
        {isEditing ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                        <input
                type="text"
                name="company"
                defaultValue={editForm[index].company}
                onBlur={(e) => handleInputChange(e, section, index)}
                placeholder="Company"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: '#fff',
                  transition: 'all 0.2s ease'
                }}
                        />
                        <input
                type="text"
                          name="year"
                defaultValue={editForm[index].year}
                onBlur={(e) => handleInputChange(e, section, index)}
                          placeholder="Year"
                style={{
                  width: '100px',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: '#fff',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
                        <input
              type="text"
              name="role"
              defaultValue={editForm[index].role}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Role"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
                        />
                        <textarea
              name="comment"
              defaultValue={editForm[index].comment}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Feedback"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                minHeight: '80px',
                background: '#fff',
                transition: 'all 0.2s ease',
                resize: 'vertical'
              }}
            />
            <input
              type="number"
              name="internshipScore"
              defaultValue={editForm[index].internshipScore}
              onBlur={(e) => handleInputChange(e, section, index)}
              placeholder="Score"
                          style={{
                width: '100px',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff',
                transition: 'all 0.2s ease'
              }}
            />
          </>
        ) : (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.75rem',
              alignItems: 'center'
            }}>
              <div style={{ 
                fontWeight: 700, 
                color: '#1f2937',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaBuilding style={{ color: '#4338ca' }} />
                {internship.company}
              </div>
              <div style={{ 
                color: '#4338ca', 
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#eef2ff',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {internship.year}
              </div>
            </div>
            <div style={{ 
              color: '#4b5563', 
              marginBottom: '0.75rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaBriefcase style={{ color: '#4338ca' }} />
              <span style={{ fontWeight: 500 }}>Role:</span>
              <span style={{ color: '#1f2937' }}>{internship.role}</span>
            </div>
            {internship.comment && (
              <div style={{ 
                color: '#4b5563', 
                fontSize: '0.875rem',
                fontStyle: 'italic',
                padding: '0.75rem',
                background: '#fff',
                            borderRadius: '6px',
                borderLeft: '4px solid #4338ca',
                marginTop: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  background: '#fff',
                  padding: '0 8px',
                  color: '#4338ca',
                  fontSize: '0.75rem',
                            fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  FEEDBACK
                      </div>
                "{internship.comment}"
                    </div>
                  )}
            {internship.internshipScore && (
              <div style={{ 
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaStar style={{ color: '#f59e0b' }} />
                <span style={{ 
                  color: '#059669',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  background: '#ecfdf5',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px'
                }}>
                  Score: {internship.internshipScore}
                </span>
                </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderInternships = () => {
    if (loading) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          Loading internships...
        </div>
      );
    }

    if (!internships || internships.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px dashed #e5e7eb'
        }}>
          No internships found
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {internships.map((internship) => (
          <div key={internship._id} style={{ 
            background: '#fff',
            borderRadius: '8px',
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4338ca',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}>
                  <FaBuilding />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>
                    {internship.title}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: '#4b5563',
                    fontSize: '0.75rem'
                  }}>
                    <span>{internship.companyId?.name || 'Company'}</span>
                    <span style={{ color: '#9ca3af' }}>•</span>
                    <span style={{ textTransform: 'capitalize' }}>{internship.mode}</span>
                  </div>
                </div>
              </div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: internship.status === 'completed' ? '#ecfdf5' : 
                          internship.status === 'accepted' ? '#eef2ff' :
                          internship.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                color: internship.status === 'completed' ? '#059669' :
                       internship.status === 'accepted' ? '#4338ca' :
                       internship.status === 'rejected' ? '#dc2626' : '#6b7280'
              }}>
                {internship.status}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.5rem',
              background: '#f9fafb',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#4b5563'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaCalendarAlt style={{ color: '#4338ca', fontSize: '0.75rem' }} />
                <span>{new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}</span>
              </div>
              {internship.feedback && (
                <>
                  <span style={{ color: '#9ca3af' }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FaStar style={{ color: '#f59e0b', fontSize: '0.75rem' }} />
                    <span>Overall: {internship.feedback.overallScore}</span>
                  </div>
                </>
              )}
            </div>

            {internship.feedback?.comments && (
              <div style={{ 
                fontSize: '0.75rem',
                color: '#4b5563',
                fontStyle: 'italic',
                padding: '0.5rem',
                background: '#fff',
                borderRadius: '4px',
                borderLeft: '2px solid #4338ca'
              }}>
                "{internship.feedback.comments}"
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderJobs = () => {
    if (loading) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          Loading jobs...
        </div>
      );
    }

    if (!jobs || jobs.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px dashed #e5e7eb'
        }}>
          No jobs found
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {jobs.map((job) => (
          <div key={job._id} style={{ 
            background: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4338ca',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  <FaBuilding />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginBottom: '0.25rem'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {job.title}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      background: job.status === 'completed' ? '#ecfdf5' : 
                                job.status === 'accepted' ? '#eef2ff' :
                                job.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                      color: job.status === 'completed' ? '#059669' :
                             job.status === 'accepted' ? '#4338ca' :
                             job.status === 'rejected' ? '#dc2626' : '#6b7280'
                    }}>
                      {job.status}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    color: '#4b5563',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      fontWeight: 500
                    }}>
                      <FaBuilding style={{ color: '#4338ca', fontSize: '0.875rem' }} />
                      {job.companyId?.name || 'Company'}
                    </span>
                    <span style={{ color: '#9ca3af' }}>•</span>
                    <span style={{ 
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <FaClock style={{ color: '#4338ca', fontSize: '0.875rem' }} />
                      {job.mode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#4b5563',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: 500
              }}>
                <FaCalendarAlt style={{ color: '#4338ca', fontSize: '0.875rem' }} />
                <span>
                  {new Date(job.startDate).toLocaleDateString()} - {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                </span>
              </div>
              {job.feedback && (
                <>
                  <span style={{ color: '#9ca3af' }}>•</span>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <FaStar style={{ color: '#f59e0b', fontSize: '0.875rem' }} />
                    <span style={{ fontWeight: 500 }}>Overall: {job.feedback.overallScore}</span>
                  </div>
                </>
              )}
            </div>

            {job.feedback?.comments && (
              <div style={{ 
                fontSize: '0.875rem',
                color: '#4b5563',
                fontStyle: 'italic',
                padding: '0.75rem',
                background: '#fff',
                borderRadius: '8px',
                borderLeft: '3px solid #4338ca',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                "{job.feedback.comments}"
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInterviews = () => {
    if (loading) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          Loading interviews...
        </div>
      );
    }

    if (!interviews || interviews.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px dashed #e5e7eb'
        }}>
          No interviews scheduled
        </div>
      );
    }

    return (
      <div className="interviews-list">
        {interviews.map((interview) => (
          <div key={interview._id} className="interview-card">
            <div className="interview-header">
              <h3>{interview.role}</h3>
              <span className={`status ${interview.status}`}>{interview.status}</span>
            </div>
            <div className="interview-details">
              <p><FaBuilding /> {interview.companyId?.name || 'Company'}</p>
              <p><FaCalendarAlt /> {new Date(interview.date).toLocaleString()}</p>
              {interview.link && (
                <p><a href={interview.link} target="_blank" rel="noopener noreferrer">Join Interview</a></p>
              )}
            </div>
            {interview.feedback && (
              <div className="feedback">
                <h4>Feedback</h4>
                <div className="scores">
                  <div>Technical: {interview.feedback.technicalScore || 'N/A'}</div>
                  <div>Communication: {interview.feedback.communicationScore || 'N/A'}</div>
                  <div>Problem Solving: {interview.feedback.problemSolvingScore || 'N/A'}</div>
                  <div>Overall: {interview.feedback.overallScore || 'N/A'}</div>
                </div>
                {interview.feedback.comments && (
                  <p className="comments">{interview.feedback.comments}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const cardHoverStyle = `
    .info-card {
      transition: all 0.2s ease;
      position: relative;
    }
    .info-card:hover {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .info-card:hover::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 12px;
      box-shadow: inset 0 0 8px rgba(67, 56, 202, 0.1);
      pointer-events: none;
    }
    .info-card:hover .edit-button {
      opacity: 1;
      transform: translateY(0);
    }
    .edit-button {
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.2s ease;
    }
    .edit-button-inner:hover {
      color: #312e81;
      transform: scale(1.05);
    }
    .name-edit-button {
      opacity: 1;
      transition: all 0.2s ease;
    }
    .info-card:hover .name-edit-button {
      opacity: 1;
    }
  `;

  if (loading) {
                        return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <style>{cardHoverStyle}</style>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
        <div className='main-container' style={{ marginLeft: 260, padding: '2rem' }}>
          <SearchBar />
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading student profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <style>{cardHoverStyle}</style>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
        <div className='main-container' style={{ marginLeft: 260, padding: '2rem' }}>
          <SearchBar />
                          <div style={{ 
                            textAlign: 'center',
            padding: '2rem',
            background: '#fee2e2',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        </div>
                          </div>
                        );
                      }

  if (!student) {
                          return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <style>{cardHoverStyle}</style>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
        <div className='main-container' style={{ marginLeft: 260, padding: '2rem' }}>
          <SearchBar />
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: '#fee2e2',
                              borderRadius: '8px',
            color: '#dc2626'
          }}>
            No student data found. Please check if the student ID is correct.
                                  </div>
                                </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{cardHoverStyle}</style>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
      <div className='main-container' style={{ 
        marginLeft: 260, 
        padding: '1rem',
        width: 'calc(100% - 260px)',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <SearchBar />
        
        {/* Header Section */}
        <div className="info-card" style={{ 
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  display: 'flex', 
                                  alignItems: 'center', 
          gap: '1.5rem',
          width: '100%',
          position: 'relative'
        }}>
                                    <div style={{ 
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#f3f4f6',
                                      display: 'flex',
                                      alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#4338ca',
            fontWeight: 600,
                                      flexShrink: 0
                                    }}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            {editingSection === 'nameCard' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editForm.name}
                    onBlur={(e) => handleInputChange(e, 'nameCard')}
                    placeholder="Full Name"
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#1f2937',
                      width: '300px',
                      background: '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <SaveCancelButtons onSave={(e) => handleSaveEdit('nameCard', e)} onCancel={handleCancelEdit} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    name="rollNumber"
                    defaultValue={editForm.rollNumber}
                    onBlur={(e) => handleInputChange(e, 'nameCard')}
                    placeholder="Roll Number"
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      background: '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <input
                    type="text"
                    name="department"
                    defaultValue={editForm.department}
                    onBlur={(e) => handleInputChange(e, 'nameCard')}
                    placeholder="Department"
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      background: '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <input
                    type="text"
                    name="cgpa"
                    defaultValue={editForm.cgpa}
                    onBlur={(e) => handleInputChange(e, 'nameCard')}
                    placeholder="CGPA"
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      background: '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                                          display: 'flex',
                                          alignItems: 'center',
                  gap: '1rem'
                }}>
                  {student.name}
                  <div className="name-edit-button" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: 1
                  }}>
                    {editingSection === 'nameCard' ? (
                      <SaveCancelButtons onSave={(e) => handleSaveEdit('nameCard', e)} onCancel={handleCancelEdit} />
                    ) : (
                      <EditButton onClick={() => handleEditClick('nameCard', student)} />
                    )}
                                          </div>
                </h1>
                                          <div style={{
                  display: 'flex', 
                  gap: '1.5rem',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaIdCard />
                    <span>{student.rollNumber}</span>
                                          </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaGraduationCap />
                    <span>{student.department}</span>
                                        </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaStar />
                    <span>CGPA: {student.cgpa}</span>
                                    </div>
                </div>
              </>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}>
            {editingSection === 'nameCard' ? (
              <input
                type="number"
                name="campusScore"
                defaultValue={editForm.campusScore}
                onBlur={(e) => handleInputChange(e, 'nameCard')}
                placeholder="Campus Score"
                style={{
                                    width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: '#4338ca',
                  color: '#fff',
                  fontSize: '2rem',
                  fontWeight: 700,
                                    textAlign: 'center',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(67, 56, 202, 0.2)',
                  transition: 'all 0.2s ease'
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#4338ca',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 6px rgba(67, 56, 202, 0.2)'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {calculateCampusScore(student)}
                                  </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Campus Score</span>
                                </div>
            )}
                              </div>
          <div className="edit-button" style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            display: 'none'
          }}>
            {editingSection === 'nameCard' ? (
              <SaveCancelButtons onSave={(e) => handleSaveEdit('nameCard', e)} onCancel={handleCancelEdit} />
            ) : (
              <EditButton onClick={() => handleEditClick('nameCard', student)} />
            )}
                                </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '1rem',
          width: '100%'
        }}>
          {/* Basic Information */}
          <InfoCard title="Basic Information" icon={<FaUserGraduate />} section="basicInfo">
            <InfoItem 
              icon={<FaEnvelope />} 
              label="Email" 
              value={student.email} 
              name="email"
              section="basicInfo"
            />
            <InfoItem 
              icon={<FaIdCard />} 
              label="Roll Number" 
              value={student.rollNumber} 
              name="rollNumber"
              section="basicInfo"
            />
            <InfoItem 
              icon={<FaGraduationCap />} 
              label="Department" 
              value={student.department} 
              name="department"
              section="basicInfo"
            />
            <InfoItem 
              icon={<FaStar />} 
              label="CGPA" 
              value={student.cgpa} 
              name="cgpa"
              section="basicInfo"
            />
            <InfoItem 
              icon={<FaCalendarAlt />} 
              label="Batch" 
              value={student.batch} 
              name="batch"
              section="basicInfo"
            />
            <InfoItem 
              icon={<FaCalendarAlt />} 
              label="Joining Year" 
              value={student.joiningYear || 'N/A'} 
              name="joiningYear"
              section="basicInfo"
            />
            <InfoItem 
              icon={<FaCalendarAlt />} 
              label="Graduation Year" 
              value={student.graduationYear || 'N/A'} 
              name="graduationYear"
              section="basicInfo"
            />
          </InfoCard>

          {/* Skills */}
          <InfoCard title="Skills" icon={<FaCode />} section="skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {editingSection === 'skills' ? (
                <>
                  {editForm.map((skill, index) => (
                    <Tag 
                      key={`skill-${index}`}
                      text={skill} 
                      index={index}
                      section="skills"
                    />
                  ))}
                  <button
                    onClick={handleAddSkill}
                    style={{
                      background: '#f3f4f6',
                      border: '1px dashed #d1d5db',
                      borderRadius: '9999px',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.875rem',
                      color: '#4338ca',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginBottom: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>+</span>
                    <span>Add Skill</span>
                  </button>
                </>
              ) : (
                student.skills?.map((skill, index) => (
                  <Tag 
                    key={`skill-${index}`}
                    text={skill} 
                    index={index}
                    section="skills"
                  />
                ))
                              )}
                            </div>
          </InfoCard>

          {/* Extracurricular Activities */}
          <InfoCard title="Extracurricular Activities" icon={<FaTrophy />} section="extracurricular">
            <ScrollableContainer containerId="extracurricular-main">
              {editingSection === 'extracurricular' ? (
                <>
                  {editForm.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} index={index} section="extracurricular" />
                  ))}
                  <button
                    onClick={handleAddActivity}
                    style={{
                      background: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaPlus /> Add Activity
                  </button>
                </>
              ) : (
                student.extracurricular?.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} index={index} section="extracurricular" />
                ))
              )}
            </ScrollableContainer>
          </InfoCard>

          {/* Internships */}
          <InfoCard title="Internships" icon={<FaBriefcase />} section="internships" hideEdit={true}>
            {renderInternships()}
          </InfoCard>

          {/* Research Work */}
          <InfoCard title="Research Work" icon={<FaFlask />} section="research">
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {editingSection === 'research' ? (
                <>
                  {editForm.map((research, index) => (
              <ResearchItem 
                key={index} 
                research={research} 
                index={index}
                section="research"
              />
            ))}
                  <button
                    onClick={handleAddResearch}
                    style={{
                      background: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaPlus /> Add Research
                  </button>
                </>
              ) : (
                student.research?.map((research, index) => (
                  <ResearchItem 
                    key={index} 
                    research={research} 
                    index={index}
                    section="research"
                  />
                ))
              )}
            </div>
          </InfoCard>

          {/* Hackathons */}
          <InfoCard title="Hackathons" icon={<FaLaptopCode />} section="hackathons">
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {editingSection === 'hackathons' ? (
                <>
                  {editForm.map((hackathon, index) => (
              <HackathonItem 
                key={index} 
                hackathon={hackathon} 
                index={index}
                section="hackathons"
              />
            ))}
                  <button
                    onClick={handleAddHackathon}
                    style={{
                      background: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaPlus /> Add Hackathon
                  </button>
                </>
              ) : (
                student.hackathons?.map((hackathon, index) => (
                  <HackathonItem 
                    key={index} 
                    hackathon={hackathon} 
                    index={index}
                    section="hackathons"
                  />
                ))
              )}
                    </div>
          </InfoCard>

          {/* Interviews */}
          <InfoCard title="Interviews" icon={<FaCalendarAlt />} section="interviews" hideEdit={true} style={{ gridColumn: '1 / -1' }}>
            {renderInterviews()}
          </InfoCard>

          {/* Jobs */}
          <InfoCard title="Jobs" icon={<FaBriefcase />} section="jobs" hideEdit={true} style={{ gridColumn: '1 / -1' }}>
            {renderJobs()}
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default CollegeProfile; 