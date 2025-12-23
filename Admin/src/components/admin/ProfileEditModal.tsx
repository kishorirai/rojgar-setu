import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProfile, uploadProfileImage } from '@/services/api';
import { toast } from 'sonner';

interface AdminData {
  _id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  phone?: string;
  profileImage?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminData: AdminData;
  onProfileUpdate: (updatedData: AdminData) => void;
}

export default function ProfileEditModal({ 
  isOpen, 
  onClose, 
  adminData, 
  onProfileUpdate 
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    username: adminData.username || '',
    email: adminData.email || '',
    phone: adminData.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      try {
        setIsLoading(true);
        const uploadResponse = await uploadProfileImage(file);
        
        // Update local data with new image URL
        const updatedData = {
          ...adminData,
          profileImage: uploadResponse.imageUrl
        };

        // Update localStorage
        localStorage.setItem('adminData', JSON.stringify(updatedData));

        // Call parent callback to update UI
        onProfileUpdate(updatedData);

        toast.success('Profile image uploaded successfully!');
        
        // Clear the selected image since it's now uploaded
        setSelectedImage(null);
        setImagePreview(null);
        
      } catch (error: any) {
        console.error('Image upload error:', error);
        toast.error(error.message || 'Failed to upload image');
        // Clear the preview if upload failed
        setSelectedImage(null);
        setImagePreview(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.newPassword && !formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required to change password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare profile data (only username, phone, password)
      const profileData: any = {
        username: formData.username,
        phone: formData.phone
      };

      if (formData.currentPassword && formData.newPassword) {
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
      }

      // Update profile
      const response = await updateProfile(profileData);

      // Update local data
      const updatedData = {
        ...adminData,
        ...response.admin
      };

      // Update localStorage
      localStorage.setItem('adminData', JSON.stringify(updatedData));

      // Call parent callback to update UI
      onProfileUpdate(updatedData);

      // Show success message using toast notification
      toast.success('Profile updated successfully!');
      onClose();

    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data to original values
    setFormData({
      username: adminData.username || '',
      email: adminData.email || '',
      phone: adminData.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : adminData.profileImage ? (
                  <img 
                    src={adminData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.textContent = adminData.username?.charAt(0)?.toUpperCase() || 'A';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {adminData.username?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isLoading ? 'Uploading image...' : 'JPG, PNG or GIF. Max size 5MB.'}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-red-500' : ''}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed for security reasons. Contact an administrator if needed.
              </p>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-600">
              Leave blank if you don't want to change your password.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={errors.currentPassword ? 'border-red-500' : ''}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? 'border-red-500' : ''}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Permissions Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {adminData.permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Updating...' : 'Update Profile Information'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 

