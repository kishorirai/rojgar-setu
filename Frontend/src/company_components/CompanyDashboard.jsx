import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../SearchBar';
import Sidebar from '../Sidebar';
import Analytics from './Analytics';
import CompanySettingsModal from './CompanySettingsModal';
import Loader from '../components/Loader';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaUserGraduate, FaCog } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

const Dashboard = () => {
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
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');
  const [sidebarUser, setSidebarUser] = useState({ initials: 'CA', name: 'Company', role: 'Company Admin', profileImage: localStorage.getItem('profileImage') || company?.profileImage || '' });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const itemsPerPage = showAll ? 10 : 3;

  // Fetch company data and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) {
          setError('Company ID not found');
          return;
        }

        // Fetch company data
        const companyRes = await axios.get(`${apiUrl}/api/company/${companyId}`);
        setCompany(companyRes.data);
        setSidebarUser({
          initials: companyRes.data.name.substring(0, 2).toUpperCase(),
          name: companyRes.data.name,
          role: 'Company Admin',
          profileImage: localStorage.getItem('profileImage') || company?.profileImage || ''
        });

        // Fetch applications
        const applicationsRes = await axios.get(`${apiUrl}/api/applications/company/${companyId}`);
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading company information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from real data
  const stats = {
    currentApplications: applications.length,
    activeRoles: new Set(applications.map(app => app.roleId?._id)).size,
    interviewsScheduled: applications.filter(app => 
      app.students?.some(student => student.status === 'interview_scheduled')
    ).length,
    hiredStudents: applications.filter(app => 
      app.students?.some(student => student.status === 'hired')
    ).length
  };

  const roles = [
    { id: 'all', name: 'All Roles' },
    ...Array.from(new Set(applications.map(app => app.roleId?.jobTitle)))
      .filter(Boolean)
      .map(role => ({ id: role.toLowerCase(), name: role }))
  ];

  const statusOptions = [
    'active',
    'closed'
  ];

  // Filter and sort applications
  const filteredApplications = applications
    .filter(application => selectedRole === 'all' || application.roleId?.jobTitle?.toLowerCase().includes(selectedRole.toLowerCase()))
    .sort((a, b) => {
      if (sortByMarks) {
        const scoreA = a.students?.reduce((acc, student) => acc + (student.studentId?.cgpa || 0), 0) / (a.students?.length || 1);
        const scoreB = b.students?.reduce((acc, student) => acc + (student.studentId?.cgpa || 0), 0) / (b.students?.length || 1);
        return scoreB - scoreA;
      }
      const dateA = new Date(a.createdAt || a.updatedAt);
      const dateB = new Date(b.createdAt || b.updatedAt);
      return dateB - dateA;
    });

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

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewAll = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  const handleEdit = (application) => {
    setEditingId(application._id);
    setEditForm({
      status: application.status,
      avgScore: application.students?.reduce((acc, student) => acc + (student.studentId?.cgpa || 0), 0) / (application.students?.length || 1)
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.patch(`${apiUrl}/api/applications/${id}`, { status: editForm.status });
      setApplications(applications.map(app => 
        app._id === id ? { ...app, status: editForm.status } : app
      ));
    setEditingId(null);
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application status');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const navItems = [
    { label: 'Dashboard', href: `/company/${localStorage.getItem('companyId')}/dashboard`, icon: <FaChevronRight /> },
    { label: 'Demand Roles', href: `/company/${localStorage.getItem('companyId')}/post-job`, icon: <FaChevronRight /> },
    { label: 'Scheduled Interviews', href: `/company/${localStorage.getItem('companyId')}/scheduled-interviews`, icon: <FaChevronRight /> },
    { label: 'Applications', href: `/company/${localStorage.getItem('companyId')}/applications`, icon: <FaChevronRight /> },
    { label: 'Manage Employees', href: `/company/${localStorage.getItem('companyId')}/employees`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/company/${localStorage.getItem('companyId')}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/company/${localStorage.getItem('companyId')}/placement-analysis`, icon: <FaChartLine /> },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
        <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
          <div style={{ padding: '0 24px' }}>
            <SearchBar onSettingsClick={() => setShowSettings(true)} />
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                color: '#1e293b',
                marginBottom: '24px'
              }}>Company Dashboard</h2>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '400px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading company dashboard...</span>
                </div>
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
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: '24px' }}>
        <SearchBar onSettingsClick={() => setShowSettings(true)} />
        
        {/* Analytics Section */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 700, 
            color: '#1e293b',
            marginBottom: '24px'
          }}>Company Dashboard</h2>
          <Analytics />
        </div>

        {/* Stats Cards */}
        <div style={{ 
              display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '24px',
          marginBottom: '32px'
            }}>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>Current Applications</h3>
                  <p className="stat-number">{stats.currentApplications}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>Active Roles</h3>
                  <p className="stat-number">{stats.activeRoles}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Interviews Scheduled</h3>
                  <p className="stat-number">{stats.interviewsScheduled}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Hired Students</h3>
                  <p className="stat-number">{stats.hiredStudents}</p>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="recent-applications">
              <div className="section-header">
                <h3>Recent Applications</h3>
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
                  <th>College</th>
                      <th>Position</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Avg. Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((application) => (
                  <tr key={application._id}>
                        <td>
                      <Link to={`/college/${application.applicationFromCollege?._id}`} className="college-name">
                        {application.applicationFromCollege?.name}
                          </Link>
                        </td>
                    <td>{application.roleId?.jobTitle}</td>
                    <td>{formatDate(application.createdAt || application.updatedAt)}</td>
                        <td>
                      {editingId === application._id ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="edit-select"
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                              {application.status}
                            </span>
                          )}
                        </td>
                        <td>
                      {application.students?.reduce((acc, student) => acc + (student.studentId?.cgpa || 0), 0) / (application.students?.length || 1).toFixed(1)}
                        </td>
                        <td>
                      {editingId === application._id ? (
                          <div className="action-buttons">
                          <button onClick={() => handleSave(application._id)} className="save-button">Save</button>
                          <button onClick={handleCancel} className="cancel-button">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(application)} className="edit-button">Edit</button>
                      )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
          {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                className="pagination-button"
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                className="pagination-button"
                    >
                      Next
                    </button>
                  </div>
                )}
        </div>
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
  );
};

export default Dashboard; 