import React, { useState,useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Briefcase, Building, MapPin, Calendar, Edit, Trash2, Eye, Download, History, Save } from "lucide-react";
import { toast } from "sonner";
import axios from "axios"
interface JobListing {
  id: string;
  title: string;
  company: string;
  type: 'job' | 'internship';
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  deadline: string;
  status: 'active' | 'closed' | 'draft';
  applicants: number;
}

const Sales = () => {

    const token = localStorage.getItem("token");
  if(!token){
    window.location.href = "https://company.rojgarsetu.org/";
  }
  console.log("Token:", token);

 const [jobListings, setJobListings] = useState<JobListing[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("https://campusadmin.onrender.com/api/jobs/"); // Replace with your actual endpoint
        const dataFromAPI = res.data; // assuming it returns an array of jobs

        const formattedJobs: JobListing[] = dataFromAPI.map((job: any) => ({
          id: job._id,
          title: job.title,
          company: job.companyId?.name || "Unknown Company", // assuming companyId has a name field
          type: 'job', // or 'internship' if you have a field for this
          location: job.mode === 'onsite' ? "Onsite - India" : "Remote", // or derive from another field
          salary: `₹${job.salary?.toLocaleString()}`,
          description: job.description,
          requirements: [
            `Technical Score: ${job.feedback?.technicalScore}/5`,
            `Communication: ${job.feedback?.communicationScore}/5`,
            `Problem Solving: ${job.feedback?.problemSolvingScore}/5`,
            `Comment: ${job.feedback?.comments || 'No comment'}`
          ],
          postedDate: new Date(job.startDate).toISOString().split('T')[0],
          deadline: new Date(job.createdAt).toISOString().split('T')[0], // adjust as needed
          status: job.status === 'offered' ? 'active' : 'draft',
          applicants: Math.floor(Math.random() * 100) // dummy value unless API returns this
        }));
            setJobListings(formattedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isApplicationsDialogOpen, setIsApplicationsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [selectedJobForApps, setSelectedJobForApps] = useState<JobListing | null>(null);
  const [newListing, setNewListing] = useState({
    title: "",
    company: "",
    type: "job" as 'job' | 'internship',
    location: "",
    salary: "",
    description: "",
    requirements: "",
    deadline: ""
  });

  // Auto-save functionality
  const [draftSaved, setDraftSaved] = useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (newListing.title || newListing.description) {
        localStorage.setItem('listingDraft', JSON.stringify(newListing));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [newListing]);

  const handleCreateListing = () => {
    if (!newListing.title || !newListing.company || !newListing.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const listing: JobListing = {
      id: `${newListing.type === 'job' ? 'J' : 'I'}${Date.now().toString().slice(-3)}`,
      title: newListing.title,
      company: newListing.company,
      type: newListing.type,
      location: newListing.location,
      salary: newListing.salary,
      description: newListing.description,
      requirements: newListing.requirements.split(',').map(req => req.trim()),
      postedDate: new Date().toISOString().split('T')[0],
      deadline: newListing.deadline,
      status: "active",
      applicants: 0
    };

    setJobListings([listing, ...jobListings]);
    setIsCreateDialogOpen(false);
    setNewListing({
      title: "",
      company: "",
      type: "job",
      location: "",
      salary: "",
      description: "",
      requirements: "",
      deadline: ""
    });
    localStorage.removeItem('listingDraft');
    toast.success(`${newListing.type === 'job' ? 'Job' : 'Internship'} listing created successfully!`);
  };

  const handleEditListing = () => {
    if (!editingJob) return;

    const updatedListings = jobListings.map(job => 
      job.id === editingJob.id ? editingJob : job
    );
    
    setJobListings(updatedListings);
    setIsEditDialogOpen(false);
    setEditingJob(null);
    toast.success("Listing updated successfully!");
  };

  const handleDeleteListing = (id: string) => {
    setJobListings(jobListings.filter(job => job.id !== id));
    toast.success("Listing deleted successfully!");
  };

  const handleExportData = (format: 'excel' | 'pdf') => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`);
    // In a real app, this would generate and download the file
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('listingDraft');
    if (draft) {
      setNewListing(JSON.parse(draft));
      toast.success("Draft loaded successfully!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'job' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sales & Job Management</h1>
            <p className="text-gray-500">Manage job postings and internship opportunities</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsHistoryDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Listing
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.filter(j => j.type === 'job').length}</h3>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Internships</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.filter(j => j.type === 'internship').length}</h3>
                </div>
                <Building className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.filter(j => j.status === 'active').length}</h3>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.reduce((sum, job) => sum + job.applicants, 0)}</h3>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportData('excel')}>
                Export as Excel
              </Button>
              <Button variant="outline" onClick={() => handleExportData('pdf')}>
                Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all">All Listings</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="internship">Internships</TabsTrigger>
            <TabsTrigger value="active">Active Only</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {jobListings.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <button 
                            onClick={() => {
                              setSelectedJobForApps(job);
                              setIsApplicationsDialogOpen(true);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            {job.applicants} applicants
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="job">
            <div className="grid gap-4">
              {jobListings.filter(job => job.type === 'job').map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="internship">
            <div className="grid gap-4">
              {jobListings.filter(job => job.type === 'internship').map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="grid gap-4">
              {jobListings.filter(job => job.status === 'active').map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Listing Dialog - Fixed styling */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-gray-900 text-lg font-semibold">Create New Job/Internship Listing</DialogTitle>
            {draftSaved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Save className="h-4 w-4" />
                Draft saved automatically
              </div>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">Job Title *</Label>
                <Input 
                  id="title" 
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  placeholder="e.g. Software Engineer"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-gray-700 font-medium">Type</Label>
                <Select
                  value={newListing.type}
                  onValueChange={(value) => setNewListing({...newListing, type: value as 'job' | 'internship'})}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company" className="text-gray-700 font-medium">Company *</Label>
                <Input 
                  id="company" 
                  value={newListing.company}
                  onChange={(e) => setNewListing({...newListing, company: e.target.value})}
                  placeholder="Company name"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                <Input 
                  id="location" 
                  value={newListing.location}
                  onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  placeholder="e.g. Bangalore, India"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salary" className="text-gray-700 font-medium">Salary/Stipend</Label>
                <Input 
                  id="salary" 
                  value={newListing.salary}
                  onChange={(e) => setNewListing({...newListing, salary: e.target.value})}
                  placeholder="e.g. ₹8-12 LPA or ₹15,000/month"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline" className="text-gray-700 font-medium">Application Deadline</Label>
                <Input 
                  id="deadline" 
                  type="date"
                  value={newListing.deadline}
                  onChange={(e) => setNewListing({...newListing, deadline: e.target.value})}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">Job Description *</Label>
              <Textarea 
                id="description" 
                value={newListing.description}
                onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                placeholder="Describe the role, responsibilities, and company"
                rows={4}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements" className="text-gray-700 font-medium">Requirements (comma-separated)</Label>
              <Textarea 
                id="requirements" 
                value={newListing.requirements}
                onChange={(e) => setNewListing({...newListing, requirements: e.target.value})}
                placeholder="e.g. React.js, Node.js, MongoDB, 2+ years experience"
                rows={3}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            {localStorage.getItem('listingDraft') && (
              <Button variant="outline" onClick={loadDraft}>Load Draft</Button>
            )}
            <Button 
              onClick={handleCreateListing}
              disabled={!newListing.title || !newListing.company || !newListing.description}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Listing Dialog - Fixed styling */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-gray-900 text-lg font-semibold">Edit Listing</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title" className="text-gray-700 font-medium">Job Title</Label>
                  <Input 
                    id="edit-title" 
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status" className="text-gray-700 font-medium">Status</Label>
                  <Select
                    value={editingJob.status}
                    onValueChange={(value) => setEditingJob({...editingJob, status: value as 'active' | 'closed' | 'draft'})}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-gray-700 font-medium">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleEditListing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white border border-gray-200 shadow-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-gray-900 text-lg font-semibold">Listing History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {jobListings.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <p className="text-xs text-gray-500">Posted: {job.postedDate}</p>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog open={isApplicationsDialogOpen} onOpenChange={setIsApplicationsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-gray-900 text-lg font-semibold">
              Applications for {selectedJobForApps?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {Array.from({ length: selectedJobForApps?.applicants || 0 }, (_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">Applicant {i + 1}</h5>
                      <p className="text-sm text-gray-600">Applied 2 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button onClick={() => setIsApplicationsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Sales;
