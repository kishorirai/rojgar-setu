import { useState, useEffect } from 'react';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaDownload, FaUserGraduate } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import axios from 'axios';
axios.defaults.withCredentials = true;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CompanySettingsModal from './CompanySettingsModal';
const apiUrl = import.meta.env.VITE_API_URL;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PlacementAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [placementData, setPlacementData] = useState({
    overall: {
      totalStudents: 0,
      placed: 0,
      percentage: 0
    },
    byDepartment: [],
    byCompany: [],
    salaryDistribution: []
  });
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
    fetchPlacementData();
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

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      // In a real application, this would be an API call
      // For now, using mock data
      const mockData = {
        overall: {
          totalStudents: 500,
          placed: 350,
          percentage: 70
        },
        byDepartment: [
          { name: 'Computer Science', placed: 120, total: 150 },
          { name: 'Information Technology', placed: 80, total: 100 },
          { name: 'Electronics', placed: 60, total: 80 },
          { name: 'Mechanical', placed: 50, total: 70 },
          { name: 'Civil', placed: 40, total: 50 }
        ],
        byCompany: [
          { name: 'Tech Corp', count: 50 },
          { name: 'Global Systems', count: 45 },
          { name: 'Innovate Inc', count: 40 },
          { name: 'Future Tech', count: 35 },
          { name: 'Smart Solutions', count: 30 }
        ],
        salaryDistribution: [
          { range: '5-10 LPA', count: 100 },
          { range: '10-15 LPA', count: 150 },
          { range: '15-20 LPA', count: 50 },
          { range: '20+ LPA', count: 50 }
        ]
      };

      setPlacementData(mockData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch placement data');
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF report
    alert('Report download functionality will be implemented soon!');
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
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px' 
            }}>
              <h2 style={{ color: '#1f2937' }}>Placement Analysis</h2>
              <button
                onClick={handleDownloadReport}
                style={{
                  padding: '8px 16px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaDownload />
                Download Report
              </button>
            </div>

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
                <span className="ml-3 text-gray-600">Loading placement data...</span>
              </div>
            </div>
          </div>
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
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px' 
          }}>
            <h2 style={{ color: '#1f2937' }}>Placement Analysis</h2>
            <button
              onClick={handleDownloadReport}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                zIndex: 1
              }}
            >
              <FaDownload />
              Download Report
            </button>
          </div>

          {error ? (
            <div style={{ color: '#dc2626' }}>{error}</div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Overall Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Total Students</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {placementData.overall.totalStudents}
                  </div>
                </div>
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Placed Students</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {placementData.overall.placed}
                  </div>
                </div>
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Placement Rate</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {placementData.overall.percentage}%
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px'
              }}>
                {/* Department-wise Placement */}
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Department-wise Placement</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={placementData.byDepartment}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="placed" fill="#6366f1" name="Placed" />
                        <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Company Distribution */}
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Company Distribution</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={placementData.byCompany}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {placementData.byCompany.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Salary Distribution */}
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Salary Distribution</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={placementData.salaryDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#6366f1" name="Number of Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
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

export default PlacementAnalysis; 