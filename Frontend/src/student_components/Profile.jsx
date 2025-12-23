import React, { useState,useEffect, useCallback, memo, useMemo } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Target, ShieldAlert, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarContext } from './Sidebar';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Move ArraySection outside the main component
const ArraySection = memo(({ label, field, fields, emptyObj, profileData, isEditing, handleArrayItemChange, handleRemoveArrayItem, handleAddArrayItem, renderSubArray }) => {


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{label}</h3>
      {isEditing ? (
        <>
          {(profileData[field] || []).map((item, idx) => (
            <div key={`${field}-${idx}`} className="mb-4 p-3 bg-gray-50 rounded border relative">
              {fields.map(({ key, label, type }) => (
                <div key={key} className="mb-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type={type || "text"}
                    value={Array.isArray(item[key]) ? item[key].join(', ') : (item[key] || '')}
                    onChange={e =>
                      handleArrayItemChange(
                        field, idx, key,
                        type === "number"
                          ? Number(e.target.value)
                          : key === "technologies"
                            ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            : e.target.value
                      )
                    }
                    placeholder={label}
                  />
                </div>
              ))}
              <button
                type="button"
                className="absolute top-2 right-2 text-red-500 text-xs px-2 py-1 rounded hover:bg-red-100"
                onClick={() => handleRemoveArrayItem(field, idx)}
              >Remove</button>
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-200 px-3 py-1 rounded"
            onClick={() => handleAddArrayItem(field, { ...emptyObj })}
          >+ Add {label.split(' ')[0]}</button>
        </>
      ) : (
        renderSubArray(profileData[field], fields.map(f => f.key))
      )}
    </div>
  );
});

// All useMemo hooks must be at the top level, before the Profile component function
const PROJECT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "technologies", label: "Technologies (comma separated)" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "link", label: "Link" }
];
const ACHIEVEMENT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "date", label: "Date", type: "date" },
  { key: "issuer", label: "Issuer" }
];
const CERTIFICATION_FIELDS = [
  { key: "name", label: "Name" },
  { key: "issuer", label: "Issuer" },
  { key: "date", label: "Date", type: "date" },
  { key: "link", label: "Link" }
];
const EXTRACURRICULAR_FIELDS = [
  { key: "activity", label: "Activity" },
  { key: "role", label: "Role" },
  { key: "achievement", label: "Achievement" }
];
const RESEARCH_FIELDS = [
  { key: "title", label: "Title" },
  { key: "role", label: "Role" },
  { key: "year", label: "Year", type: "number" },
  { key: "description", label: "Description" }
];
const HACKATHON_FIELDS = [
  { key: "name", label: "Name" },
  { key: "year", label: "Year", type: "number" },
  { key: "achievement", label: "Achievement" },
  { key: "description", label: "Description" }
];

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [kycStatus, setKycStatus] = useState('not started'); // New state for KYC status
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [kycStep, setKycStep] = useState(0); // 0: intro, 1: payment, 2: confirm, 3: done
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [kycIdentifierType, setKycIdentifierType] = useState('phone');
  const [kycIdentifierValue, setKycIdentifierValue] = useState('');
  const [isKycPaymentDialogOpen, setIsKycPaymentDialogOpen] = useState(false);
  const [kycPaymentMessage, setKycPaymentMessage] = useState({ text: '', type: '' });
  const [kycPaymentLoading, setKycPaymentLoading] = useState(false);
  const [buttonCountdown, setButtonCountdown] = useState(6);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      window.location.href = '/student-login';
    }
  }, [token]);

  // Handle URL parameters and payment success
  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);

      // Check payment status and set KYC step
      if (profileData?.payment?.status === 'paid') {
        setKycStep(2); // Go directly to KYC initiation step if payment is paid
        console.log('Payment already paid, opening KYC dialog at step 2');
      } else {
        setKycStep(0); // Start from intro step if payment is not paid
      }

      // Remove query parameters from URL (hide from user)
      window.history.replaceState({}, document.title, window.location.pathname);

      // If payment was successful, re-fetch data (keep your existing logic if needed)
      if (params.get('payment') === 'success') {
        const fetchProfileData = async () => {
          try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/student/me`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            if (response.status === 401 || response.status === 403) {
              window.location.href = '/student-login';
              return;
            }
            if (!response.ok) {
              throw new Error('Failed to fetch profile data');
            }
            const data = await response.json();
            const profileInfo = data.profile || data;
            setProfileData(profileInfo);
            setLoading(false);
            
            // Use setTimeout without blocking the main function

              if (profileInfo.payment?.status === 'paid') {
                setKycStep(2); // Set to KYC initiation step if payment is already paid
                console.log('Payment already paid, setting KYC step to 2');
              } else {
                console.log(profileInfo.payment?.status);
              }
              window.history.replaceState({}, document.title, location.pathname);

          } catch (err) {
            setError(err.message || 'Unknown error');
            setLoading(false);
          }
        };
        fetchProfileData();
      }
    }
  }, [location.search, token, profileData]);

  // fetch kyc status from the backend
  useEffect(() => {
    const fetchKycStatus = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/kyc/status`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('KYC Status:', data.kycStatus);
          console.log('verification id:', data.kycData.verificationId);
          
          // If iskycVerified is true, set to approved
          if (data.kycStatus === 'verified' || data.iskycVerified|| data.kycStatus === 'approved') {
            setKycStatus('approved');
          }
          if (data.kycStatus === 'pending' || data.kycStatus === 'pending approval'|| data.kycStatus === 'requested') {
            // setKycStatus('pending');
          }
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
      }
    };
    
    fetchKycStatus();
  }, [token]);

  // Separate useEffect to handle payment status check after profileData is loaded
  useEffect(() => {
    if (profileData && profileData.payment?.status === 'paid') {
      setKycStep(2); // Set to KYC initiation step if payment is already paid
      console.log('Payment already paid, setting KYC step to 2');
    } else if (profileData) {
      console.log('Payment status:', profileData.payment?.status);
    }
    }, [profileData, kycStep]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api/student/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/student-login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();

        const profileInfo = data.profile || data;
        setProfileData(profileInfo);
        setLoading(false);
        
        // Check payment status from profile data and set KYC step accordingly
      } catch (err) {
        setError(err.message || 'Unknown error');
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token]);

  // Set default KYC identifier value when profile data is loaded and check payment status
  useEffect(() => {
    if (profileData?.phone) {
      setKycIdentifierValue(profileData.phone);
    }
    
    // Check payment status and update KYC step accordingly
    if (profileData?.payment?.status === 'paid') {
      setKycStep(2); // Set to KYC initiation step if payment is paid
      console.log('Payment status changed to paid, setting KYC step to 2');
    }
  }, [profileData,token]);

  // Countdown effect for button enablement
  useEffect(() => {
    if (profileData && !isButtonEnabled) {
      const timer = setInterval(() => {
        setButtonCountdown((prev) => {
          if (prev <= 1) {
            setIsButtonEnabled(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [profileData, isButtonEnabled]);

  // Refetch profile data when button gets enabled
  useEffect(() => {
    if (isButtonEnabled) {
      const fetchProfileData = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`${API_URL}/api/student/me`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (response.status === 401 || response.status === 403) {
            window.location.href = '/student-login';
            return;
          }
          if (!response.ok) {
            throw new Error('Failed to fetch profile data');
          }
          const data = await response.json();
          const profileInfo = data.profile || data;
          setProfileData(profileInfo);
          setLoading(false);
        } catch (err) {
          setError(err.message || 'Unknown error');
          setLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [isButtonEnabled, token]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl('');
    setProfilePicFile(null);
  };

  const handleInputChange = useCallback((field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddArrayItem = useCallback((field, emptyObj) => {
    handleInputChange(field, [...(profileData[field] || []), emptyObj]);
  }, [handleInputChange, profileData]);

  const handleRemoveArrayItem = useCallback((field, idx) => {
    const arr = [...(profileData[field] || [])];
    arr.splice(idx, 1);
    handleInputChange(field, arr);
  }, [handleInputChange, profileData]);

  const handleArrayItemChange = useCallback((field, idx, key, value) => {
    const arr = [...(profileData[field] || [])];
    arr[idx] = { ...arr[idx], [key]: value };
    handleInputChange(field, arr);
  }, [handleInputChange, profileData]);

  const handleSave = async () => {
    try {
      // Update main profile
      const response = await fetch(`${API_URL}/api/student/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/student-login';
        return;
      }
      if (!response.ok) throw new Error('Failed to update profile');
      let data = await response.json();

      // Upload profile pic if selected
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);
        const picRes = await fetch(`${API_URL}/api/student/me/profile-pic`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (picRes.ok) {
          data = await picRes.json();
        }
      }

      setProfileData(data.profile || data);
      setIsEditing(false);
      setPreviewUrl('');
      setProfilePicFile(null);
    } catch {
      alert('Failed to update profile');
    }
  };

  const handleVerification = async () => {
    try {
      if (kycStatus === 'verified' || kycStatus === 'approved') {
        alert('KYC is already verified.');
        return;
      }
      
      // Check payment status and set KYC step accordingly
      if (profileData?.payment?.status === 'paid') {
        setKycStep(2); // Go directly to KYC initiation step if payment is paid
        console.log('Payment already paid, setting KYC step to 2');
      } else {
        setKycStep(0); // Start from intro step if payment is not paid
      }
      
      setIsKycDialogOpen(true);
    } catch (error) {
      console.error('KYC verification error:', error);
      alert('Failed to initiate KYC verification');
    }
  };

  const handleKycNext = () => {
    if (kycStep === 2) {
      // Set default value for identifier when moving to step 2
      setKycIdentifierValue(kycIdentifierType === 'phone' ? (profileData.phone || '') : (profileData.email || ''));
    } else if(kycStep === 0 && profileData.payment?.status === 'paid'){
      setKycStep(2);
    }
    setKycStep((prev) => prev + 1);
  };

  const handleKycBack = () => {
    setKycStep((prev) => prev - 1);
  };

  const 
  handleKycClose = () => {
    setIsKycDialogOpen(false);
    // Reset to appropriate step based on payment status
    if (profileData?.payment?.status === 'paid') {
      setKycStep(2); // Keep at KYC initiation step if payment is paid
    } else {
      setKycStep(0); // Reset to intro step if payment is not paid
    }
    setPaymentProcessing(false);
  };

  const handlePayment = async () => {
    if (kycStatus === 'approved' || kycStatus === 'verified') {
      alert('KYC is already approved or verified.');
      return;
    }
    if (paymentProcessing) return; // Prevent multiple clicks
    setPaymentProcessing(true);

    try {
      // Use profileData for userId and email
      const userId = profileData?._id || profileData?.id;
      const customerEmail = profileData?.email;

      if (!userId || !customerEmail) {
        alert('User information not available for payment.');
        setPaymentProcessing(false);
        return;
      }

      const response = await fetch('https://campuspg.onrender.com/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          customerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      let data = null;
      try { data = await response.json(); } catch {}

              if (data && data.success && data.redirectUrl) {
          // Redirect to Payomatix payment gateway in the current tab
          window.location.href = data.redirectUrl;

          // Optionally, move to next KYC step or wait for webhook confirmation
          setKycStep(2); // Move to confirm step
        } else {
        alert('Payment initiation failed: ' + (data?.message || 'No redirect URL received.'));
      }
    } catch (error) {
      alert('Payment initiation failed: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleKycConfirm = async () => {
    try {
      const identifier = kycIdentifierType === 'phone' ? { phone: kycIdentifierValue } : { email: kycIdentifierValue };
      const response = await fetch(`${API_URL}/api/kyc/verify-digio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...identifier,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          template_name: 'ADHAAR_PAN_MARKSHEET',
        }),
      });
      if(response.status === 400) {
        toast('Kyc verification already in progress or completed. Please check your KYC status.');
        setIsKycDialogOpen(false);
        return;
      }
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/student-login';
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to initiate KYC verification');
      }
      const data = await response.json();
      setKycStep(3); // Done step
      if (data.digilockerUrl) {
        setTimeout(() => {
          window.location.href = data.digilockerUrl;
        }, 1500);
      }
    } catch (error) {
      console.error('KYC verification error:', error);
      alert('Failed to initiate KYC verification');
      setIsKycDialogOpen(false);
    }
  };

  // Function to open KYC payment dialog
  const openKycPaymentDialog = () => {
    setKycPaymentMessage({ text: '', type: '' });
    setIsKycPaymentDialogOpen(true);
  };

  // Function to close and reset KYC payment dialog
  const closeKycPaymentDialog = () => {
    setIsKycPaymentDialogOpen(false);
    setKycPaymentMessage({ text: '', type: '' });
    setKycPaymentLoading(false);
  };

  // KYC Payment submit handler
  const handleKycPaymentSubmit = async (event) => {
    event.preventDefault();
    setKycPaymentMessage({ text: '', type: '' });
    if (!profileData?._id || !profileData?.email) {
      setKycPaymentMessage({ text: 'User ID and Email are required.', type: 'error' });
      return;
    }
    setKycPaymentLoading(true);
    setKycPaymentMessage({ text: 'Initiating payment... Please wait.', type: 'info' });
    try {
      const response = await fetch('https://campuspg.onrender.com/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profileData._id, customerEmail: profileData.email }),
      });
      let data = null;
      try { data = await response.json(); } catch {}
      if (response.ok && data && data.success && data.redirectUrl) {
        setKycPaymentMessage({ text: 'Redirecting to payment gateway...', type: 'success' });
        window.location.href = data.redirectUrl;
      } else if (response.ok) {
        setKycPaymentMessage({ text: 'Payment initiated. Please complete the payment.', type: 'success' });
      } else {
        setKycPaymentMessage({ text: data?.message || 'Failed to initiate payment. Please try again.', type: 'error' });
      }
    } catch (error) {
      setKycPaymentMessage({ text: 'Network error: Could not connect to backend. Please try again.', type: 'error' });
    } finally {
      setKycPaymentLoading(false);
    }
  };



  if (loading) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }

  if (!profileData) {
    return <div className="p-10 text-center text-gray-500">No profile data found.</div>;
  }

  const getProfilePicUrl = () => {
    if (previewUrl) return previewUrl;
    if (profileData)
      return `${API_URL}/api/student/me/profile-pic?${Date.now()}`;
    if (profileData && profileData.profileImage) return profileData.profileImage;
    return '';
  };

  // Helper to render array values nicely
  const renderArray = arr => Array.isArray(arr) ? arr.join(', ') : '';

  // Helper for sub-array rendering (projects, etc.)
  const renderSubArray = (arr, fields) =>
    Array.isArray(arr) && arr.length
      ? arr.map((item, idx) => (
          <div key={idx} className="mb-3 border-b border-gray-100 pb-2 last:pb-0 last:border-b-0">
            {fields.map(f => item[f] && (
              <div key={f}><span className="font-medium">{f}:</span> {Array.isArray(item[f]) ? item[f].join(', ') : item[f]}</div>
            ))}
          </div>
        ))
      : <span className="italic text-gray-400">None</span>;

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
    <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold">Rojgar Setu</span>
        </div>
          {/* Sticky Top Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="text-gray-600" size={20} />
                <h1 className="text-lg font-medium text-gray-900">Complete Profile</h1>
              </div>
              <div className="flex space-x-2 items-center">
                {/* KYC Button at the top */}
                {!isButtonEnabled ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold border border-gray-200 text-base shadow mr-2">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>Loading... {buttonCountdown}s</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVerification}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl font-semibold border border-yellow-200 hover:bg-yellow-200 transition-colors text-base shadow mr-2"
                    style={{ outline: 'none' }}
                    disabled={kycStatus === 'approved' || kycStatus === 'verified' || kycStatus === 'pending'}
                  >
                    {kycStatus === 'pending' ? <ShieldAlert className="w-5 h-5" /> : "👍"}
                    {kycStatus === 'approved' ? 'KYC Done' : 
                     kycStatus === 'verified' ? 'KYC Verified' : 
                     kycStatus === 'pending' ? 'Pending' : 
                     kycStatus === 'pending approval' ? 'Pending Approval' : 
                     profileData?.payment?.status === 'paid' ? 'Continue KYC' : 
                     'Complete Your Verification'}
                  </button>
                )}


                {/* Edit/Save/Cancel buttons */}
                {isEditing ? (
                  <>
                    <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Edit Profile</button>
                )}
              </div>
            </div>
          </div>
          <div className="relative flex-1 bg-gray-50 min-h-full">
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                <Loader message="Loading your profile..." />
              </div>
            )}
            {error && !loading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <p className="text-red-600 font-medium text-lg">Error: {error}</p>
              </div>
            )}
            {!loading && !error && !profileData && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <p className="text-gray-600 font-medium text-lg">No profile data found.</p>
              </div>
            )}
            {!loading && !error && profileData && (
          <div className="p-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                  {isEditing ? (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      {previewUrl || (profileData && (profileData._id || profileData.profileImage)) ? (
                        <img
                          src={getProfilePicUrl()}
                          alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-bold text-3xl">
                          {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfilePicFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <span className="text-xs mt-1 bg-white bg-opacity-60 rounded px-2 py-1 text-blue-700">Change</span>
                    </label>
                  ) : (
                    (profileData && (profileData._id || profileData.profileImage)) ? (
                      <img src={getProfilePicUrl()} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
                      </span>
                    )
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input type="text" value={profileData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your name" />
                      <input type="text" value={profileData.headline || ''} onChange={(e) => handleInputChange('headline', e.target.value)} className="text-lg text-gray-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your profile headline" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                      <p className="text-lg text-gray-600 mb-4">{profileData.headline}</p>
                    </>
                  )}

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-4">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} />
                      {isEditing ? (
                        <input type="email" value={profileData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter email" />
                      ) : (
                        <span>{profileData.email}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} />
                      {isEditing ? (
                        <input type="tel" value={profileData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter phone" />
                      ) : (
                        <span>{profileData.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      {isEditing ? (
                        <input type="text" value={profileData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter location" />
                      ) : (
                        <span>{profileData.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Career Objective */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2 text-red-600" size={20} />
                Career Objective
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.careerObjective || ''}
                  onChange={(e) => handleInputChange('careerObjective', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Describe your career objectives and goals..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profileData.careerObjective}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Student ID', field: 'studentId', icon: '🆔' },
                    { label: 'Date of Birth', field: 'dateOfBirth', icon: '📅', type: 'date' },
                    { label: 'Gender', field: 'gender', icon: '👤' },
                    { label: 'Nationality', field: 'nationality', icon: '🌍' }
                  ].map(({ label, field, icon, type }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      {isEditing ? (
                        <input
                          type={type || "text"}
                          value={profileData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">{profileData[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
                  {/* Academic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="mr-2 text-green-600" size={20} />
                  Academic Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Degree', field: 'degree', icon: '🎓' },
                    { label: 'Major', field: 'major', icon: '📚' },
                    { label: 'Batch', field: 'batch', icon: '🎒' },
                    { label: 'Joining Year', field: 'joiningYear', icon: '🔰', type: 'number' },
                    { label: 'Graduation Year', field: 'graduationYear', icon: '🎓', type: 'number' },
                    { label: 'Year', field: 'year', icon: '📖', type: 'number' },
                    { label: 'GPA', field: 'gpa', icon: '📊', type: 'number' },
                    { label: 'CGPA', field: 'cgpa', icon: '📈', type: 'number' }
                  ].map(({ label, field, icon, type }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      {isEditing ? (
                        <input
                          type={type || (typeof profileData[field] === "number" ? "number" : "text")}
                          value={profileData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                          {profileData[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Skills & Tech */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Technologies</h3>
                <div className="space-y-2">
                  {['skills', 'programmingLanguages', 'technologies'].map(field =>
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={Array.isArray(profileData[field]) ? profileData[field].join(', ') : (profileData[field] || '')}
                          onChange={e => {
                            const value = e.target.value;
                            // Store as string while typing for better UX
                            handleInputChange(field, value);
                          }}
                          onBlur={e => {
                            // When losing focus, convert to array and clean up
                            const value = e.target.value;
                            const items = value.split(',')
                              .map(item => item.trim())
                              .filter(item => item.length > 0);
                            handleInputChange(field, items);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                          placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} (comma separated)`}
                        />
                      ) : (
                        <p className="bg-gray-50 p-3 rounded">{renderArray(profileData[field])}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

                  {/* Resume & Portfolio */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resume & Portfolio</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume (link)</label>
                    {isEditing ? (
                      <input type="text" value={profileData.resume || ''} onChange={e => handleInputChange('resume', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://your-resume-link" />
                    ) : (
                      profileData.resume
                        ? <a className="text-blue-600 underline" href={profileData.resume} target="_blank" rel="noopener noreferrer">{profileData.resume}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    {isEditing ? (
                      <input type="text" value={profileData.portfolioUrl || ''} onChange={e => handleInputChange('portfolioUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://your-portfolio-link" />
                    ) : (
                      profileData.portfolioUrl
                        ? <a className="text-blue-600 underline" href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer">{profileData.portfolioUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    {isEditing ? (
                      <input type="text" value={profileData.githubUrl || ''} onChange={e => handleInputChange('githubUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://github.com/your-profile" />
                    ) : (
                      profileData.githubUrl
                        ? <a className="text-blue-600 underline" href={profileData.githubUrl} target="_blank" rel="noopener noreferrer">{profileData.githubUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {isEditing ? (
                      <input type="text" value={profileData.linkedinUrl || ''} onChange={e => handleInputChange('linkedinUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://linkedin.com/in/your-profile" />
                    ) : (
                      profileData.linkedinUrl
                        ? <a className="text-blue-600 underline" href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">{profileData.linkedinUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

                {/* Projects, Achievements, Certifications, Extracurricular, Research, Hackathons */}
            <ArraySection
              label="Projects"
              field="projects"
              fields={PROJECT_FIELDS}
              emptyObj={{ title: "", description: "", technologies: [], startDate: "", endDate: "", link: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Achievements"
              field="achievements"
              fields={ACHIEVEMENT_FIELDS}
              emptyObj={{ title: "", description: "", date: "", issuer: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Certifications"
              field="certifications"
              fields={CERTIFICATION_FIELDS}
              emptyObj={{ name: "", issuer: "", date: "", link: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Extracurricular Activities"
              field="extracurricular"
              fields={EXTRACURRICULAR_FIELDS}
              emptyObj={{ activity: "", role: "", achievement: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Research"
              field="research"
              fields={RESEARCH_FIELDS}
              emptyObj={{ title: "", role: "", year: "", description: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Hackathons"
              field="hackathons"
              fields={HACKATHON_FIELDS}
              emptyObj={{ name: "", year: "", achievement: "", description: "" }}
               profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
        
    

      {/* KYC Dialog and Backdrop */}
      {isKycDialogOpen && (
        <>
          {/* KYC Dialog with Backdrop */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={handleKycClose}
          >
            <div 
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-6 text-white relative">
                <button
                  onClick={handleKycClose}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                  aria-label="Close dialog"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">KYC Verification</h1>
                    <p className="text-indigo-100 text-sm mt-1">Complete your identity verification</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {kycStep === 0 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Verification</h2>
                    <p className="text-gray-600 mb-6">
                      To ensure the security of your profile and get a "Verified" badge, please complete a quick KYC process. This involves a small fee for document verification via our trusted partner.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button onClick={handleKycClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                      <button onClick={handleKycNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Continue</button>
                    </div>
                  </div>
                )}

                {kycStep === 1 && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">Step 2 of 3</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        To start your KYC verification, please pay the verification fee.
                      </p>
                      <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200 transition-all duration-500 ${
                        paymentProcessing ? 'animate-pulse border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`transition-all duration-500 ${paymentProcessing ? 'animate-bounce' : ''}`}>
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <span className={`font-semibold transition-colors duration-500 ${
                              paymentProcessing ? 'text-blue-700' : 'text-gray-700'
                            }`}>Verification Fee</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-2xl font-bold transition-all duration-500 ${
                              paymentProcessing ? 'text-blue-600 animate-pulse' : 'text-green-600'
                            }`}>₹1</span>
                            {paymentProcessing && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button 
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                          paymentProcessing
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-not-allowed animate-pulse'
                            : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                        }`}
                        onClick={handlePayment} 
                        disabled={paymentProcessing}
                      >
                        {paymentProcessing ? (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="relative">
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-0 w-6 h-6 border-3 border-blue-200 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold">Processing Payment...</span>
                              <span className="text-xs text-blue-100 animate-pulse">Please wait while we connect to payment gateway</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Pay KYC Fee</span>
                          </div>
                        )}
                      </button>
                      <button 
                        className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300" 
                        onClick={handleKycBack} 
                        disabled={paymentProcessing}
                      >
                        Back
                      </button>
                    </div>
                  </>
                )}

                { profileData?.payment?.status === 'paid' && kycStep === 2 && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">Step 3 of 3</span>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-green-800">
                            {profileData?.payment?.status === 'paid' ? 'Payment Already Completed!' : 'Payment Successful!'}
                          </span>
                        </div>
                      </div>
                                              <p className="text-gray-700 leading-relaxed">
                          {profileData?.payment?.status === 'paid' 
                            ? 'Your payment has already been completed. Please select an identifier and provide its value to initiate your DigiLocker KYC verification.'
                            : 'Please select an identifier and provide its value to initiate your DigiLocker KYC verification.'
                          }
                        </p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Select Identifier
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          value={kycIdentifierType}
                          onChange={e => {
                            setKycIdentifierType(e.target.value);
                            setKycIdentifierValue(e.target.value === 'phone' ? (profileData.phone || '') : (profileData.email || ''));
                          }}
                        >
                          <option value="phone">Phone Number</option>
                          <option value="email">Email Address</option>
                        </select>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          {kycIdentifierType === 'phone' ? 'Phone Number' : 'Email Address'}
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          type={kycIdentifierType === 'phone' ? 'tel' : 'email'}
                          value={kycIdentifierValue}
                          onChange={e => setKycIdentifierValue(e.target.value)}
                          placeholder={kycIdentifierType === 'phone' ? 'Enter phone number' : 'Enter email address'}
                        />
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                        onClick={handleKycConfirm}
                      >
                        Initiate KYC Verification
                      </button>
                      <button 
                        className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300" 
                        onClick={handleKycClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {kycStep === 3 && (
                  <>
                    <div className="mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-blue-800">KYC Initiated Successfully!</span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Your KYC verification has been initiated. Please complete the process in the DigiLocker window. You will be redirected if required.
                      </p>
                    </div>
                    <button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                      onClick={handleKycClose}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* KYC Payment Dialog Modal */}
      {isKycPaymentDialogOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[99999]"
          onClick={e => { if (e.target === e.currentTarget) closeKycPaymentDialog(); }}
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative animate-fade-in-up mx-4">
            <button
              onClick={closeKycPaymentDialog}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close dialog"
            >
              &times;
            </button>
            <h1 className="text-xl font-bold mb-4 text-gray-800">KYC Payment</h1>
            <p className="text-sm text-gray-600 mb-4">
              Please proceed to pay the KYC verification fee. You will be redirected to the payment gateway.
            </p>
            <form onSubmit={handleKycPaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="kycCustomerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  id="kycCustomerEmail"
                  name="kycCustomerEmail"
                  value={profileData?.email || ''}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md hover:shadow-lg"
                disabled={kycPaymentLoading}
              >
                {kycPaymentLoading ? 'Processing...' : 'Pay KYC Fee'}
              </button>
            </form>
            {kycPaymentMessage.text && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  kycPaymentMessage.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : kycPaymentMessage.type === 'error'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
                role="alert"
              >
                {kycPaymentMessage.text}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
            )}
    </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Profile;