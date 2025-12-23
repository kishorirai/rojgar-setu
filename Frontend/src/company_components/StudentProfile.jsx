import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronRight, FaUserGraduate, FaTicketAlt, FaChartLine } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import axios from 'axios';
axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

const StudentProfile = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = localStorage.getItem('companyId');
        if (companyId) {
          const companyRes = await axios.get(`${apiUrl}/api/company/${companyId}`);
          setCompany(companyRes.data);
        }
        const response = await axios.get(`${apiUrl}/api/college-students/${studentId}`);
        setStudentData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

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
    initials: company?.name ? company.name.substring(0, 2).toUpperCase() : 'CA'
  };

  const handleEditClick = () => {
    setEditForm({
      name: studentData.name,
      email: studentData.email,
      major: studentData.major,
      gpa: studentData.gpa,
      joiningYear: studentData.joiningYear,
      graduationYear: studentData.graduationYear,
      skills: studentData.skills ? studentData.skills.join(', ') : '',
      extracurricular: studentData.extracurricular ? studentData.extracurricular.map(e => e.activity).join(', ') : '',
      remark: studentData.remark || '',
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const updated = {
        ...editForm,
        gpa: Number(editForm.gpa),
        joiningYear: Number(editForm.joiningYear),
        graduationYear: Number(editForm.graduationYear),
        skills: editForm.skills.split(',').map(s => s.trim()),
        extracurricular: editForm.extracurricular.split(',').map(a => ({ activity: a.trim(), role: '', achievement: '' })),
        remark: editForm.remark,
      };
      await axios.put(`${apiUrl}/api/college-students/${studentId}`, updated);
      setStudentData(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Error saving profile');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!studentData) return <div>No student data found</div>;

  return (
    <>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
      <div className="main-container" style={{ 
        height: '100vh', 
        overflowY: 'auto',
        flex: 1,
        minWidth: 0,
        padding: '0 1rem',
        '@media (max-width: 768px)': {
          padding: '0 0.5rem'
        }
      }}>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          paddingBottom: '100px',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          {/* Profile Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem',
            background: '#fff',
            padding: '1.5rem 2rem',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            borderLeft: '5px solid #6366f1'
          }}>
            <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem', fontWeight: 700 }}>{studentData.name}</h2>
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                style={{
                  padding: '8px 16px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '8px 16px',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Academic Information */}
          <div style={{ 
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            borderLeft: '5px solid #43a047'
          }}>
            <h3 style={{ color: '#43a047', marginBottom: '1rem', fontWeight: 700 }}>Academic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>College</label>
                {isEditing ? (
                  <input
                    name="college"
                    value={editForm.college}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  />
                ) : (
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>{studentData.college?.name || 'N/A'}</span>
                )}
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>Major</label>
                {isEditing ? (
                  <input
                    name="major"
                    value={editForm.major}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  />
                ) : (
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>{studentData.major}</span>
                )}
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>GPA</label>
                {isEditing ? (
                  <input
                    name="gpa"
                    value={editForm.gpa}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  />
                ) : (
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>{studentData.gpa}</span>
                )}
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>Year</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      name="joiningYear"
                      value={editForm.joiningYear}
                      onChange={handleEditChange}
                      style={{
                        width: '80px',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.95rem'
                      }}
                    />
                    -
                    <input
                      name="graduationYear"
                      value={editForm.graduationYear}
                      onChange={handleEditChange}
                      style={{
                        width: '80px',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>{studentData.joiningYear} - {studentData.graduationYear}</span>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ 
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            borderLeft: '5px solid #f59e42'
          }}>
            <h3 style={{ color: '#f59e42', marginBottom: '1rem', fontWeight: 700 }}>Skills</h3>
            {isEditing ? (
              <input
                name="skills"
                value={editForm.skills}
                onChange={handleEditChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
                placeholder="Enter skills separated by commas"
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {studentData.skills?.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interview Feedback */}
          <div style={{ 
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            borderLeft: '5px solid #3b82f6'
          }}>
            <h3 style={{ color: '#3b82f6', marginBottom: '1rem', fontWeight: 700 }}>Interview Feedback</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {studentData.interviewFeedback?.map((feedback, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '1rem',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>Interview with {feedback.interviewer}</h4>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{feedback.date}</span>
                    </div>
                    <span
                      style={{
                        background: feedback.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                        color: feedback.status === 'Completed' ? '#166534' : '#92400e',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {feedback.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem' }}>Technical</label>
                      <span style={{ color: '#1f2937', fontWeight: 600 }}>{feedback.technicalScore}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem' }}>Communication</label>
                      <span style={{ color: '#1f2937', fontWeight: 600 }}>{feedback.communicationScore}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem' }}>Problem Solving</label>
                      <span style={{ color: '#1f2937', fontWeight: 600 }}>{feedback.problemSolvingScore}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem' }}>Overall</label>
                      <span style={{ color: '#1f2937', fontWeight: 600 }}>{feedback.overallScore}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: '#4b5563' }}>{feedback.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile; 