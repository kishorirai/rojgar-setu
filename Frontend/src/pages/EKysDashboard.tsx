import React, { useState, useEffect } from "react";
import AppLayout from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Upload, Shield, FileText, Plus, Eye, History } from "lucide-react";
import { toast } from "sonner";

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types (unchanged)
type Document = {
  type: string;
  status: string;
  details: {
    id_number?: string;
    document_type?: string;
    gender?: string;
    image?: string;
    name?: string;
    extra_info?: {
      performance_data?: Array<{
        marksMax?: string;
        marksPractical?: string;
        code?: string;
        marksMaxTheory?: string;
        gpMax?: string;
        grade?: string;
        name?: string;
        gp?: string;
        marksTotal?: string;
        marksTheory?: string;
        marksMaxPractical?: string;
      }>;
      care_of?: string;
      updateDate?: string;
      motherName?: string;
      resultDate?: string;
      result?: string;
      issuing_authority?: string;
      marksTotal?: string;
      examinationYear?: string;
      schoolName?: string;
      status?: string;
      schoolCode?: string;
    };
    [key: string]: any;
  };
};

type Student = {
  studentId: string;
  name: string;
  email: string;
  documents: Document[];
};

type KycData = {
  verificationId?: string;
  lastUpdated?: string;
  [key: string]: any;
};

type DashboardStudent = {
  name: string;
  email: string;
  kycStatus?: string;
  kycData?: KycData;
  documents?: Document[];
  [key: string]: any;
};

const EKysDashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "https://company.rojgarsetu.org/";
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [dashboardStudents, setDashboardStudents] = useState<DashboardStudent[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [isReinitiateKycDialogOpen, setIsReinitiateKycDialogOpen] = useState(false);
  // const [isKycHistoryDialogOpen, setIsKycHistoryDialogOpen] = useState(false);
  // const [kycHistory, setKycHistory] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({
    documentType: "",
    description: "",
    uploadedFile: null as File | null
  });
  const [kycData, setKycData] = useState({
    identifier: "",
    identifierType: "email",
    templateName: ""
  });
  const [reinitiateKycData, setReinitiateKycData] = useState({
    identifier: "",
    identifierType: "email"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DashboardStudent | null>(null);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedDocIdxMap, setSelectedDocIdxMap] = useState<{[studentId: string]: number}>({});
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  // Fetch student documents
  useEffect(() => {
    const fetchStudentDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/kyc/student/documents`);
        if (!response.ok) {
          throw new Error('Failed to fetch student documents');
        }
        const data = await response.json();
        setStudents(data.students || []);
      } catch (error) {
        console.error('Error fetching student documents:', error);
        toast.error('Failed to fetch student documents');
      }
    };
    fetchStudentDocuments();
  }, []);

  // Fetch all KYC details
  useEffect(() => {
    const fetchAllKycDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/kyc/all-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const students = await response.json();
          setDashboardStudents(students);
        }
      } catch (error) {
        console.error('Error fetching all KYC details:', error);
        toast.error('Failed to fetch KYC details');
      }
    };
    fetchAllKycDetails();
  }, [token]);

  // Fetch KYC history
  // useEffect(() => {
  //   const fetchKycHistory = async () => {
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/api/kyc/history`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (response.ok) {
  //         const data = await response.json();
  //         setKycHistory(data);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching KYC history:', error);
  //       toast.error('Failed to fetch KYC history');
  //     }
  //   };
  //   fetchKycHistory();
  // }, [token]);

  // Filter students based on search query
  const filteredStudentsWithVerifiedDocs = students
    .filter(student => 
      student.documents.some(doc => doc.status === 'verified') &&
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter dashboard students based on search query
  const filteredDashboardStudents = dashboardStudents
    .filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleKycDecision = async (kycId: string, decision: string, reason?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/decision`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: kycId,
          decision,
          ...(reason && { reason })
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${decision} KYC request`);
      }

      setDashboardStudents(dashboardStudents.map(student =>
        student.kycData?.verificationId === kycId
          ? { ...student, kycStatus: data.kycStatus, kycData: data.kycData }
          : student
      ));

      toast.success(data.message);
    } catch (error: any) {
      console.error(`Error ${decision}ing KYC:`, error);
      toast.error(error.message || `Failed to ${decision} KYC request`);
    } finally {
      setIsProcessing(false);
      if (decision === 'rejected') {
        setIsRejectDialogOpen(false);
        setRejectReason("");
        setSelectedKycId(null);
      }
    }
  };

  const openRejectDialog = (kycId: string) => {
    setSelectedKycId(kycId);
    setIsRejectDialogOpen(true);
  };

  const openViewDialog = (student: DashboardStudent) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const initiateDigiKyc = async () => {
    if(kycData.identifierType !== "email" && kycData.identifierType !== "phone") {
      toast.error("Identifier type must be either email or mobile.");
      return;
    }
    if (!kycData.identifier) {
      toast.error("Please provide email or mobile number.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: kycData.identifier,
          identifier_type: kycData.identifierType,
          template_name: kycData.templateName || "ADHAAR_PAN_MARKSHEET"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsKycDialogOpen(false);
        setKycData({ identifier: "", identifierType: "email", templateName: "" });
        toast.success("KYC verification initiated successfully!");
        window.location.href = data.digilockerUrl;
      } 
      if (response.status === 400) {
        alert("KYC verification already in progress or completed. Please check your KYC status.");
        setIsKycDialogOpen(false);
      }
      else {
        const errorData = await response.json();
        toast.error(`KYC initiation failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("KYC API Error:", error);
      toast.error("Error initiating KYC verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reinitiateDigiKyc = async () => {
    if (!reinitiateKycData.identifier) {
      toast.error("Please provide email or mobile number.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/reinitiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: reinitiateKycData.identifier,
          identifier_type: reinitiateKycData.identifierType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsReinitiateKycDialogOpen(false);
        setReinitiateKycData({ identifier: "", identifierType: "email" });
        toast.success("KYC re-verification initiated successfully!");
        window.location.href = data.digilockerUrl;
      } else {
        const errorData = await response.json();
        toast.error(`KYC re-initiation failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("KYC Re-initiation Error:", error);
      toast.error("Error re-initiating KYC verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatImageSrc = (imageData) => {
    if (!imageData) return '';

    let base64String = imageData
      .replace(/preview|^[^,]+,/i, '')
      .trim();

    if (base64String.includes('base64')) {
      base64String = base64String.split('base64')[1] || base64String;
    }

    if (!base64String.startsWith('data:image/jpeg;base64,')) {
      base64String = `data:image/jpeg;base64,${base64String}`;
    }

    const base64Data = base64String.split('data:image/jpeg;base64,')[1];
    if (!base64Data || base64Data.length < 10) {
      console.error('Invalid base64 data:', imageData);
      return 'https://via.placeholder.com/150';
    }

    return base64String;
  };

  const handleCreateTicket = () => {
    if (!newTicket.documentType || !newTicket.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const ticket = {
      id: `VT${Date.now()}`,
      studentName: "Alex Johnson",
      documentType: newTicket.documentType,
      status: "pending",
      uploadedFile: newTicket.uploadedFile,
      created: new Date().toISOString().split('T')[0],
      description: newTicket.description
    };

    setTickets([ticket, ...tickets]);
    setIsCreateTicketOpen(false);
    setNewTicket({ documentType: "", description: "", uploadedFile: null });
    toast.success("Verification ticket created successfully!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewTicket({ ...newTicket, uploadedFile: file });
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const verifiedCount = dashboardStudents.filter(s => s.kycStatus === 'verified').length;
  const approvedCount = dashboardStudents.filter(s => s.kycStatus === 'approved').length;
  const pendingCount = dashboardStudents.filter(s => s.kycStatus === 'pending' || s.kycStatus === 'pending approval').length;
  const rejectedCount = dashboardStudents.filter(s => s.kycStatus === 'rejected').length;
  const missingCount = dashboardStudents.filter(s => !s.kycStatus || s.kycStatus === 'missing' || s.kycStatus === 'not started').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">KYC Dashboard</h1>
            <p className="text-gray-500">Manage and verify your documents through DigiLocker</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsKycDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Start KYC
            </Button>
            <Button 
              onClick={() => setIsReinitiateKycDialogOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Re-initiate KYC
            </Button>
            {/* <Button 
              onClick={() => setIsKycHistoryDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              View KYC History
            </Button> */}
            <Button 
              onClick={() => setIsCreateTicketOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Verification Ticket
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <Label htmlFor="search">Search Students</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{verifiedCount + approvedCount}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{rejectedCount}</h3>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Missing KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{missingCount}</h3>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentsWithVerifiedDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-center text-gray-500">No students with verified documents available.</td>
                    </tr>
                  )}
                  {filteredStudentsWithVerifiedDocs.map((student) => {
                    const verifiedDocs = student.documents.filter(doc => doc.status === 'verified');
                    const selectedDocIdx = selectedDocIdxMap[student.studentId] ?? 0;
                    const selectedDoc = verifiedDocs[selectedDocIdx] || verifiedDocs[0];
                    return (
                      <tr key={student.studentId} className="border-b">
                        <td className="px-4 py-2">{student.name}</td>
                        <td className="px-4 py-2">{student.email}</td>
                        <td className="px-4 py-2">
                          <Select
                            value={String(selectedDocIdx)}
                            onValueChange={val => setSelectedDocIdxMap(prev => ({ ...prev, [student.studentId]: Number(val) }))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select document" />
                            </SelectTrigger>
                            <SelectContent>
                              {verifiedDocs.map((doc, dIdx) => (
                                <SelectItem key={dIdx} value={String(dIdx)}>{doc.type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">{selectedDoc.status}</td>
                        <td className="px-4 py-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => { setSelectedDoc(selectedDoc); setIsDocDialogOpen(true); }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Students KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verification ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDashboardStudents
                    .slice()
                    .sort((a, b) => {
                      const statusOrder = (status: string) => {
                        if (status === 'pending' || status === 'pending approval' || status === 'requested') return 0;
                        if (status === 'verified') return 1;
                        if (status === 'approved') return 1;
                        if (!status || status === 'missing' || status === 'not started') return 2;
                        return 3;
                      };
                      const aOrder = statusOrder(a.kycStatus || 'missing');
                      const bOrder = statusOrder(b.kycStatus || 'missing');
                      return aOrder !== bOrder ? aOrder - bOrder : 0;
                    })
                    .map((student, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{student.name}</td>
                        <td className="px-4 py-2">{student.email}</td>
                        <td className="px-4 py-2">
                          <Badge className={getStatusColor(student.kycStatus || 'missing')}>
                            {student.kycStatus || 'missing'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{student.kycData?.verificationId || '-'}</td>
                        <td className="px-4 py-2">{student.kycData?.lastUpdated || '-'}</td>
                        <td className="px-4 py-2">
                          {student.kycStatus === 'pending' || student.kycStatus === 'pending approval' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => student.kycData?.verificationId && handleKycDecision(student.kycData?.verificationId, 'approved')}
                                disabled={isProcessing}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => student.kycData?.verificationId && openRejectDialog(student.kycData.verificationId)}
                                disabled={isProcessing}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => openViewDialog(student)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Ticket #{ticket.id}</h4>
                      <p className="text-sm text-gray-500">{ticket.documentType}</p>
                      <p className="text-xs text-gray-400">{ticket.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{ticket.created}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Initiate Digi KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier-type">Identifier Type</Label>
              <Select
                value={kycData.identifierType || "email"}
                onValueChange={val => setKycData({ ...kycData, identifierType: val, identifier: "" })}
              >
                <SelectTrigger id="identifier-type">
                  <SelectValue placeholder="Select identifier type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="identifier">{kycData.identifierType === "phone" ? "Mobile Number" : "Email"}</Label>
              <Input
                id="identifier"
                type={kycData.identifierType === "phone" ? "tel" : "email"}
                value={kycData.identifier}
                onChange={e => setKycData({ ...kycData, identifier: e.target.value })}
                placeholder={kycData.identifierType === "phone" ? "Enter mobile number" : "Enter email"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Template Name (Optional)</Label>
              <Input
                id="template"
                value={kycData.templateName}
                onChange={e => setKycData({ ...kycData, templateName: e.target.value })}
                placeholder="Enter template name or leave empty for default"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsKycDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={initiateDigiKyc}
              disabled={!kycData.identifier || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Start KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReinitiateKycDialogOpen} onOpenChange={setIsReinitiateKycDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Re-initiate Digi KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reinitiate-identifier-type">Identifier Type</Label>
              <Select
                value={reinitiateKycData.identifierType || "email"}
                onValueChange={val => setReinitiateKycData({ ...reinitiateKycData, identifierType: val, identifier: "" })}
              >
                <SelectTrigger id="reinitiate-identifier-type">
                  <SelectValue placeholder="Select identifier type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reinitiate-identifier">{reinitiateKycData.identifierType === "phone" ? "Mobile Number" : "Email"}</Label>
              <Input
                id="reinitiate-identifier"
                type={reinitiateKycData.identifierType === "phone" ? "tel" : "email"}
                value={reinitiateKycData.identifier}
                onChange={e => setReinitiateKycData({ ...reinitiateKycData, identifier: e.target.value })}
                placeholder={reinitiateKycData.identifierType === "phone" ? "Enter mobile number" : "Enter email"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReinitiateKycDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={reinitiateDigiKyc}
              disabled={!reinitiateKycData.identifier || isProcessing}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isProcessing ? "Processing..." : "Re-initiate KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={isKycHistoryDialogOpen} onOpenChange={setIsKycHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KYC Verification History</DialogTitle>
          </DialogHeader>
          {kycHistory ? (
            <div className="grid gap-4 py-4">
              <div>
                <Label>KYC Status</Label>
                <p className="text-sm text-gray-600">{kycHistory.kycStatus}</p>
              </div>
              <div>
                <Label>Verification ID</Label>
                <p className="text-sm text-gray-600">{kycHistory.kycData?.verificationId || '-'}</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-600">{kycHistory.lastUpdated || '-'}</p>
              </div>
              <div>
                <Label>Documents</Label>
                <ul className="text-sm text-gray-600">
                  {kycHistory.documents?.map((doc: Document, idx: number) => (
                    <li key={idx} className="mb-2">
                      <p>{doc.type} - {doc.status}</p>
                      {doc.details.id_number && (
                        <p className="text-xs">ID Number: {doc.details.id_number}</p>
                      )}
                      {doc.details.name && (
                        <p className="text-xs">Name: {doc.details.name}</p>
                      )}
                      {doc.details.document_type && (
                        <p className="text-xs">Document Type: {doc.details.document_type}</p>
                      )}
                      {doc.details.gender && (
                        <p className="text-xs">Gender: {doc.details.gender}</p>
                      )}
                      {doc.details.extra_info && (
                        <div className="text-xs">
                          <p>Extra Info:</p>
                          <ul className="ml-4 list-disc">
                            {Array.isArray(doc.details.extra_info.performance_data) && (
                              <li>
                                Performance Data:
                                <ul className="ml-4 list-circle">
                                  {doc.details.extra_info.performance_data.map((subject, idx) => (
                                    <li key={idx}>
                                      {subject.name}: {subject.marksTotal} (Grade: {subject.grade})
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            )}
                            {doc.details.extra_info.care_of && (
                              <li>Care Of: {doc.details.extra_info.care_of}</li>
                            )}
                            {doc.details.extra_info.updateDate && (
                              <li>Update Date: {doc.details.extra_info.updateDate}</li>
                            )}
                            {doc.details.extra_info.motherName && (
                              <li>Mother Name: {doc.details.extra_info.motherName}</li>
                            )}
                            {doc.details.extra_info.resultDate && (
                              <li>Result Date: {doc.details.extra_info.resultDate}</li>
                            )}
                            {doc.details.extra_info.result && (
                              <li>Result: {doc.details.extra_info.result}</li>
                            )}
                            {doc.details.extra_info.issuing_authority && (
                              <li>Issuing Authority: {doc.details.extra_info.issuing_authority}</li>
                            )}
                            {doc.details.extra_info.marksTotal && (
                              <li>Total Marks: {doc.details.extra_info.marksTotal}</li>
                            )}
                            {doc.details.extra_info.examinationYear && (
                              <li>Examination Year: {doc.details.extra_info.examinationYear}</li>
                            )}
                            {doc.details.extra_info.schoolName && (
                              <li>School Name: {doc.details.extra_info.schoolName}</li>
                            )}
                            {doc.details.extra_info.status && (
                              <li>Status: {doc.details.extra_info.status}</li>
                            )}
                            {doc.details.extra_info.schoolCode && (
                              <li>School Code: {doc.details.extra_info.schoolCode}</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {doc.details.image && (
                        <img
                          src={formatImageSrc(doc.details.image)}
                          alt={`${doc.type} preview`}
                          className="w-24 h-24 object-cover rounded mt-2"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No KYC history available.</p>
          )}
          <DialogFooter>
            <Button onClick={() => setIsKycHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject KYC Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectReason">Reason for Rejection</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejecting this KYC request"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setIsRejectDialogOpen(false);
              setRejectReason("");
              setSelectedKycId(null);
            }}>Cancel</Button>
            <Button
              onClick={() => selectedKycId && handleKycDecision(selectedKycId, 'rejected', rejectReason)}
              disabled={!rejectReason || isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Reject KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-50% sm:max-h-[800px] overflow-scroll">
          <DialogHeader>
            <DialogTitle>KYC Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-gray-600">{selectedStudent.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-600">{selectedStudent.email}</p>
              </div>
              <div>
                <Label>KYC Status</Label>
                <p className="text-sm text-gray-600">{selectedStudent.kycStatus || 'missing'}</p>
              </div>
              <div>
                <Label>Verification ID</Label>
                <p className="text-sm text-gray-600">{selectedStudent.kycData?.verificationId || '-'}</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-600">{selectedStudent.kycData?.lastUpdated || '-'}</p>
              </div>
              <div>
                <Label>Documents</Label>
                <ul className="text-sm text-gray-600">
                  {selectedStudent.documents?.map((doc, idx) => (
                    <li key={idx} className="mb-2 ">
                      <div className=" rounded-lg hover:bg-yellow  shadow-lg  mb-5 p-2">
                      <p className="font-bold">{doc.type} - {doc.status}</p>
                      {doc.details.image && (
                         <div className="flex-shrink-0 flex px-2 items-center w-full h-full sm:w-40">
                        <img
                          src={formatImageSrc(doc.details.image)}
                          alt={`${doc.type} preview`}
                          className="w-24 h-24 object-cover rounded mt-2"
                        />
                        </div>
                      )}
                      {doc.details.id_number && (
                        <p className="text-xs">ID Number: {doc.details.id_number}</p>
                      )}
                      {doc.details.name && (
                        <p className="text-xs">Name: {doc.details.name}</p>
                      )}
                      {doc.details.document_type && (
                        <p className="text-xs">Document Type: {doc.details.document_type}</p>
                      )}
                      {doc.details.gender && (
                        <p className="text-xs">Gender: {doc.details.gender}</p>
                      )}
                      {doc.details.extra_info && (
                        <div className="text-xs">
                          <p>Extra Info:</p>
                          <ul className="ml-4 list-disc">
                            {Array.isArray(doc.details.extra_info.performance_data) && (
                              <li>
                                Performance Data:
                                <ul className="ml-4 list-circle">
                                  {doc.details.extra_info.performance_data.map((subject, idx) => (
                                    <li key={idx}>
                                      {subject.name}: {subject.marksTotal} (Grade: {subject.grade})
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            )}
                            {doc.details.extra_info.care_of && (
                              <li>Care Of: {doc.details.extra_info.care_of}</li>
                            )}
                            {doc.details.extra_info.updateDate && (
                              <li>Update Date: {doc.details.extra_info.updateDate}</li>
                            )}
                            {doc.details.extra_info.motherName && (
                              <li>Mother Name: {doc.details.extra_info.motherName}</li>
                            )}
                            {doc.details.extra_info.resultDate && (
                              <li>Result Date: {doc.details.extra_info.resultDate}</li>
                            )}
                            {doc.details.extra_info.result && (
                              <li>Result: {doc.details.extra_info.result}</li>
                            )}
                            {doc.details.extra_info.issuing_authority && (
                              <li>Issuing Authority: {doc.details.extra_info.issuing_authority}</li>
                            )}
                            {doc.details.extra_info.marksTotal && (
                              <li>Total Marks: {doc.details.extra_info.marksTotal}</li>
                            )}
                            {doc.details.extra_info.examinationYear && (
                              <li>Examination Year: {doc.details.extra_info.examinationYear}</li>
                            )}
                            {doc.details.extra_info.schoolName && (
                              <li>School Name: {doc.details.extra_info.schoolName}</li>
                            )}
                            {doc.details.extra_info.status && (
                              <li>Status: {doc.details.extra_info.status}</li>
                            )}
                            {doc.details.extra_info.schoolCode && (
                              <li>School Code: {doc.details.extra_info.schoolCode}</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      </div>
                    </li> 
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              setSelectedStudent(null);
            }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Document Verification Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={newTicket.documentType}
                onValueChange={(value) => setNewTicket({...newTicket, documentType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                  <SelectItem value="PAN Card">PAN Card</SelectItem>
                  <SelectItem value="10th Marksheet">10th Marksheet</SelectItem>
                  <SelectItem value="12th Marksheet">12th Marksheet</SelectItem>
                  <SelectItem value="Degree Certificate">Degree Certificate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-upload">Upload Document (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                {newTicket.uploadedFile && (
                  <span className="text-sm text-gray-600">{newTicket.uploadedFile.name}</span>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Describe your verification request or any issues you're facing" 
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCreateTicketOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={!newTicket.documentType || !newTicket.description}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="sm:max-w-70% sm:max-h-[800px] overflow-scroll">
          <DialogHeader className="">
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8 transition-all duration-300">
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <Label className="text-xs text-gray-500">Type</Label>
                  <p className="text-base font-semibold text-gray-800">{selectedDoc.type}</p>
                </div>
                <div className="mb-4">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <p className="text-base text-gray-700">{selectedDoc.status}</p>
                </div>
                {selectedDoc.details.id_number && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500">ID Number</Label>
                    <p className="text-base text-gray-700">{selectedDoc.details.id_number}</p>
                  </div>
                )}
                {selectedDoc.details.name && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500">Name</Label>
                    <p className="text-base text-gray-700">{selectedDoc.details.name}</p>
                  </div>
                )}
                {selectedDoc.details.document_type && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500">Document Type</Label>
                    <p className="text-base text-gray-700">{selectedDoc.details.document_type}</p>
                  </div>
                )}
                {selectedDoc.details.gender && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500">Gender</Label>
                    <p className="text-base text-gray-700">{selectedDoc.details.gender}</p>
                  </div>
                )}
                {selectedDoc.details.extra_info && (
                  <div className="mb-4">
                    <Label className="text-xs text-gray-500">Extra Info</Label>
                    <ul className="text-sm text-gray-600 ml-4 list-disc">
                      {Array.isArray(selectedDoc.details.extra_info.performance_data) && (
                        <li>
                          <span className="font-medium">Performance Data:</span>
                          <ul className="ml-4 list-circle">
                            {selectedDoc.details.extra_info.performance_data.map((subject, idx) => (
                              <li key={idx}>
                                {subject.name}: {subject.marksTotal} (Grade: {subject.grade})
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                      {selectedDoc.details.extra_info.care_of && (
                        <li>Care Of: {selectedDoc.details.extra_info.care_of}</li>
                      )}
                      {selectedDoc.details.extra_info.updateDate && (
                        <li>Update Date: {selectedDoc.details.extra_info.updateDate}</li>
                      )}
                      {selectedDoc.details.extra_info.motherName && (
                        <li>Mother Name: {selectedDoc.details.extra_info.motherName}</li>
                      )}
                      {selectedDoc.details.extra_info.resultDate && (
                        <li>Result Date: {selectedDoc.details.extra_info.resultDate}</li>
                      )}
                      {selectedDoc.details.extra_info.result && (
                        <li>Result: {selectedDoc.details.extra_info.result}</li>
                      )}
                      {selectedDoc.details.extra_info.issuing_authority && (
                        <li>Issuing Authority: {selectedDoc.details.extra_info.issuing_authority}</li>
                      )}
                      {selectedDoc.details.extra_info.marksTotal && (
                        <li>Total Marks: {selectedDoc.details.extra_info.marksTotal}</li>
                      )}
                      {selectedDoc.details.extra_info.examinationYear && (
                        <li>Examination Year: {selectedDoc.details.extra_info.examinationYear}</li>
                      )}
                      {selectedDoc.details.extra_info.schoolName && (
                        <li>School Name: {selectedDoc.details.extra_info.schoolName}</li>
                      )}
                      {selectedDoc.details.extra_info.status && (
                        <li>Status: {selectedDoc.details.extra_info.status}</li>
                      )}
                      {selectedDoc.details.extra_info.schoolCode && (
                        <li>School Code: {selectedDoc.details.extra_info.schoolCode}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {selectedDoc.details.image && (
                <div className="flex-shrink-0 flex justify-center items-center w-full sm:w-40">
                  <img
                    src={formatImageSrc(selectedDoc.details.image)}
                    alt={`${selectedDoc.type} preview`}
                    className="w-full h-full sm:w-full sm:h-full border shadow"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDocDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EKysDashboard;