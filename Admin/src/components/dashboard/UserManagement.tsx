import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  School,
  Building2,
  GraduationCap,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Eye,
  UserCheck,
  UserX
} from "lucide-react";

// Utility function to truncate with ellipsis
function truncateWithEllipsis(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [collegeCount, setCollegeCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);

  const [collegeSearchField, setCollegeSearchField] = useState("name");
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");

  const [companySearchField, setCompanySearchField] = useState("name");
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("students");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, collegeRes, companyRes, studentCountRes, collegeCountRes, companyCountRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/students`),
          axios.get(`${API_URL}/api/admin/colleges`),
          axios.get(`${API_URL}/api/admin/companies`),
          axios.get(`${API_URL}/api/admin/student-count`),
          axios.get(`${API_URL}/api/admin/college-count`),
          axios.get(`${API_URL}/api/admin/company-count`),
        ]);

        if (studentRes.data && Array.isArray(studentRes.data.data)) {
          setStudents(studentRes.data.data);
        } else {
          setStudents([]);
        }

        if (collegeRes.data && Array.isArray(collegeRes.data.data)) {
          setColleges(collegeRes.data.data);
        } else {
          setColleges([]);
        }

        if (companyRes.data && Array.isArray(companyRes.data.data)) {
          setCompanies(companyRes.data.data);
        } else {
          setCompanies([]);
        }

        setStudentCount(studentCountRes.data.count || 0);
        setCollegeCount(collegeCountRes.data.count || 0);
        setCompanyCount(companyCountRes.data.count || 0);

      } catch (err) {
        console.error("Error fetching data:", err);
        setStudents([]);
        setColleges([]);
        setCompanies([]);
        setStudentCount(0);
        setCollegeCount(0);
        setCompanyCount(0);
      }
    };

    fetchData();
  }, []);

  // Helper to highlight search term
  function highlight(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
    );
  }

  // Filtered students based on searchField
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(student => {
      const value =
        searchField === "name" ? student.name :
        searchField === "college" ? (student.college && typeof student.college === "object" ? student.college.name : "") :
        searchField === "email" ? student.email :
        searchField === "department" ? student.department :
        searchField === "salesPerson" ? (student.salesPerson ? `${student.salesPerson.firstName} ${student.salesPerson.lastName}` : "") :
        "";
      return value && value.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [students, searchTerm, searchField]);

  const filteredAndStatusStudents = filteredStudents.filter(
    student => statusFilter === "all" || student.status === statusFilter
  );

  const filteredColleges = useMemo(() => {
    if (!collegeSearchTerm) return colleges;
    return colleges.filter(college => {
      const value =
        collegeSearchField === "name" ? college.name :
        collegeSearchField === "email" ? college.contactEmail :
        collegeSearchField === "location" ? (college.location || "") :
        collegeSearchField === "salesPerson" ? (college.salesPerson ? `${college.salesPerson.firstName} ${college.salesPerson.lastName}` : "") :
        "";
      return value && value.toLowerCase().includes(collegeSearchTerm.toLowerCase());
    });
  }, [colleges, collegeSearchTerm, collegeSearchField]);
  const filteredAndStatusColleges = filteredColleges.filter(
    college => statusFilter === "all" || college.status === statusFilter
  );

  const filteredCompanies = useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter(company => {
      const value =
        companySearchField === "name" ? company.name :
        companySearchField === "email" ? company.contactEmail :
        companySearchField === "location" ? (company.location || "") :
        companySearchField === "salesPerson" ? (company.salesPerson ? `${company.salesPerson.firstName} ${company.salesPerson.lastName}` : "") :
        "";
      return value && value.toLowerCase().includes(companySearchTerm.toLowerCase());
    });
  }, [companies, companySearchTerm, companySearchField]);
  const filteredAndStatusCompanies = filteredCompanies.filter(
    company => statusFilter === "all" || company.status === statusFilter
  );

  const userStats = [
    {
      title: "Total Students",
      value: studentCount.toString(),
      change: "+234",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "Colleges",
      value: collegeCount.toString(),
      change: "+12",
      icon: School,
      color: "text-green-600",
    },
    {
      title: "Companies",
      value: companyCount.toString(),
      change: "+89",
      icon: Building2,
      color: "text-purple-600",
    },
    // {
    //   title: "Pending Verifications",
    //   value: students.filter(s => s.status === "pending").length.toString(),
    //   change: "-5",
    //   icon: UserCheck,
    //   color: "text-orange-600",
    // },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change} this month</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>View and manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students" className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger value="colleges" className="flex items-center space-x-2">
                <School className="w-4 h-4" />
                <span>Colleges</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Companies</span>
              </TabsTrigger>
            </TabsList>

            {/* Only show search field dropdown and input in Students tab */}
            <TabsContent value="students" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 flex-1">
                  <Select value={searchField} onValueChange={setSearchField}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="salesPerson">Salesperson</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={`Search by ${searchField}`}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="flex-1 min-w-0 pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] ml-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Showing {filteredAndStatusStudents.length} result{filteredAndStatusStudents.length !== 1 ? "s" : ""}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Salesperson</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndStatusStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{searchField === "name" ? highlight(student.name, searchTerm) : student.name}</p>
                          <p className="text-sm text-gray-500">{searchField === "email" ? highlight(student.email, searchTerm) : student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.college && typeof student.college === "object"
                          ? (searchField === "college" ? highlight(student.college.name, searchTerm) : student.college.name)
                          : "-"}
                      </TableCell>
                      <TableCell>{student.rollNumber || "-"}</TableCell>
                      <TableCell>{searchField === "department" ? highlight(student.department || "-", searchTerm) : (student.department || "-")}</TableCell>
                      <TableCell>{student.batch || "-"}</TableCell>
                      <TableCell>{student.cgpa || "-"}</TableCell>
                      <TableCell>
                        {student.salesPerson
                          ? (searchField === "salesPerson"
                              ? highlight(`${student.salesPerson.firstName} ${student.salesPerson.lastName}`, searchTerm)
                              : `${student.salesPerson.firstName} ${student.salesPerson.lastName}`)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* For Colleges and Companies, keep the original search bar and logic */}
            <TabsContent value="colleges" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 flex-1">
                  <Select value={collegeSearchField} onValueChange={setCollegeSearchField}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="salesPerson">Salesperson</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={`Search by ${collegeSearchField}`}
                      value={collegeSearchTerm}
                      onChange={e => setCollegeSearchTerm(e.target.value)}
                      className="flex-1 min-w-0 pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] ml-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Showing {filteredAndStatusColleges.length} result{filteredAndStatusColleges.length !== 1 ? "s" : ""}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College Name</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Salesperson</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndStatusColleges.map((college) => {
                    const studentCount = students.filter(s => {
                      if (typeof s.college === "object") {
                        return s.college && s.college._id === college._id;
                      }
                      return s.college === college._id;
                    }).length;
                    return (
                      <TableRow key={college._id}>
                        <TableCell>
                          <span
                            className="block max-w-xs truncate"
                            title={college.name}
                          >
                            {truncateWithEllipsis(
                              collegeSearchField === "name"
                                ? highlight(college.name, collegeSearchTerm)
                                : college.name,
                              26
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                            onClick={() => {
                              setActiveTab("students");
                              setSearchField("college");
                              setSearchTerm(college.name);
                            }}
                          >
                            {studentCount}
                          </button>
                        </TableCell>
                        <TableCell>{collegeSearchField === "email" ? highlight(college.contactEmail, collegeSearchTerm) : college.contactEmail}</TableCell>
                        <TableCell>
                          <span
                            className="block max-w-xs truncate"
                            title={college.location}
                          >
                            {truncateWithEllipsis(
                              collegeSearchField === "location"
                                ? highlight(college.location || "-", collegeSearchTerm)
                                : (college.location || "-"),
                              26
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          {college.salesPerson
                            ? (collegeSearchField === "salesPerson"
                                ? highlight(`${college.salesPerson.firstName} ${college.salesPerson.lastName}`, collegeSearchTerm)
                                : `${college.salesPerson.firstName} ${college.salesPerson.lastName}`)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 flex-1">
                  <Select value={companySearchField} onValueChange={setCompanySearchField}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="salesPerson">Salesperson</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={`Search by ${companySearchField}`}
                      value={companySearchTerm}
                      onChange={e => setCompanySearchTerm(e.target.value)}
                      className="flex-1 min-w-0 pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] ml-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Showing {filteredAndStatusCompanies.length} result{filteredAndStatusCompanies.length !== 1 ? "s" : ""}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Salesperson</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndStatusCompanies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell>{companySearchField === "name" ? highlight(company.name, companySearchTerm) : company.name}</TableCell>
                      <TableCell>{companySearchField === "email" ? highlight(company.contactEmail, companySearchTerm) : company.contactEmail}</TableCell>
                      <TableCell>{companySearchField === "location" ? highlight(company.location || "-", companySearchTerm) : (company.location || "-")}</TableCell>
                      <TableCell>
                        {company.salesPerson
                          ? (companySearchField === "salesPerson"
                              ? highlight(`${company.salesPerson.firstName} ${company.salesPerson.lastName}`, companySearchTerm)
                              : `${company.salesPerson.firstName} ${company.salesPerson.lastName}`)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}