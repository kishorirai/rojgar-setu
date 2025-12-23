import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { FaChevronRight , FaTicketAlt , FaChartLine, FaUserGraduate } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true;
import { CSSTransition } from 'react-transition-group';
import './ScheduledInterviews.css';
import SearchBar from '../SearchBar';
import { formatDistanceToNow } from 'date-fns';
import MatchingStudents from './MatchingStudents';
import CompanySettingsModal from './CompanySettingsModal';
import Loader from '../components/Loader';
const apiUrl = import.meta.env.VITE_API_URL;
const PostJobForm = () => {
  const { companyId } = useParams();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editedRole, setEditedRole] = useState(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRole, setNewRole] = useState({
    jobTitle: '',
    description: '',
    location: '',
    duration: '',
    stipend: '',
    numberOfStudents: '',
    skills: '',
    requirements: '',
    applied: 0,
    status: 'active',
    jobType: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [editValidationErrors, setEditValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingRoleId, setDeletingRoleId] = useState(null);
  const [company, setCompany] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      axios.get(`${apiUrl}/api/company/${companyId}`)
        .then(res => {
          setCompany(res.data);
        })
        .catch(err => {
          console.error('Error fetching company:', err);
          setError('Error loading company information');
        });
    }
  }, []);

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

  useEffect(() => {
    axios.get(`${apiUrl}/api/company/${localStorage.getItem('companyId')}/roles`)
      .then(res => {
        const sortedRoles = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRoles(sortedRoles);
        setLoading(false);
      })
      .catch(err => {
        setError('Error fetching roles');
        setLoading(false);
      });
  }, []);

  const handleEdit = (role) => {
    setEditingRoleId(role._id);
    setEditedRole({
      ...role,
      requirements: Array.isArray(role.requirements) ? role.requirements.join('\n') : (role.requirements || ''),
      jobType: role.jobType || ''
    });
  };

  const handleSave = async (roleId) => {
    // Validate all fields in editedRole
    const errors = {};
    Object.keys(editedRole).forEach(key => {
      if (key !== 'applied') {
        const error = validateField(key, editedRole[key]);
        if (error) errors[key] = error;
      }
    });
    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }
    try {
      // Convert requirements back to array before saving
      const roleToSave = {
        ...editedRole,
        requirements: editedRole.requirements.split('\n').map(r => r.trim()).filter(r => r !== ''),
        jobType: editedRole.jobType || ''
      };
      await axios.put(`${apiUrl}/api/roles/${roleId}`, roleToSave);
      setRoles(roles.map(role => role._id === roleId ? { ...roleToSave, _id: roleId } : role));
      setEditingRoleId(null);
      setEditedRole(null);
      setEditValidationErrors({});
      setSuccessMessage('Role updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error updating role');
    }
  };

  const handleCancel = () => {
    setEditingRoleId(null);
    setEditedRole(null);
  };

  const handleDelete = async (roleId) => {
    try {
      console.log('Attempting to delete role:', roleId);
      const response = await axios.delete(`${apiUrl}/api/roles/${roleId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log('Delete response:', response.data);
        setRoles(roles.filter(role => role._id !== roleId));
        setDeletingRoleId(null);
        setSuccessMessage('Role deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to delete role');
      }
    } catch (err) {
      console.error('Error deleting role:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setError(err.response?.data?.error || 'Error deleting role');
      setDeletingRoleId(null);
    }
  };

  const handleInputChange = (e, field) => {
    setEditedRole({ ...editedRole, [field]: e.target.value });
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'jobTitle':
        return !value ? 'Job title is required' : '';
      case 'description':
        return !value ? 'Description is required' : value.length < 20 ? 'Description must be at least 20 characters' : '';
      case 'location':
        return !value ? 'Location is required' : '';
      case 'duration':
        return !value ? 'Duration is required' : '';
      case 'stipend':
        return !value ? 'Stipend is required' : 
               isNaN(value) ? 'Stipend must be a number' :
               Number(value) < 0 ? 'Stipend cannot be negative' : '';
      case 'numberOfStudents':
        return !value ? 'Number of openings is required' :
               isNaN(value) ? 'Number of openings must be a number' :
               Number(value) < 1 ? 'Number of openings must be at least 1' : '';
      case 'skills':
        return !value ? 'At least one skill is required' : '';
      case 'requirements':
        return !value ? 'At least one requirement is required' : '';
      case 'jobType':
        return !value ? 'Job type is required' : '';
      default:
        return '';
    }
  };

  const handleNewRoleInputChange = (e, field) => {
    const value = e.target.value;
    setNewRole({ ...newRole, [field]: value });
    // Clear error when user starts typing
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmitNewRole = async () => {
    // Validate all fields
    const errors = {};
    Object.keys(newRole).forEach(key => {
      if (key !== 'applied') {
        const error = validateField(key, newRole[key]);
        if (error) errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Convert string values to appropriate types and process skills/requirements
      const roleToSubmit = {
        ...newRole,
        stipend: Number(newRole.stipend),
        numberOfStudents: Number(newRole.numberOfStudents),
        applied: 0,
        skills: newRole.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
        requirements: newRole.requirements.split('\n').map(req => req.trim()).filter(req => req !== ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: newRole.status,
        jobType: newRole.jobType || ''
      };
      
      const response = await axios.post(`${apiUrl}/api/company/${companyId}/roles`, roleToSubmit);
      
      if (response.data) {
        setRoles([response.data, ...roles]);
        setShowNewRoleForm(false);
        setNewRole({
          jobTitle: '',
          description: '',
          location: '',
          duration: '',
          stipend: '',
          numberOfStudents: '',
          skills: '',
          requirements: '',
          applied: 0,
          status: 'active',
          jobType: ''
        });
        setValidationErrors({});
        setError(null);
        setSuccessMessage('Role posted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating role:', err);
      setError(err.response?.data?.message || 'Error creating new role. Please try again.');
    }
  };
  
  // Helper to determine if a field is valid (after error)
  const isFieldValid = (field) => newRole[field] && !validationErrors[field];
  
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
        .new-role-form {
          opacity: 0;
          transform: translateY(-20px);
          max-height: 0;
          margin: 0;
          padding: 0;
          overflow: hidden;
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid #6366f1;
          border-radius: 18px;
          background: #fff;
          position: relative;
        }
        .new-role-form.show {
          opacity: 1;
          transform: translateY(0);
          max-height: 1000px;
          margin: 0;
          padding: 1.3rem 1.5rem 1.1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .roles-list {
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .roles-list.shifted {
          transform: translateY(20px);
        }
        .success-toast {
          position: fixed;
          left: 50%;
          top: 32px;
          transform: translateX(-50%);
          background: rgba(5, 150, 105, 0.85);
          color: #fff;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          box-shadow: 0 2px 12px #05966933;
          z-index: 9999;
          transition: opacity 0.3s;
          text-align: center;
          margin-top: 0;
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
        <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
          {successMessage && (
            <div className="success-toast">{successMessage}</div>
          )}
            <div style={{ padding: '0 24px' }}>
              <SearchBar onSettingsClick={() => setShowSettings(true)} />
            </div>
          
          <div className="post-job-container" style={{ width: '100%', padding: 0, margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 24px' }}>
              <h2>Demand Roles for {localStorage.getItem('companyName') || 'Your Company'}</h2>
              <button
                onClick={() => showNewRoleForm ? setShowNewRoleForm(false) : setShowNewRoleForm(true)}
                style={{
                  background: showNewRoleForm ? '#dc2626' : '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: showNewRoleForm ? '0 2px 8px #dc262633' : '0 2px 8px #05966933',
                  cursor: 'pointer',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={e => (e.currentTarget.style.background = showNewRoleForm ? '#b91c1c' : '#047857')}
                onMouseOut={e => (e.currentTarget.style.background = showNewRoleForm ? '#dc2626' : '#059669')}
              >
                {showNewRoleForm ? 'Cancel ×' : 'Post New Role +'}
              </button>
            </div>
            {loading ? (
              <Loader message="Loading roles..." />
            ) : error ? (
              <div style={{ color: '#dc2626' }}>{error}</div>
            ) : (
              <div style={{ width: '100%', marginTop: '0rem', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 24px 30rem 24px' }}>
                <div className={`new-role-form ${showNewRoleForm ? 'show' : ''}`}>
                  <div>
                    <input
                      type="text"
                      value={newRole.jobTitle}
                      onChange={(e) => handleNewRoleInputChange(e, 'jobTitle')}
                      placeholder="Job Title"
                      style={{ 
                        fontSize: '1.7rem',
                        fontWeight: 800,
                        color: '#4338ca',
                        marginBottom: 2,
                        letterSpacing: 0.5,
                        width: '100%',
                        border: validationErrors.jobTitle ? '1px solid #dc2626' : '1px solid #6366f1',
                        borderRadius: 4,
                        padding: 4
                      }}
                    />
                    <div style={{
                      color: validationErrors.jobTitle ? '#dc2626' : isFieldValid('jobTitle') ? '#059669' : 'transparent',
                      fontSize: '0.9rem',
                      marginTop: 1,
                      minHeight: '0.7em',
                      transition: 'color 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{validationErrors.jobTitle ? validationErrors.jobTitle : isFieldValid('jobTitle') ? 'Looks good!' : ' '}</div>
                  </div>
                  <div>
                    <textarea
                      value={newRole.description}
                      onChange={(e) => handleNewRoleInputChange(e, 'description')}
                      placeholder="Job Description"
                      style={{ 
                        color: '#1e293b',
                        fontSize: '1.13rem',
                        marginBottom: 2,
                        fontWeight: 500,
                        width: '100%',
                        border: validationErrors.description ? '1px solid #dc2626' : '1px solid #6366f1',
                        borderRadius: 4,
                        padding: 4,
                        minHeight: 60
                      }}
                    />
                    <div style={{
                      color: validationErrors.description ? '#dc2626' : isFieldValid('description') ? '#059669' : 'transparent',
                      fontSize: '0.9rem',
                      marginTop: 1,
                      minHeight: '0.7em',
                      transition: 'color 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{validationErrors.description ? validationErrors.description : isFieldValid('description') ? 'Looks good!' : ' '}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ color: '#6366f1', fontSize: '1.07rem', fontWeight: 600, display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                        <input
                          type="text"
                          value={newRole.location}
                          onChange={(e) => handleNewRoleInputChange(e, 'location')}
                          placeholder="Location"
                          style={{
                            border: validationErrors.location ? '1px solid #dc2626' : '1px solid #6366f1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            width: '100%',
                            height: 32,
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            color: '#1f2937',
                            lineHeight: '1.5'
                          }}
                        />
                      </div>
                      <span>|</span>
                      <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                        <input
                          type="text"
                          value={newRole.duration}
                          onChange={(e) => handleNewRoleInputChange(e, 'duration')}
                          placeholder="Duration"
                          style={{
                            border: validationErrors.duration ? '1px solid #dc2626' : '1px solid #6366f1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            width: '100%',
                            height: 32,
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            color: '#1f2937',
                            lineHeight: '1.5'
                          }}
                        />
                      </div>
                      <span>|</span>
                      <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                        <input
                          type="number"
                          value={newRole.stipend}
                          onChange={(e) => handleNewRoleInputChange(e, 'stipend')}
                          placeholder="Stipend"
                          style={{
                            border: validationErrors.stipend ? '1px solid #dc2626' : '1px solid #6366f1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            width: '100%',
                            height: 32,
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            color: '#1f2937',
                            lineHeight: '1.5'
                          }}
                        />
                      </div>
                      <span>|</span>
                      <div style={{ display: 'flex', flexDirection: 'column', width: 80 }}>
                        <input
                          type="number"
                          value={newRole.numberOfStudents}
                          onChange={(e) => handleNewRoleInputChange(e, 'numberOfStudents')}
                          placeholder="Openings"
                          style={{
                            border: validationErrors.numberOfStudents ? '1px solid #dc2626' : '1px solid #6366f1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            width: '100%',
                            height: 32,
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            color: '#1f2937',
                            lineHeight: '1.5'
                          }}
                        />
                      </div>
                      <span>|</span>
                      <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                      <select
                        value={newRole.jobType}
                        onChange={(e) => handleNewRoleInputChange(e, 'jobType')}
                        style={{
                          border: validationErrors.jobType ? '1px solid #dc2626' : '1px solid #6366f1',
                          borderRadius: 4,
                          padding: '4px 8px',
                          width: '100%',
                          height: 32,
                          boxSizing: 'border-box',
                          fontSize: '1rem',
                          color: '#1f2937',
                          lineHeight: '1.5',
                          appearance: 'none',
                          background: '#fff',
                          marginBottom: 4
                        }}
                      >
                        <option value="">Select Job Type</option>
                        <option value="internship">Internship</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                      </select>
                      <div style={{
                        color: validationErrors.jobType ? '#dc2626' : isFieldValid('jobType') ? '#059669' : 'transparent',
                        fontSize: '0.9rem',
                        marginTop: 1,
                        minHeight: '0.7em',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{validationErrors.jobType ? validationErrors.jobType : isFieldValid('jobType') ? 'Looks good!' : ' '}</div>
                    </div>
                      <span>|</span>
                      <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                        <select
                          value={newRole.status}
                          onChange={(e) => handleNewRoleInputChange(e, 'status')}
                          style={{
                            border: '1px solid #6366f1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            width: '100%',
                            height: 32,
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            color: '#1f2937',
                            lineHeight: '1.5',
                            appearance: 'none',
                            background: '#fff'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="closed">Closed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 2 }}>
                    <div style={{ width: 120 }}>
                      <div style={{
                        color: validationErrors.location ? '#dc2626' : isFieldValid('location') ? '#059669' : 'transparent',
                        fontSize: '0.9rem',
                        marginTop: 1,
                        minHeight: '0.7em',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{validationErrors.location ? validationErrors.location : isFieldValid('location') ? 'Looks good!' : ' '}</div>
                    </div>
                    <span style={{ width: 16 }}></span>
                    <div style={{ width: 120 }}>
                      <div style={{
                        color: validationErrors.duration ? '#dc2626' : isFieldValid('duration') ? '#059669' : 'transparent',
                        fontSize: '0.9rem',
                        marginTop: 1,
                        minHeight: '0.7em',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{validationErrors.duration ? validationErrors.duration : isFieldValid('duration') ? 'Looks good!' : ' '}</div>
                    </div>
                    <span style={{ width: 16 }}></span>
                    <div style={{ width: 120 }}>
                      <div style={{
                        color: validationErrors.stipend ? '#dc2626' : isFieldValid('stipend') ? '#059669' : 'transparent',
                        fontSize: '0.9rem',
                        marginTop: 1,
                        minHeight: '0.7em',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{validationErrors.stipend ? validationErrors.stipend : isFieldValid('stipend') ? 'Looks good!' : ' '}</div>
                    </div>
                    <span style={{ width: 16 }}></span>
                    <div style={{ width: 80 }}>
                      <div style={{
                        color: validationErrors.numberOfStudents ? '#dc2626' : isFieldValid('numberOfStudents') ? '#059669' : 'transparent',
                        fontSize: '0.9rem',
                        marginTop: 1,
                        minHeight: '0.7em',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{validationErrors.numberOfStudents ? validationErrors.numberOfStudents : isFieldValid('numberOfStudents') ? 'Looks good!' : ' '}</div>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newRole.skills}
                      onChange={(e) => handleNewRoleInputChange(e, 'skills')}
                      placeholder="Skills (comma-separated)"
                      style={{ 
                        border: validationErrors.skills ? '1px solid #dc2626' : '1px solid #6366f1', 
                        borderRadius: 4, 
                        padding: 4, 
                        width: '100%' 
                      }}
                    />
                    <div style={{
                      color: validationErrors.skills ? '#dc2626' : isFieldValid('skills') ? '#059669' : 'transparent',
                      fontSize: '0.9rem',
                      marginTop: 1,
                      minHeight: '0.7em',
                      transition: 'color 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{validationErrors.skills ? validationErrors.skills : isFieldValid('skills') ? 'Looks good!' : ' '}</div>
                  </div>
                  <div>
                    <textarea
                      value={newRole.requirements}
                      onChange={(e) => handleNewRoleInputChange(e, 'requirements')}
                      placeholder="Requirements (one per line)"
                      style={{ 
                        border: validationErrors.requirements ? '1px solid #dc2626' : '1px solid #6366f1', 
                        borderRadius: 4, 
                        padding: 4, 
                        width: '100%', 
                        minHeight: 80 
                      }}
                    />
                    <div style={{
                      color: validationErrors.requirements ? '#dc2626' : isFieldValid('requirements') ? '#059669' : 'transparent',
                      fontSize: '0.9rem',
                      marginTop: 1,
                      minHeight: '0.7em',
                      transition: 'color 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{validationErrors.requirements ? validationErrors.requirements : isFieldValid('requirements') ? 'Looks good!' : ' '}</div>
                  </div>
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
                      onClick={handleSubmitNewRole}
                      style={{
                        background: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '7px 18px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        marginRight: 8,
                        boxShadow: '0 2px 8px #05966933',
                        cursor: 'pointer',
                        transition: 'background 0.18s, box-shadow 0.18s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#047857')}
                      onMouseOut={e => (e.currentTarget.style.background = '#059669')}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setShowNewRoleForm(false)}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '7px 18px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px #dc262633',
                        cursor: 'pointer',
                        transition: 'background 0.18s, box-shadow 0.18s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#b91c1c')}
                      onMouseOut={e => (e.currentTarget.style.background = '#dc2626')}
                    >
                      Cancel
                    </button>
                  </div>
        </div>
                <div className={`roles-list ${showNewRoleForm ? 'shifted' : ''}`}>
                  {roles.map(role => {
                    const isEditing = editingRoleId === role._id;
                    const isDeleting = deletingRoleId === role._id;
                    return (
                      <div
                        key={role._id}
                        className="demand-role-card"
                        style={{ position: 'relative', overflow: 'visible', minHeight: 220 }}
                      >
                        {isEditing ? (
                          <>
                            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#4338ca', marginBottom: 2, letterSpacing: 0.5, width: '100%' }}>
          <input
            type="text"
                                value={editedRole.jobTitle}
                                onChange={(e) => handleInputChange(e, 'jobTitle')}
                                style={{ 
                                  width: '100%', 
                                  fontSize: '1.7rem', 
                                  fontWeight: 800, 
                                  color: '#4338ca', 
                                  border: '1px solid #6366f1', 
                                  borderRadius: 4, 
                                  padding: '4px 8px', 
                                  height: 32, 
                                  boxSizing: 'border-box',
                                  lineHeight: '1.5'
                                }}
                              />
                              <div style={{ height: 18, color: editValidationErrors.jobTitle ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.jobTitle || ' '}</div>
                            </div>
                            <div style={{ color: '#1e293b', fontSize: '1.13rem', marginBottom: 2, fontWeight: 500, width: '100%' }}>
                              <textarea
                                value={editedRole.description}
                                onChange={(e) => handleInputChange(e, 'description')}
                                style={{ 
                                  width: '100%', 
                                  color: '#1e293b', 
                                  fontSize: '1.13rem', 
                                  fontWeight: 500, 
                                  border: '1px solid #6366f1', 
                                  borderRadius: 4, 
                                  padding: '4px 8px', 
                                  minHeight: 60, 
                                  maxHeight: 60, 
                                  boxSizing: 'border-box', 
                                  resize: 'none',
                                  lineHeight: '1.5'
                                }}
                              />
                              <div style={{ height: 18, color: editValidationErrors.description ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.description || ' '}</div>
        </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                              <div style={{ color: '#6366f1', fontSize: '1.07rem', fontWeight: 600, display: 'flex', gap: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
          <input
            type="text"
                                    value={editedRole.location}
                                    onChange={(e) => handleInputChange(e, 'location')}
                                    style={{ 
                                      border: '1px solid #6366f1', 
                                      borderRadius: 4, 
                                      padding: '4px 8px', 
                                      width: '100%', 
                                      height: 32, 
                                      boxSizing: 'border-box',
                                      fontSize: '1rem',
                                      color: '#1f2937',
                                      lineHeight: '1.5'
                                    }}
                                    placeholder="Location"
                                  />
                                  <div style={{ height: 18, color: editValidationErrors.location ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.location || ' '}</div>
                                </div>
                                <span>|</span>
                                <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                                  <input
                                    value={editedRole.duration}
                                    onChange={(e) => handleInputChange(e, 'duration')}
                                    style={{ 
                                      border: '1px solid #6366f1', 
                                      borderRadius: 4, 
                                      padding: '4px 8px', 
                                      width: '100%', 
                                      height: 32, 
                                      boxSizing: 'border-box',
                                      fontSize: '1rem',
                                      color: '#1f2937',
                                      lineHeight: '1.5'
                                    }}
                                    placeholder="Duration"
                                  />
                                  
                                  <div style={{ height: 18, color: editValidationErrors.duration ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.duration || ' '}</div>
                                </div>
                                
                                <span>|</span>
                                <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                                  <input
                                    type="number"
                                    value={editedRole.stipend}
                                    onChange={(e) => handleInputChange(e, 'stipend')}
                                    style={{ 
                                      border: '1px solid #6366f1', 
                                      borderRadius: 4, 
                                      padding: '4px 8px', 
                                      width: '100%', 
                                      height: 32, 
                                      boxSizing: 'border-box',
                                      fontSize: '1rem',
                                      color: '#1f2937',
                                      lineHeight: '1.5'
                                    }}
                                    placeholder="Stipend"
                                  />
                                  <div style={{ height: 18, color: editValidationErrors.stipend ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.stipend || ' '}</div>
                                </div>
                                <span>|</span>
                                <div style={{ display: 'flex', flexDirection: 'column', width: 80 }}>
                                  <input
                                    type="number"
                                    value={editedRole.numberOfStudents}
                                    onChange={(e) => handleInputChange(e, 'numberOfStudents')}
                                    style={{ 
                                      border: '1px solid #6366f1', 
                                      borderRadius: 4, 
                                      padding: '4px 8px', 
                                      width: '100%', 
                                      height: 32, 
                                      boxSizing: 'border-box',
                                      fontSize: '1rem',
                                      color: '#1f2937',
                                      lineHeight: '1.5'
                                    }}
                                    placeholder="Openings"
                                  />
                                  <div style={{ height: 18, color: editValidationErrors.numberOfStudents ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.numberOfStudents || ' '}</div>
                                </div>
                                <span>|</span>
                                <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                                  <select
                                    value={editedRole.jobType || ''}
                                    onChange={(e) => handleInputChange(e, 'jobType')}
                                    style={{ 
                                      border: editValidationErrors.jobType ? '1px solid #dc2626' : '1px solid #6366f1', 
                                      borderRadius: 4, 
                                      padding: '4px 8px', 
                                      width: '100%', 
                                      height: 32, 
                                      boxSizing: 'border-box',
                                      fontSize: '1rem',
                                      color: '#1f2937',
                                      lineHeight: '1.5',
                                      appearance: 'none',
                                      background: '#fff'
                                    }}
                                  >
                                    <option value="">Select Job Type</option>
                                    <option value="internship">Internship</option>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                  </select>
                                  <div style={{ height: 18, color: editValidationErrors.jobType ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.jobType || ' '}</div>
                                </div>
                                <span>|</span>
                                <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                                  <select
                                    value={editedRole.status}
                                    onChange={(e) => handleInputChange(e, 'status')}
                                    style={{ 
                                      border: '1px solid #6366f1', 
                                      borderRadius: 4, 
                                      padding: '4px 8px', 
                                      width: '100%', 
                                      height: 32, 
                                      boxSizing: 'border-box',
                                      fontSize: '1rem',
                                      color: '#1f2937',
                                      lineHeight: '1.5',
                                      appearance: 'none',
                                      background: '#fff'
                                    }}
                                  >
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                    <option value="draft">Draft</option>
                                  </select>
                                </div>
                              </div>
        </div>
                            <div style={{ color: '#059669', fontWeight: 700, fontSize: '1.07rem', marginBottom: 2 }}>
          <input
            type="text"
                                value={editedRole.skills}
                                onChange={(e) => handleInputChange(e, 'skills')}
                                style={{ 
                                  border: '1px solid #6366f1', 
                                  borderRadius: 4, 
                                  padding: '4px 8px', 
                                  width: '100%', 
                                  height: 32, 
                                  boxSizing: 'border-box',
                                  fontSize: '1rem',
                                  color: '#1f2937',
                                  lineHeight: '1.5'
                                }}
                                placeholder="Skills (comma-separated)"
                              />
                              <div style={{ height: 18, color: editValidationErrors.skills ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.skills || ' '}</div>
        </div>
                            <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.07rem', marginBottom: 2, minHeight: 98, maxHeight: 98, overflow: 'hidden' }}>
          <textarea
                                value={editedRole.requirements}
                                onChange={(e) => handleInputChange(e, 'requirements')}
                                style={{ 
                                  border: '1px solid #6366f1', 
                                  borderRadius: 4, 
                                  padding: '4px 8px', 
                                  width: '100%', 
                                  minHeight: 80, 
                                  maxHeight: 80, 
                                  boxSizing: 'border-box', 
                                  resize: 'none',
                                  fontSize: '1rem',
                                  color: '#1f2937',
                                  lineHeight: '1.5'
                                }}
                                placeholder="Requirements (one per line)"
                              />
                              <div style={{ height: 18, color: editValidationErrors.requirements ? '#dc2626' : 'transparent', fontSize: '0.9rem', marginTop: 1, minHeight: '0.7em', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editValidationErrors.requirements || ' '}</div>
                              <ul style={{ color: '#6366f1', fontWeight: 500, fontSize: '1.07rem', marginLeft: 24, marginTop: 6, marginBottom: 0, listStyleType: 'disc', minHeight: 56, maxHeight: 56, overflow: 'hidden' }}>
                                {editedRole.requirements && editedRole.requirements.split('\n').filter(r => r.trim() !== '').map((req, idx) => (
                                  <li key={idx} style={{ marginBottom: 2 }}>{req}</li>
                                ))}
                              </ul>
                            </div>
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
                                onClick={() => handleSave(role._id)}
                                style={{
                                  background: '#059669',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '7px 18px',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  marginRight: 8,
                                  boxShadow: '0 2px 8px #05966933',
                                  cursor: 'pointer',
                                  transition: 'background 0.18s, box-shadow 0.18s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = '#047857')}
                                onMouseOut={e => (e.currentTarget.style.background = '#059669')}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                style={{
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '7px 18px',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  boxShadow: '0 2px 8px #dc262633',
                                  cursor: 'pointer',
                                  transition: 'background 0.18s, box-shadow 0.18s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = '#b91c1c')}
                                onMouseOut={e => (e.currentTarget.style.background = '#dc2626')}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
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
                            </div>
                            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#4338ca', marginBottom: 2, letterSpacing: 0.5 }}>{role.jobTitle}</div>
                            <div style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: 2 }}><i>{role.description}</i></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                              <div style={{ color: '#6366f1', fontSize: '1.07rem', fontWeight: 600 }}>
                                <b>Location:</b> {role.location} &nbsp; | &nbsp;
                                <b>Duration:</b> {role.duration} &nbsp; | &nbsp;
                                <b>Stipend:</b> ₹{role.stipend} &nbsp; | &nbsp;
                                <b>Openings:</b> {role.numberOfStudents} &nbsp; | &nbsp;
                                
                    
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
                            <div style={{ color: '#059669', fontWeight: 700, fontSize: '1.07rem', marginBottom:-10 }}>
                              <b><i>Skills:</i></b> <span style={{ fontWeight: 400 }}>{role.skills && role.skills.length > 0 ? role.skills.join(', ') : 'N/A'}</span>
                            </div>
                            <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.07rem', marginBottom: 2 }}>
                              <b>Requirements:</b>
                              <ul style={{ color: '#6366f1', fontWeight: 500, fontSize: '1rem', marginLeft: 24, marginTop: 0, marginBottom: 0, listStyleType: 'disc' }}>
                                {role.requirements && role.requirements.length > 0 ? role.requirements.map((req, idx) => (
                                  <li key={idx} style={{ marginBottom: 2 }}>{req}</li>
                                )) : <li>N/A</li>}
                              </ul>
                            </div>
                             {/* Matching Students Component */}
                             {role.status === 'active' && (
                              <div style={{ marginTop: '15px' }}>
                                <MatchingStudents 
                                  roleId={role._id} 
                                  roleName={role.jobTitle} 
                                  skills={role.skills} 
                                />
                              </div>
                            )}
                            <div style={{
                              position: 'absolute',
                              top: 54,
                              right: 32,
                              fontSize: '1.05rem',
                              fontWeight: 600,
                              color: '#6366f1',
                              fontStyle: 'normal',
                              textTransform: 'capitalize'
                            }}>
                              {role.jobType ? role.jobType.replace('-', ' ') : 'Job Type N/A'}
                            </div>
                            <div style={{ 
                              color: '#6b7280', 
                              fontSize: '0.875rem', 
                              marginTop: 'auto',
                              paddingTop: '8px',
                              borderTop: '1px solid #e5e7eb'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Posted {formatDistanceToNow(new Date(role.createdAt), { addSuffix: true })}</span>
                                {role.updatedAt && (
                                  <span>Updated {formatDistanceToNow(new Date(role.updatedAt), { addSuffix: true })}</span>
                                )}
                              </div>
                            </div>
                            <div
                              className="role-actions"
                              style={{
                                position: 'absolute',
                                right: 32,
                                bottom: 24,
                                gap: 12,
                                zIndex: 1
                              }}
                            >
                              <button
                                onClick={() => handleEdit(role)}
                                style={{
                                  background: '#6366f1',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '7px 18px',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  marginRight: 8,
                                  boxShadow: '0 2px 8px #6366f133',
                                  cursor: 'pointer',
                                  transition: 'background 0.18s, box-shadow 0.18s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = '#4338ca')}
                                onMouseOut={e => (e.currentTarget.style.background = '#6366f1')}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingRoleId(role._id)}
                                style={{
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '7px 18px',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  boxShadow: '0 2px 8px #dc262633',
                                  cursor: 'pointer',
                                  transition: 'background 0.18s, box-shadow 0.18s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = '#b91c1c')}
                                onMouseOut={e => (e.currentTarget.style.background = '#dc2626')}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                        {isDeleting && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(255,255,255,0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                          }}>
                            <div style={{
                              background: '#fff',
                              borderRadius: 12,
                              boxShadow: '0 4px 32px #0002',
                              padding: '32px 40px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: 320
                            }}>
                              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#dc2626', marginBottom: 16 }}>Are you sure you want to delete this role?</div>
                              <div style={{ display: 'flex', gap: 16 }}>
                                <button
                                  onClick={() => handleDelete(role._id)}
                                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px #dc262633', cursor: 'pointer', transition: 'background 0.18s, box-shadow 0.18s' }}
                                  onMouseOver={e => (e.currentTarget.style.background = '#b91c1c')}
                                  onMouseOut={e => (e.currentTarget.style.background = '#dc2626')}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingRoleId(null)}
                                  style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px #6366f133', cursor: 'pointer', transition: 'background 0.18s, box-shadow 0.18s' }}
                                  onMouseOver={e => (e.currentTarget.style.background = '#4338ca')}
                                  onMouseOut={e => (e.currentTarget.style.background = '#6366f1')}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
        </div>
            )}
        </div>

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
    </div>
    </>
  );
};

export default PostJobForm; 