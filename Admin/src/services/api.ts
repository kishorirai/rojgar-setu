// API service with improved error handling
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getAuthToken = () => localStorage.getItem('adminToken');

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Include cookies in the request
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    if (!response.ok) {
      console.error('API error response:', responseData);
      throw new Error(responseData.msg || responseData.message || responseData || 'API request failed');
    }
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Profile-related API functions
export const updateProfile = async (profileData: {
  username?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}) => {
  return apiRequest('/api/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

export const uploadProfileImage = async (file: File) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await fetch(`${API_URL}/api/admin/upload-profile-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || ''}`
    },
    credentials: 'include', // Include cookies in the request
    body: formData
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to upload image');
  }
  
  return responseData;
};
