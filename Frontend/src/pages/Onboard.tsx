import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, School, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import{ Badge } from "@/components/ui/badge";
import { saveAs } from "file-saver";

interface Student {
  id: string;
  _id?: string;
  name: string;
  email: string;
  enrollmentDate: string;
  iskycVerified: boolean;
  college: string;
  createdAt: string; // Assuming createdAt is a string in ISO format
}

interface College {
  id: string;
  _id?: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
}

interface Company {
  id: string;
  _id?: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// const API_URL = 'http://localhost:5000';

// Helper to get sales username from localStorage
const getSalesUserName = () => localStorage.getItem("userName") || "";

// Helper to convert array of objects to CSV string
function arrayToCSV(data: any[], columns: string[]): string {
  const header = columns.join(",");
  const rows = data.map(row =>
    columns.map(col => JSON.stringify(row[col] ?? "")).join(",")
  );
  return [header, ...rows].join("\r\n");
}

function exportCSV(data: any[], columns: string[], filename: string, mapFn?: (row: any) => any) {
  const mapped = mapFn ? data.map(mapFn) : data;
  const csv = arrayToCSV(mapped, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}

// Helper to format date
function formatEnrollmentDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

const Onboard = () => {
  const token = localStorage.getItem("token");
  let salesId = "";
  let salesUserName = "";
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      salesId = decoded.salesId || "";
      salesUserName = decoded.firstName + " " + decoded.lastName || "";
    } catch (e) {
      salesId = "";
    }
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "students" | "colleges" | "companies">("all");

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [newCollege, setNewCollege] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [newCompany, setNewCompany] = useState({
    name: "",
    contactEmail: "",
    contactPhone: ""
  });

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [stuRes, colRes, comRes] = await Promise.all([
          axios.get(`${API_URL}/api/sales/students`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/sales/colleges`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/sales/companies`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        console.log("Fetched students:", stuRes.data);
        console.log("Fetched colleges:", colRes.data);
        console.log("Fetched companies:", comRes.data);
        setStudents(stuRes.data);
        setColleges(colRes.data);
        setCompanies(comRes.data);
      } catch (err) {
        toast.error("Failed to fetch entities");
      }
    };
    fetchEntities();
  }, []);

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const userName = localStorage.getItem("userName");
      console.log("API_URL", API_URL, 'token', token);
      await axios.post(
        `${API_URL}/api/sales/student`,
        { ...newStudent},
        { headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        } },
        
      );
      toast.success("Student added successfully!");
      setIsAddStudentOpen(false);
      setNewStudent({ name: "", email: "", password: "" });
      await fetchEntities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add student");
    }
  };

  const handleAddCollege = async () => {
    if (!newCollege.name || !newCollege.code || !newCollege.contactEmail || !newCollege.contactPhone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // const userName = localStorage.getItem("userName");
    try {
      await axios.post(
        `${API_URL}/api/sales/college`,
        { ...newCollege},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("College added successfully!");
      setIsAddCollegeOpen(false);
      setNewCollege({ name: "", code: "", contactEmail: "", contactPhone: "" });
      await fetchEntities();
    } catch (err: any) {
      console.error("Error adding college:", err);
      toast.error(err.response?.data?.message || "Failed to add college");
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.contactEmail || !newCompany.contactPhone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const userName = localStorage.getItem("userName");
    try {
      await axios.post(
        `${API_URL}/api/sales/company`,
        { ...newCompany, userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Company added successfully!");
      setIsAddCompanyOpen(false);
      setNewCompany({ name: "", contactEmail: "", contactPhone: "" });
      await fetchEntities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add company");
    }
  };

  const fetchEntities = async () => {
    const userName = localStorage.getItem("userName");
    if (!userName) return;
    try {
      const [stuRes, colRes, comRes] = await Promise.all([
        axios.get(`${API_URL}/api/sales/students?userName=${encodeURIComponent(userName)}`),
        axios.get(`${API_URL}/api/sales/colleges?userName=${encodeURIComponent(userName)}`),
        axios.get(`${API_URL}/api/sales/companies?userName=${encodeURIComponent(userName)}`)
      ]);
      setStudents(stuRes.data);
      setColleges(colRes.data);
      setCompanies(comRes.data);
    } catch (err) {
      toast.error("Failed to fetch entities");
    }
  };

  // const salesUserName = getSalesUserName();

  const entityCounts = {
    all: students.length + colleges.length + companies.length,
    students: students.length,
    colleges: colleges.length,
    companies: companies.length
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Onboarding Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage students, colleges, and companies with ease</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Users className="h-5 w-5" />
              Add Student
            </Button>
            <Button
              onClick={() => setIsAddCollegeOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <School className="h-5 w-5" />
              Add College
            </Button>
            <Button
              onClick={() => setIsAddCompanyOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Briefcase className="h-5 w-5" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Students', count: students.length, icon: Users, color: 'text-blue-500' },
            { label: 'Colleges', count: colleges.length, icon: School, color: 'text-blue-500' },
            { label: 'Companies', count: companies.length, icon: Briefcase, color: 'text-blue-500' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.count}</h3>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Entities List with Tabs */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Manage Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "students" | "colleges" | "companies")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-gray-100 p-2 rounded-lg">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All <Badge>{entityCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2">
                  Students <Badge>{entityCounts.students}</Badge>
                </TabsTrigger>
                <TabsTrigger value="colleges" className="flex items-center gap-2">
                  Colleges <Badge>{entityCounts.colleges}</Badge>
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  Companies <Badge>{entityCounts.companies}</Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="space-y-6">
                  {/* Students Table */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Students</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Sales Username</TableHead>
                          <TableHead className="text-gray-700">Name</TableHead>
                          <TableHead className="text-gray-700">Email</TableHead>
                          <TableHead className="text-gray-700">Enrollment Date</TableHead>
                          <TableHead className="text-gray-700">KYC Status</TableHead>
                          <TableHead className="text-gray-700">College</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                              No students found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          students.map((student) => (
                            <TableRow key={student._id || student.id} className="hover:bg-gray-100 transition-colors">
                              <TableCell className="text-gray-900">{salesUserName}</TableCell>
                              <TableCell className="text-gray-900">{student.name}</TableCell>
                              <TableCell className="text-gray-900">{student.email}</TableCell>
                              <TableCell className="text-gray-900">{formatEnrollmentDate(student.createdAt)}</TableCell>
                              <TableCell className="text-gray-900">{student.iskycVerified ? 'Verified' : 'Not Verified'}</TableCell>
                              <TableCell className="text-gray-900">{student.college}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Colleges Table */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Colleges</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Sales Username</TableHead>
                          <TableHead className="text-gray-700">Name</TableHead>
                          <TableHead className="text-gray-700">Code</TableHead>
                          <TableHead className="text-gray-700">Contact Email</TableHead>
                          <TableHead className="text-gray-700">Contact Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {colleges.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                              No colleges found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          colleges.map((college) => (
                            <TableRow key={college._id || college.id} className="hover:bg-gray-100 transition-colors">
                              <TableCell className="text-gray-900">{salesUserName}</TableCell>
                              <TableCell className="text-gray-900">{college.name}</TableCell>
                              <TableCell className="text-gray-900">{college.code}</TableCell>
                              <TableCell className="text-gray-900">{college.contactEmail}</TableCell>
                              <TableCell className="text-gray-900">{college.contactPhone}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Companies Table */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Companies</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700">Sales Username</TableHead>
                          <TableHead className="text-gray-700">Name</TableHead>
                          <TableHead className="text-gray-700">Contact Email</TableHead>
                          <TableHead className="text-gray-700">Contact Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                              No companies found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          companies.map((company) => (
                            <TableRow key={company._id || company.id} className="hover:bg-gray-100 transition-colors">
                              <TableCell className="text-gray-900">{salesUserName}</TableCell>
                              <TableCell className="text-gray-900">{company.name}</TableCell>
                              <TableCell className="text-gray-900">{company.contactEmail}</TableCell>
                              <TableCell className="text-gray-900">{company.contactPhone}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="students" className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Students</h2>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => exportCSV(
                      students,
                      ["name", "email", "enrollmentDate", "college", "iskycVerified"],
                      "students.csv",
                      (row) => ({
                        name: row.name,
                        email: row.email,
                        enrollmentDate: formatEnrollmentDate(row.createdAt),
                        college: row.college,
                        iskycVerified: row.iskycVerified
                      })
                    )}
                  >
                    Export CSV
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-700">Sales Username</TableHead>
                      <TableHead className="text-gray-700">Name</TableHead>
                      <TableHead className="text-gray-700">Email</TableHead>
                      <TableHead className="text-gray-700">Enrollment Date</TableHead>
                      <TableHead className="text-gray-700">KYC Status</TableHead>
                      <TableHead className="text-gray-700">College</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student._id || student.id} className="hover:bg-gray-100 transition-colors">
                          <TableCell className="text-gray-900">{salesUserName}</TableCell>
                          <TableCell className="text-gray-900">{student.name}</TableCell>
                          <TableCell className="text-gray-900">{student.email}</TableCell>
                          <TableCell className="text-gray-900">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(student.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                          </TableCell>
                          <TableCell className="text-gray-900">{student.iskycVerified ? "Verified" : "Not Verified"}</TableCell>
                          <TableCell className="text-gray-900">{student.college}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="colleges" className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Colleges</h2>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => exportCSV(
                      colleges,
                      ["name", "code", "contactEmail", "contactPhone", "enrollmentDate"],
                      "colleges.csv",
                      (row) => ({
                        name: row.name,
                        code: row.code,
                        contactEmail: row.contactEmail,
                        contactPhone: row.contactPhone,
                        enrollmentDate: row.createdAt ? formatEnrollmentDate(row.createdAt) : ""
                      })
                    )}
                  >
                    Export CSV
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-700">Sales Username</TableHead>
                      <TableHead className="text-gray-700">Name</TableHead>
                      <TableHead className="text-gray-700">Code</TableHead>
                      <TableHead className="text-gray-700">Contact Email</TableHead>
                      <TableHead className="text-gray-700">Contact Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colleges.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No colleges found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      colleges.map((college) => (
                        <TableRow key={college._id || college.id} className="hover:bg-gray-100 transition-colors">
                          <TableCell className="text-gray-900">{salesUserName}</TableCell>
                          <TableCell className="text-gray-900">{college.name}</TableCell>
                          <TableCell className="text-gray-900">{college.code}</TableCell>
                          <TableCell className="text-gray-900">{college.contactEmail}</TableCell>
                          <TableCell className="text-gray-900">{college.contactPhone}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="companies" className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Companies</h2>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => exportCSV(
                      companies,
                      ["name", "contactEmail", "contactPhone", "enrollmentDate"],
                      "companies.csv",
                      (row) => ({
                        name: row.name,
                        contactEmail: row.contactEmail,
                        contactPhone: row.contactPhone,
                        enrollmentDate: row.createdAt ? formatEnrollmentDate(row.createdAt) : ""
                      })
                    )}
                  >
                    Export CSV
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-700">Sales Username</TableHead>
                      <TableHead className="text-gray-700">Name</TableHead>
                      <TableHead className="text-gray-700">Contact Email</TableHead>
                      <TableHead className="text-gray-700">Contact Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No companies found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company._id || company.id} className="hover:bg-gray-100 transition-colors">
                          <TableCell className="text-gray-900">{salesUserName}</TableCell>
                          <TableCell className="text-gray-900">{company.name}</TableCell>
                          <TableCell className="text-gray-900">{company.contactEmail}</TableCell>
                          <TableCell className="text-gray-900">{company.contactPhone}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student-name" className="text-gray-700">Name</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-email" className="text-gray-700">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="Enter student email"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-password" className="text-gray-700">Password</Label>
                <Input
                  id="student-password"
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="Enter password"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddStudentOpen(false)}
                className="border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                disabled={!newStudent.name || !newStudent.email || !newStudent.password}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add College Dialog */}
        <Dialog open={isAddCollegeOpen} onOpenChange={setIsAddCollegeOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New College</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="college-name" className="text-gray-700">Name</Label>
                <Input
                  id="college-name"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                  placeholder="Enter college name"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="college-code" className="text-gray-700">College Code</Label>
                <Input
                  id="college-code"
                  value={newCollege.code}
                  onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value })}
                  placeholder="Enter college code"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="college-email" className="text-gray-700">Contact Email</Label>
                <Input
                  id="college-email"
                  type="email"
                  value={newCollege.contactEmail}
                  onChange={(e) => setNewCollege({ ...newCollege, contactEmail: e.target.value })}
                  placeholder="Enter contact email"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="college-phone" className="text-gray-700">Contact Phone</Label>
                <Input
                  id="college-phone"
                  value={newCollege.contactPhone}
                  onChange={(e) => setNewCollege({ ...newCollege, contactPhone: e.target.value })}
                  placeholder="Enter contact phone"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddCollegeOpen(false)}
                className="border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCollege}
                disabled={!newCollege.name || !newCollege.code || !newCollege.contactEmail || !newCollege.contactPhone}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Add College
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Company Dialog */}
        <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Company</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name" className="text-gray-700">Name</Label>
                <Input
                  id="company-name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Enter company name"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-email" className="text-gray-700">Contact Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={newCompany.contactEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                  placeholder="Enter contact email"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-phone" className="text-gray-700">Contact Phone</Label>
                <Input
                  id="company-phone"
                  value={newCompany.contactPhone}
                  onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                  placeholder="Enter contact phone"
                  className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddCompanyOpen(false)}
                className="border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompany}
                disabled={!newCompany.name || !newCompany.contactEmail || !newCompany.contactPhone}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Add Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Onboard;