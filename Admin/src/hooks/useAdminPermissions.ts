import { useState, useEffect } from 'react';

interface AdminData {
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export const useAdminPermissions = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminDataString = localStorage.getItem('adminData');
    if (adminDataString) {
      try {
        const data = JSON.parse(adminDataString);
        setAdminData(data);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
    setLoading(false);
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!adminData) return false;
    return adminData.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!adminData) return false;
    return permissions.some(permission => adminData.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!adminData) return false;
    return permissions.every(permission => adminData.permissions.includes(permission));
  };

  const isAdmin = (): boolean => {
    return adminData?.role === 'admin';
  };

  const isEmployee = (): boolean => {
    return adminData?.role === 'employee';
  };

  return {
    adminData,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isEmployee
  };
}; 