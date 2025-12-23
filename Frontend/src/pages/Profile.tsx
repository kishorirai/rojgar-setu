import React, { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  X,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  email: string;
  name: string; 
  role: string;
}

const Profile = () => {
  const token = localStorage.getItem("token");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@campus.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Campus Drive, University City, CA 90210",
    dateOfBirth: "1995-08-15",
    designation: "Sales Representative",
    department: "Sales & Marketing",
  });

  useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);


      setProfileData(prev => ({
        ...prev,
        firstName : decoded.firstName || "user",
        lastName : decoded.lastName || "name",
        email: decoded.email,
        designation: decoded.role,
      }));
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }
}, [token]);

  const [originalData, setOriginalData] = useState(profileData);

  const handleSave = () => {
    setIsEditing(false);
    setOriginalData(profileData);
    if (imagePreview) {
      setProfileImage(imagePreview);
      setImagePreview(null);
    }
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData(originalData);
    setImagePreview(null);
    toast.info("Changes cancelled");
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        toast.success("Image selected! Save to confirm changes.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePicture = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview(null);
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Profile picture removed");
  };

  const currentImage = imagePreview || profileImage;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-500">
              Manage your personal information and settings
            </p>
          </div>
          {isEditing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Save className="h-4 w-4" />
              <span>Editing mode active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  {currentImage ? (
                    <AvatarImage
                      src={currentImage}
                      alt="Profile"
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <button
                    onClick={handleChangePicture}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {!isEditing ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profileData.designation}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePicture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                  {currentImage && (
                    <Button variant="outline" size="sm" onClick={removeImage}>
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              )}

              {imagePreview && (
                <div className="text-center">
                  <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Preview - Save to confirm
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>
                  Your basic profile details and contact information
                </CardDescription>
              </div>
              <div className="space-x-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-gray-700 font-medium"
                  >
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`pl-10 ${
                        !isEditing
                          ? "bg-gray-50"
                          : "bg-white border-gray-300 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-gray-700 font-medium"
                  >
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`pl-10 ${
                        !isEditing
                          ? "bg-gray-50"
                          : "bg-white border-gray-300 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className={`pl-10 ${
                      !isEditing
                        ? "bg-gray-50"
                        : "bg-white border-gray-300 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className={`pl-10 ${
                      !isEditing
                        ? "bg-gray-50"
                        : "bg-white border-gray-300 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`pl-10 ${
                      !isEditing
                        ? "bg-gray-50"
                        : "bg-white border-gray-300 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-gray-700 font-medium"
                  >
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`pl-10 ${
                        !isEditing
                          ? "bg-gray-50"
                          : "bg-white border-gray-300 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="designation"
                    className="text-gray-700 font-medium"
                  >
                    Designation
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="designation"
                      value={profileData.designation}
                      onChange={(e) =>
                        handleInputChange("designation", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`pl-10 ${
                        !isEditing
                          ? "bg-gray-50"
                          : "bg-white border-gray-300 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
            <CardDescription>
              System and account related details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">January 2024</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="font-semibold text-green-700">Active</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold text-purple-700">
                {profileData.department}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
