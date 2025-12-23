import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, MapPin, Clock, DollarSign, Eye, X, Calendar, Users, Building, Award } from 'lucide-react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import API from '../api';
import { SidebarContext } from './Sidebar';
import Loader from '../components/Loader';

const Jobs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationJob, setApplicationJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    availability: ''
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError && setError(null);

      // Fetch jobs from the roles model with pagination
      const response = await API.get('/api/roles', {
        params: { page: currentPage, limit: 10 }
      });

      if (Array.isArray(response.data)) {
        setJobs(response.data);
        // If backend doesn't return pagination, estimate it
        setPagination(prev => ({ ...prev, currentPage, totalPages: response.data.length === 10 ? currentPage + 1 : currentPage }));
      } else if (response.data && Array.isArray(response.data.roles)) {
        setJobs(response.data.roles);
        setPagination({
          currentPage: response.data.currentPage || currentPage,
          totalPages: response.data.totalPages || 1
        });
      } else {
        setJobs([]);
        setPagination({ totalPages: 1, currentPage: 1 });
        setError && setError('No jobs found.');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError && setError('Failed to fetch jobs. Please try again later.');
      setJobs([]);
      setPagination({ totalPages: 1, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (job) => {
    try {
      if (!job.responsibilities || job.responsibilities.length === 0) {
        const response = await API.get(`/api/studentJobs/${job._id}`);
        if (response.data.success) {
          setSelectedJob(response.data.job);
        } else {
          setSelectedJob(job);
        }
      } else {
        setSelectedJob(job);
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setSelectedJob(job);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/api/student/me'); // Adjust endpoint if needed
      if (res.data && (res.data.name || res.data.email)) {
        setApplicationData(prev => ({
          ...prev,
          fullName: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

  const handleApplyNow = (job) => {
    setApplicationJob(job);
    setShowApplicationModal(true);
    fetchUserProfile(); // Fetch and fill user data
    if (showModal) {
      setShowModal(false);
    }
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setApplicationJob(null);
    setApplicationData({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      experience: '',
      availability: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);

      const res = await API.post(
        `/api/studentapplications/${applicationJob._id}/apply`,
        applicationData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        const jobTitle = applicationJob.jobTitle || applicationJob.title || 'Job';
        const companyName = (applicationJob.companyId && applicationJob.companyId.name) || applicationJob.company || 'Company';
        alert(`Application submitted successfully for ${jobTitle} at ${companyName}!`);
        closeApplicationModal();
        fetchJobs();
      } else {
        alert(res.data.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setSelectedFilter(newFilter);
    setCurrentPage(1);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
    <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-lg">
              <Loader message="Loading jobs..." />
            </div>
          )}
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold">Rojgar Setu</span>
        </div>
        <main className="flex-1 bg-gray-50 min-h-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center space-x-4">
              <Briefcase className="text-gray-600" size={20} />
              <h1 className="text-lg font-medium text-gray-900">Jobs & Internships</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={selectedFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="internship">Internships</option>
                    <option value="job">Full-time Jobs</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-xl border border-gray-200 p-6 shadow hover:shadow-lg transition-shadow duration-200 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-900 mb-1">{job.jobTitle}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1"><MapPin size={16} />{job.location}</span>
                          {job.jobType === 'job' ? (
                            <span className="flex items-center gap-1"><DollarSign size={16} />{job.ctc ? `CTC: ₹${job.ctc}` : 'CTC: N/A'}</span>
                          ) : (
                            <span className="flex items-center gap-1"><DollarSign size={16} />{job.stipend ? `₹${job.stipend}` : 'N/A'}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock size={16} />{job.duration}</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                            ${job.jobType === 'internship' ? 'bg-green-100 text-green-800' :
                              job.jobType === 'full-time' ? 'bg-blue-100 text-blue-800' :
                              job.jobType === 'part-time' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'}`}>
                            {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                            ${job.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                              job.status === 'closed' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          <span className="text-sm font-medium text-gray-900 mr-2">Skills:</span>
                          {job.skills && job.skills.map((skill, i) => (
                            <span key={skill + i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-[120px] md:pl-4 mt-2 md:mt-0">
                        <span className="text-base font-semibold text-blue-700 whitespace-nowrap">{job.companyId?.name}</span>
                        <div className="flex gap-2 mt-3 md:mt-6">
                      <button
                        onClick={() => handleViewDetails(job)}
                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-normal text-sm"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleApplyNow(job)}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-normal text-sm"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                    </div>
                    {/* Bottom row: Posted at (left) and Updated at (right) */}
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                      <span>
                        {job.createdAt && (
                          <>Posted at {new Date(job.createdAt).toLocaleDateString()}</>
                        )}
                        </span>
                      <span>
                        {job.updatedAt && (
                          <>Updated at {new Date(job.updatedAt).toLocaleDateString()}</>
                        )}
                        </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
              <div className="flex justify-center mt-8">
                <button
                  className="px-4 py-2 mx-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>
                <span className="px-4 py-2 mx-1">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button
                  className="px-4 py-2 mx-1 bg-blue-100 text-blue-700 rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>

            {filteredJobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Job Details Modal */}
          {showModal && selectedJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600">{selectedJob.company}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Job Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedJob.location}</p>
                      </div>
                    </div>
                      <div className="flex items-center space-x-2">
                        <Building size={18} className="text-gray-500" />
                        {selectedJob.companyId?.logo || selectedJob.companyId?.profileImage ? (
                          <img
                            src={selectedJob.companyId?.logo || selectedJob.companyId?.profileImage}
                            alt="Company Logo"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Building size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Company</p>
                          <p className="font-medium">{selectedJob.company || selectedJob.companyId?.name || 'N/A'}</p>
                        </div>
                      </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={18} className="text-gray-500" />
                      <div>
                          <p className="text-sm text-gray-500">{selectedJob.jobType === 'job' ? 'CTC' : 'Stipend'}</p>
                          <p className="font-medium">
                            {selectedJob.jobType === 'job'
                              ? (selectedJob.ctc ? `₹${selectedJob.ctc}` : 'N/A')
                              : (selectedJob.stipend ? `₹${selectedJob.stipend}` : 'N/A')}
                          </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{selectedJob.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Applicants</p>
                        <p className="font-medium">{selectedJob.applicants}</p>
                      </div>
                    </div>
                      {/* Posted at */}
                      <div className="flex items-center space-x-2">
                        <Calendar size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Posted at</p>
                          <p className="font-medium">{selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      {/* Job Type */}
                      <div className="flex items-center space-x-2">
                        <Briefcase size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Job Type</p>
                          <p className="font-medium">{selectedJob.jobType ? selectedJob.jobType.charAt(0).toUpperCase() + selectedJob.jobType.slice(1) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    {/* Posted at and Updated at row */}
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                      <span>
                        {selectedJob.createdAt && (
                          <>Posted at {new Date(selectedJob.createdAt).toLocaleDateString()}</>
                        )}
                      </span>
                      <span>
                        {selectedJob.updatedAt && (
                          <>Updated at {new Date(selectedJob.updatedAt).toLocaleDateString()}</>
                        )}
                      </span>
                  </div>

                  {/* Job Description */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* Key Responsibilities */}
                  {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h3>
                      <ul className="space-y-2">
                        {selectedJob.responsibilities.map((responsibility, i) => (
                          <li key={responsibility + i} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications */}
                  {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Qualifications</h3>
                      <ul className="space-y-2">
                        {selectedJob.qualifications.map((qualification, i) => (
                          <li key={qualification + i} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{qualification}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                    {/* Requirements */}
                  <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {selectedJob.requirements && selectedJob.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                  </div>

                  {/* Benefits */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedJob.benefits.map((benefit, i) => (
                          <div key={benefit + i} className="flex items-center space-x-2">
                            <Award size={16} className="text-green-600" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About Company */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Building size={20} />
                      <span>About {selectedJob.company}</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.aboutCompany}</p>
                  </div>

                  {/* Application Details */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Application Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Start Date: </span>
                        <span className="text-blue-800">{selectedJob.startDate}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Posted: </span>
                        <span className="text-blue-800">{selectedJob.posted}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Job Type: </span>
                        <span className="text-blue-800">{selectedJob.type}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Applications: </span>
                        <span className="text-blue-800">{selectedJob.applicants} received</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-normal text-sm"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleApplyNow(selectedJob)}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-normal text-sm"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Modal */}
          {showApplicationModal && applicationJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Application Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
                    <p className="text-lg text-gray-600">{applicationJob.title} at {applicationJob.company}</p>
                  </div>
                  <button
                    onClick={closeApplicationModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmitApplication} className="p-6">
                  {/* Personal Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={applicationData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={applicationData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={applicationData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Background</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relevant Experience
                      </label>
                      <textarea
                        name="experience"
                        value={applicationData.experience}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your relevant experience, projects, or skills..."
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why are you interested in this position?
                      </label>
                      <textarea
                        name="coverLetter"
                        value={applicationData.coverLetter}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us why you're the perfect fit for this role..."
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        When can you start?
                      </label>
                      <select
                        name="availability"
                        value={applicationData.availability}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select availability</option>
                        <option value="immediately">Immediately</option>
                        <option value="1-week">Within 1 week</option>
                        <option value="2-weeks">Within 2 weeks</option>
                        <option value="1-month">Within 1 month</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Job Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Position:</span> {applicationJob.jobTitle || applicationJob.title || "N/A"}</p>
                      <p><span className="font-medium">Company:</span> {(applicationJob.companyId && applicationJob.companyId.name) || applicationJob.company || "N/A"}</p>
                      <p><span className="font-medium">Location:</span> {applicationJob.location || "N/A"}</p>
                      <p><span className="font-medium">Type:</span> {applicationJob.jobType ? applicationJob.jobType.charAt(0).toUpperCase() + applicationJob.jobType.slice(1) : applicationJob.type || "N/A"}</p>
                      <p><span className="font-medium">Salary:</span> {applicationJob.ctc ? `₹${applicationJob.ctc}` : applicationJob.stipend ? `₹${applicationJob.stipend}` : applicationJob.salary ? `₹${applicationJob.salary}` : "N/A"}</p>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={closeApplicationModal}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-normal text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-normal text-sm"
                      disabled={applying}
                    >
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </SidebarContext.Provider>
  );
};

export default Jobs;