import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
axios.defaults.withCredentials = true;
import { 
  FaUserGraduate, 
  FaChevronRight, 
  FaTicketAlt, 
  FaChartLine,
  FaPlus,
  FaTimes,
  FaFileExcel,
  FaDownload,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import CollegeSettingsModal from './CollegeSettingsModal';
import Loader from '../components/Loader';

const apiUrl = import.meta.env.VITE_API_URL;

const AddStudents = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  
  // Add CSS animation for loading spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [excelUploadSuccess, setExcelUploadSuccess] = useState(false);
  const [excelUploadError, setExcelUploadError] = useState(null);
  const [skipInserting, setSkipInserting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [students, setStudents] = useState([{
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    batch: '',
    joiningYear: '',
    graduationYear: '',
    cgpa: '',
    password: ''
  }]);

  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: college?.name || 'College Admin',
    role: 'Administrator',
    initials: college?.name ? college.name.substring(0, 2).toUpperCase() : 'CA'
  };

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/colleges/${collegeId}`);
        setCollege(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading college information');
        setLoading(false);
      }
    };

    fetchCollege();
  }, [collegeId]);

  const handleAddStudent = () => {
    setStudents([...students, {
      name: '',
      email: '',
      rollNumber: '',
      department: '',
      batch: '',
      joiningYear: '',
      graduationYear: '',
      cgpa: '',
      password: ''
    }]);
  };

  const handleRemoveStudent = (index) => {
    const newStudents = [...students];
    newStudents.splice(index, 1);
    setStudents(newStudents);
  };

  const handleStudentChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    setSuccess(false);
    setError(null);
  };

  const handleExcelSubmit = async (e, skipDuplicates = false) => {
    if (e) e.preventDefault();
    
    // Prevent multiple uploads
    if (excelUploadLoading) {
      return;
    }
    
    setExcelUploadLoading(true);
    setExcelUploadSuccess(false);
    setExcelUploadError(null);

    console.log('collegeId for Excel upload:', collegeId);
    if (!collegeId) {
      setExcelUploadError('College ID is missing. Please access this page from the correct college dashboard URL.');
      setExcelUploadLoading(false);
      return;
    }

    if (!excelFile) {
      setExcelUploadError('Please select an Excel file to upload.');
      setExcelUploadLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('collegeId', collegeId);
      const url = skipDuplicates
        ? `${apiUrl}/api/students/excel-sheet?query=skip-duplicates`
        : `${apiUrl}/api/students/excel-sheet`;
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      // Handle the new response format with summary
      if (response.data && response.data.summary) {
        const summary = response.data.summary;
        let successMessage = response.data.message;
        
        // Use the backend message directly since it now includes skipped students
        setExcelUploadSuccess(successMessage);
        setExcelFile(null);
        setExcelUploadError(null);
      } else if (response.data && response.data.message) {
        setExcelUploadSuccess(response.data.message);
        setExcelFile(null);
        setExcelUploadError(null);
      } else {
        setExcelUploadSuccess('Excel sheet uploaded successfully!');
        setExcelFile(null);
        setExcelUploadError(null);
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.existingStudents) {
        const duplicates = err.response.data.existingStudents
          .map(s => `<span style='color:#F59E0B'>• Email: <b>${s.email}</b>, Roll: <b>${s.rollNumber}</b></span>${s.reason ? ` <span style='color:#dc2626'>(${s.reason})</span>` : ''}`)
          .join('<br/>');
        setExcelUploadError(
          `<div>Some students already exist:<br/>${duplicates}<br/><br/>Please remove or update these students and try again.</div>`
        );
      } else if (err.message === 'Network Error' || err.code === 'ERR_UPLOAD_FILE_CHANGED') {
        setExcelUploadError(
          'Upload failed. The file may have been changed or the network connection was interrupted. Please try uploading the file again.'
        );
      } else if (err.code === 'ERR_NETWORK') {
        setExcelUploadError(
          'Network error. Please check your internet connection and try again.'
        );
      } else if (err.response?.data?.code === 11000) {
        // MongoDB duplicate key error
        setExcelUploadError(
          'A student with this email already exists in the database. Please check your data and try again.'
        );
      } else {
        setExcelUploadError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Error uploading Excel sheet. Please try again.'
        );
      }
    } finally {
      setExcelUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Add college ID to each student
      const studentsWithCollege = students.map(student => ({
        ...student,
        college: collegeId
      }));

      const response = await axios.post(`${apiUrl}/api/students/bulk`, studentsWithCollege);
      
      // Display success message with details
      const summary = response.data.summary;
      let successMessage = response.data.message;
      
      // Use the backend message directly since it now includes skipped students
      setSuccess(true);
      setError(null);
      setSuccessMessage(successMessage);
      setStudents([{
        name: '',
        email: '',
        rollNumber: '',
        department: '',
        joiningYear: '',
        graduationYear: '',
        cgpa: '',
        password: ''
      }]);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.existingStudents) {
        // Handle duplicate students error
        const duplicates = err.response.data.existingStudents
          .map(s => `<span style='color:#F59E0B'>• Email: <b>${s.email}</b>, Roll: <b>${s.rollNumber}</b></span>${s.reason ? ` <span style='color:#dc2626'>(${s.reason})</span>` : ''}`)
          .join('<br/>');
        setError(
          `<div>Some students already exist:<br/>${duplicates}<br/><br/>Please remove or update these students and try again.</div>`
        );
      } else if (err.response?.data?.code === 11000) {
        // MongoDB duplicate key error
        setError(
          'A student with this email already exists in the database. Please check your data and try again.'
        );
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Error adding students');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeUpdate = (updatedCollege) => {
    setCollege(updatedCollege);
  };

  // Header mapping from human-readable to camelCase
  const headerMapping = {
    'Full Name': 'name',
    'Email Address': 'email',
    'Roll Number': 'rollNumber',
    'Department': 'department',
    'Joining Year': 'joiningYear',
    'Graduation Year': 'graduationYear',
    'CGPA': 'cgpa',
    'Password': 'password'
  };

  const generateExcelTemplate = () => {
    // Human-readable headers for the template
    const humanHeaders = [
      'Full Name',
      'Email Address', 
      'Roll Number',
      'Department',
      'Joining Year',
      'Graduation Year',
      'CGPA',
      'Password'
    ];

    // Sample data with human-readable format
    const sampleData = [
      'John Doe',
      'john.doe@example.com',
      '2023001',
      'Computer Science',
      '2023',
      '2027',
      '8.5',
      'password123'
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([humanHeaders, sampleData]);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Full Name
      { wch: 25 }, // Email Address
      { wch: 15 }, // Roll Number
      { wch: 20 }, // Department
      { wch: 12 }, // Joining Year
      { wch: 15 }, // Graduation Year
      { wch: 8 },  // CGPA
      { wch: 15 }  // Password
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');

    // Generate the Excel file and trigger download
    const fileName = `students_template_${college?.name || 'college'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Function to convert Excel headers to camelCase
  const convertHeadersToCamelCase = (headers) => {
    return headers.map(header => headerMapping[header] || header);
  };

  // Helper to check if error is a duplicate list
  const isDuplicateList = excelUploadError && /Some students already exist/.test(excelUploadError);
  const isAllDuplicatesInfo = typeof excelUploadError === 'string' && excelUploadError.includes('No new students to insert');

  if (loading && !college) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
        <div className='main-container' style={{ marginLeft: 260, padding: '2rem', width: '100%' }}>
          <SearchBar onSettingsClick={() => setShowSettings(true)} />
          <Loader message="Loading college data..." />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
      <div className='main-container' style={{ 
        marginLeft: 260, 
        padding: '1rem',
        width: 'calc(100% - 260px)',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <SearchBar onSettingsClick={() => setShowSettings(true)} />
        
        <div style={{ 
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Add Students
          </h1>

          {/* Excel Upload Section */}
          <div style={{ 
            background: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '2px dashed #d1d5db'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaFileExcel style={{ color: '#059669' }} />
              Upload Students from Excel
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Upload an Excel file with student information. The file should have the following columns:
              <b>Full Name, Email Address, Roll Number, Department, Joining Year, Graduation Year, CGPA, Password</b>
            </p>
            
            {/* Download Template Button */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1rem',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={generateExcelTemplate}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
              >
                <FaDownload />
                Download Template
              </button>
              <span style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem',
                fontStyle: 'italic'
              }}>
                Download template with proper column headers and sample data
              </span>
            </div>
            
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            />
            <button
              onClick={() => handleExcelSubmit(null)}
              disabled={excelUploadLoading || !excelFile}
              style={{
                background: '#059669',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: excelUploadLoading || !excelFile ? 'not-allowed' : 'pointer',
                opacity: excelUploadLoading || !excelFile ? 0.6 : 1,
                minWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {excelUploadLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Submitting...
                </>
              ) : 'Submit Excel Sheet'}
            </button>
            {excelUploadSuccess && (
              <div style={{
                background: '#dcfce7',
                color: '#059669',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                fontWeight: 500
              }}
              dangerouslySetInnerHTML={{ __html: excelUploadSuccess }}
              />
            )}
            {excelUploadError && (
              <div style={{ position: 'relative', marginBottom: isDuplicateList ? '2.5rem' : undefined }}>
                <div
                  style={{
                    background: isAllDuplicatesInfo ? '#FEF08A' : '#fee2e2',
                    color: isAllDuplicatesInfo ? '#92400E' : '#dc2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    maxHeight: isDuplicateList ? 220 : undefined,
                    overflowY: isDuplicateList ? 'auto' : undefined,
                    position: 'relative',
                    fontWeight: isAllDuplicatesInfo ? 500 : undefined
                  }}
                  dangerouslySetInnerHTML={{ __html: excelUploadError }}
                />
                {isDuplicateList && excelFile && (
                  <button
                    onClick={() => handleExcelSubmit(null, true)}
                    style={{
                      position: 'absolute',
                      right: '1.5rem',
                      bottom: '-2.2rem',
                      background: '#F59E0B',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: excelUploadLoading ? 'not-allowed' : 'pointer',
                      opacity: excelUploadLoading ? 0.7 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      minWidth: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    disabled={excelUploadLoading}
                  >
                    {excelUploadLoading ? (
                      <>
                        <div style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid #ffffff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Processing...
                      </>
                    ) : 'Skip and Insert Non-Duplicates'}
                  </button>
                )}
              </div>
            )}
          </div>
           <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Add Manually
          </h1>
          
          <form onSubmit={handleSubmit}>
            {students.map((student, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                    Student {index + 1}
                  </h2>
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={student.email}
                      onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={student.rollNumber}
                      onChange={(e) => handleStudentChange(index, 'rollNumber', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Department *
                    </label>
                    <select
                      value={student.department}
                      onChange={(e) => handleStudentChange(index, 'department', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    >
                      <option value="">Select Department</option>
                      {college?.departments?.map(dept => (
                        <option key={dept.code} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Joining Year *
                    </label>
                    <input
                      type="number"
                      value={student.joiningYear}
                      onChange={(e) => handleStudentChange(index, 'joiningYear', e.target.value)}
                      required
                      min="2000"
                      max="2100"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      value={student.graduationYear}
                      onChange={(e) => handleStudentChange(index, 'graduationYear', e.target.value)}
                      required
                      min="2000"
                      max="2100"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      CGPA *
                    </label>
                    <input
                      type="number"
                      value={student.cgpa}
                      onChange={(e) => handleStudentChange(index, 'cgpa', e.target.value)}
                      required
                      min="0"
                      max="10"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords[index] ? 'text' : 'password'}
                        value={student.password}
                        onChange={(e) => handleStudentChange(index, 'password', e.target.value)}
                        required
                        minLength="6"
                        placeholder="Enter student password"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          paddingRight: '2.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          background: '#fff'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, [index]: !showPasswords[index] })}
                        style={{
                          position: 'absolute',
                          right: '0.5rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {showPasswords[index] ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleAddStudent}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#F59E0B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <FaPlus /> Add Another Student
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1,
                  minWidth: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Adding...
                  </>
                ) : 'Add Students'}
              </button>
            </div>
          </form>
          
          {/* Manual Form Error/Success Messages - Now positioned after the form */}
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}
            dangerouslySetInnerHTML={{ __html: error }}
            />
          )}

          {success && (
            <div style={{
              background: '#dcfce7',
              color: '#059669',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}
            dangerouslySetInnerHTML={{ __html: successMessage || 'Students added successfully!' }}
            />
          )}
        </div>

        {/* Settings Modal */}
        <CollegeSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          college={college}
          onUpdate={handleCollegeUpdate}
        />
      </div>
    </div>
  );
};

export default AddStudents; 