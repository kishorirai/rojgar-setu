import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaUserGraduate, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import axios from 'axios';
axios.defaults.withCredentials = true;
import CompanySettingsModal from './CompanySettingsModal';
import Loader from '../components/Loader';
const apiUrl = import.meta.env.VITE_API_URL;

const ManageEmployees = () => {
  const { companyId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    type: 'employee',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [adding, setAdding] = useState(false);

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

        // Fetch employees
        const employeesRes = await axios.get(`${apiUrl}/api/employees?companyId=${companyId}`);
        setEmployees(employeesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate required fields
    const errors = {};
    if (!newEmployee.name) errors.name = 'Name is required';
    if (!newEmployee.email) errors.email = 'Email is required';
    if (!newEmployee.phone) errors.phone = 'Phone is required';
    if (!newEmployee.department) errors.department = 'Department is required';
    if (!newEmployee.password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setAdding(true);
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await axios.post(`${apiUrl}/api/company/${companyId}/employees`, {
        ...newEmployee,
        addedBy: companyId
      });

      setEmployees([...employees, response.data.employee]);
      setShowAddForm(false);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        department: '',
        type: 'employee',
        password: ''
      });
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(err.response?.data?.error || 'Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate required fields
    const errors = {};
    if (!selectedEmployee.name) errors.name = 'Name is required';
    if (!selectedEmployee.email) errors.email = 'Email is required';
    if (!selectedEmployee.phone) errors.phone = 'Phone is required';
    if (!selectedEmployee.department) errors.department = 'Department is required';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await axios.put(`${apiUrl}/api/employees/${selectedEmployee._id}`, {
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
        department: selectedEmployee.department,
        type: selectedEmployee.type,
        rating: selectedEmployee.rating || 4,
        verified: selectedEmployee.verified || false,
        feedback: selectedEmployee.feedback || ''
      });

      // Update the employees list with the updated employee data
      setEmployees(employees.map(emp => 
        emp._id === selectedEmployee._id ? response.data : emp
      ));
      
      // Close the edit form and reset the selected employee
      setShowEditForm(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.response?.data?.error || 'Failed to update employee');
    }
  };

  const handleDeleteClick = (employeeId) => {
    setDeletingEmployeeId(employeeId);
  };

  const handleDeleteConfirm = async (employeeId) => {
    try {
      await axios.delete(`${apiUrl}/api/employees/${employeeId}/company/${companyId}`);
      setEmployees(employees.filter(emp => emp._id !== employeeId));
      setDeletingEmployeeId(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
      setDeletingEmployeeId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingEmployeeId(null);
  };

  const handleEditClick = (employee) => {
    // Create a copy of the employee data to avoid direct mutation
    setSelectedEmployee({
      ...employee,
      rating: employee.rating || 4,
      verified: employee.verified || false,
      feedback: employee.feedback || ''
    });
    setShowEditForm(true);
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

  const sidebarUser = {
    name: company?.name || 'Company Admin',
    role: 'Company Admin',
    initials: company?.name ? company.name.substring(0, 2).toUpperCase() : 'CA',
    profileImage: localStorage.getItem('profileImage') || company?.profileImage || ''
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
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>Manage Employees</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: showAddForm ? '#dc2626' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  {showAddForm ? <FaTimes /> : <FaPlus />}
                  {showAddForm ? 'Cancel' : 'Add Employee'}
                </button>
              </div>
            </div>

            {/* Employees Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Department</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Rating</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" style={{ 
                      padding: '48px',
                      textAlign: 'center',
                      background: 'white',
                      verticalAlign: 'middle',
                      height: '200px'
                    }}>
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading employees...</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>Manage Employees</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: showAddForm ? '#dc2626' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {showAddForm ? <FaTimes /> : <FaPlus />}
                {showAddForm ? 'Cancel' : 'Add Employee'}
              </button>
            </div>

            {/* Add Employee Form */}
            {showAddForm && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Add New Employee</h3>
                <form onSubmit={handleAddEmployee}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Name</label>
                      <input
                        type="text"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.name && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.name}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Email</label>
                      <input
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.email && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.email}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Phone</label>
                      <input
                        type="tel"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.phone && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.phone}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Department</label>
                      <input
                        type="text"
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.department && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.department}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Type</label>
                      <select
                        value={newEmployee.type}
                        onChange={(e) => setNewEmployee({ ...newEmployee, type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="employee">Employee</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Password</label>
                      <input
                        type="password"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.password && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.password}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: adding ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        height: 40,
                        minWidth: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      {adding ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Employee'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Employee Form */}
            {showEditForm && selectedEmployee && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Edit Employee</h3>
                <form onSubmit={handleEditEmployee}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Name</label>
                      <input
                        type="text"
                        value={selectedEmployee.name}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.name && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.name}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Email</label>
                      <input
                        type="email"
                        value={selectedEmployee.email}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.email && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.email}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Phone</label>
                      <input
                        type="tel"
                        value={selectedEmployee.phone}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.phone && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.phone}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Department</label>
                      <input
                        type="text"
                        value={selectedEmployee.department}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      {validationErrors.department && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{validationErrors.department}</div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Type</label>
                      <select
                        value={selectedEmployee.type}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="employee">Employee</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Rating (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={selectedEmployee.rating || 4}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, rating: parseInt(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Verification Status</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmployee.verified || false}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, verified: e.target.checked })}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ color: '#374151', fontSize: '14px' }}>
                          {selectedEmployee.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Feedback</label>
                      <textarea
                        value={selectedEmployee.feedback || ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, feedback: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          minHeight: '100px',
                          resize: 'vertical'
                        }}
                        placeholder="Enter feedback about the employee..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setSelectedEmployee(null);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Update Employee
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Employees Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Department</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Rating</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px' }}>{employee.name}</td>
                      <td style={{ padding: '12px 16px' }}>{employee.email}</td>
                      <td style={{ padding: '12px 16px' }}>{employee.department}</td>
                      <td style={{ padding: '12px 16px' }}>{employee.type}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '4px 8px',
                          backgroundColor: employee.rating >= 7 ? '#dcfce7' : employee.rating >= 4 ? '#fef9c3' : '#fee2e2',
                          color: employee.rating >= 7 ? '#166534' : employee.rating >= 4 ? '#854d0e' : '#991b1b',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 500
                        }}>
                          {employee.rating || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '4px 8px',
                          backgroundColor: employee.verified ? '#dcfce7' : '#fee2e2',
                          color: employee.verified ? '#166534' : '#991b1b',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 500
                        }}>
                          {employee.verified ? 'Verified' : 'Not Verified'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditClick(employee)}
                            style={{
                              padding: '6px',
                              background: '#dbeafe',
                              color: '#2563eb',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaEdit />
                          </button>
                          {deletingEmployeeId === employee._id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleDeleteConfirm(employee._id)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={handleDeleteCancel}
                                style={{
                                  padding: '6px 12px',
                                  background: '#6b7280',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(employee._id)}
                              style={{
                                padding: '6px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

export default ManageEmployees; 