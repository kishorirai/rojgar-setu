import React, { useState, useEffect } from 'react';
import { FileText, Calendar, MapPin, Building, Eye, Download, X, Clock, DollarSign, Briefcase, Mail, Phone, Globe, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { SidebarContext } from './Sidebar';
import Loader from '../components/Loader';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Applications = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: Map status to display text 
  const getStatusText = (status) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'under_review': return 'Under Review';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'offer_received': return 'Offer Received';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Helper: Map status to color classes
  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'offer_received': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch applications
  useEffect(() => {
    // const token = localStorage.getItem('token');
    async function fetchApplications() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/studentApplications/my`, {
          method: 'GET',
          credentials: 'include',
          // headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.applications)) {
          setApplications(
            data.applications.map(app => ({
              id: app._id,
              // Status & meta fields
              status: app.status,
              statusText: getStatusText(app.status),
              nextStep: app.nextStep,
              nextStepDate: app.nextStepDate,
              appliedDate: app.appliedDate,
              // Application fields
              coverLetter: app.coverLetter,
              experience: app.experience,
              availability: app.availability,
              // Job fields (from populate)
              jobTitle: app.role?.jobTitle || app.role?.title || 'N/A',
              company: app.company?.name || 'N/A',
              location: app.role?.location || 'N/A',
              salary: app.role?.ctc || app.role?.stipend || app.role?.salary || 'N/A',
              type: app.role?.jobType || app.role?.type || 'N/A',
              description: app.role?.description || 'N/A',
              requirements: app.role?.requirements || [],
              benefits: app.role?.benefits || [],
              applicationDeadline: app.role?.applicationDeadline || '',
              workSchedule: app.role?.workSchedule || 'Disclosed after interview',
              duration: app.role?.duration || 'N/A',
              contactEmail: app.role?.contactEmail || 'N/A',
              contactPhone: app.role?.contactPhone || 'N/A',
              companyWebsite: app.company?.website || 'N/A',
            }))
          );
        } else {
          setApplications([]);
        }
      } catch {
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  // Status filter options and stats
  const statusOptions = [
    { value: 'all', label: 'All Applications', count: applications.length },
    { value: 'applied', label: 'Applied', count: applications.filter(a => a.status === 'applied').length },
    { value: 'under_review', label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length },
    { value: 'interview_scheduled', label: 'Interview Scheduled', count: applications.filter(a => a.status === 'interview_scheduled').length },
    { value: 'offer_received', label: 'Offer Received', count: applications.filter(a => a.status === 'offer_received').length },
    { value: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
  ];

  // Filtered applications for current tab/status
  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Modal controls
  const handleViewDetails = (application) => setSelectedApplication(application);
  const handleCloseModal = () => setSelectedApplication(null);

  const handleDownloadOffer = (application) => {
    // Simulate offer download
    alert(`Downloading offer letter for ${application.jobTitle} at ${application.company}`);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <Loader message="Loading applications..." />
            </div>
          )}
          {/* Mobile Header */}
          <div className="lg:hidden p-4 bg-white shadow flex items-center">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold">Rojgar Setu</span>
          </div>
          <div className="p-6 bg-gray-50 min-h-screen flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications</h1>
              <p className="text-gray-600">Track and manage your job application progress</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedStatus === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500">No applications match the selected status.</p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{application.jobTitle}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {application.statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {application.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {formatDate(application.appliedDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-gray-700">
                            <strong>Type:</strong> {application.type}
                          </span>
                          <span className="text-gray-700">
                            <strong>Salary:</strong> {application.salary}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(application)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {application.status === 'offer_received' && (
                          <button 
                            onClick={() => handleDownloadOffer(application)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Offer"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {application.nextStep && (
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">Next Step: </span>
                            <span className="text-sm text-gray-700">{application.nextStep}</span>
                          </div>
                          {application.nextStepDate && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(application.nextStepDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Summary Stats */}
            {filteredApplications.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter(a => a.status === 'under_review').length}
                  </div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {applications.filter(a => a.status === 'interview_scheduled').length}
                  </div>
                  <div className="text-sm text-gray-600">Interviews</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter(a => a.status === 'offer_received').length}
                  </div>
                  <div className="text-sm text-gray-600">Offers</div>
                </div>
              </div>
            )}

            {/* Detailed View Modal */}
            {selectedApplication && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.jobTitle}</h2>
                      <p className="text-gray-600">{selectedApplication.company}</p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="p-6">
                    {/* Header Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                          {selectedApplication.statusText}
                        </span>
                        <span className="text-sm text-gray-600">Applied on {formatDate(selectedApplication.appliedDate)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-5 w-5" />
                          <span>{selectedApplication.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Briefcase className="h-5 w-5" />
                          <span>{selectedApplication.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="h-5 w-5" />
                          <span>{selectedApplication.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-5 w-5" />
                          <span>{selectedApplication.workSchedule}</span>
                        </div>
                      </div>
                    </div>
                    {/* Job Description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedApplication.description}</p>
                    </div>
                    {/* Requirements */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedApplication.requirements.map((req, index) => (
                          <li key={index} className="text-gray-700">{req}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Benefits */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedApplication.benefits.map((benefit, index) => (
                          <li key={index} className="text-gray-700">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                        <div className="space-y-2">
                          {selectedApplication.contactEmail && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${selectedApplication.contactEmail}`} className="text-blue-600 hover:underline">
                                {selectedApplication.contactEmail}
                              </a>
                            </div>
                          )}
                          {selectedApplication.contactPhone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="h-4 w-4" />
                              <span>{selectedApplication.contactPhone}</span>
                            </div>
                          )}
                          {selectedApplication.companyWebsite && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Globe className="h-4 w-4" />
                              <a href={`https://${selectedApplication.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {selectedApplication.companyWebsite}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Dates</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Application Deadline:</span>
                            <span className="text-gray-900">{formatDate(selectedApplication.applicationDeadline)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="text-gray-900">{selectedApplication.duration}</span>
                          </div>
                          {selectedApplication.nextStepDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Next Step Date:</span>
                              <span className="text-gray-900">{formatDate(selectedApplication.nextStepDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Next Steps */}
                    {selectedApplication.nextStep && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
                        <p className="text-gray-700">{selectedApplication.nextStep}</p>
                        {selectedApplication.nextStepDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            Scheduled for: {formatDate(selectedApplication.nextStepDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    {selectedApplication.status === 'offer_received' && (
                      <button
                        onClick={() => handleDownloadOffer(selectedApplication)}
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Offer Letter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Applications;