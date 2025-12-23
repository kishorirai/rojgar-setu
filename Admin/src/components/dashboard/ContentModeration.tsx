import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Check, 
  X, 
  Flag, 
  MessageSquare, 
  FileText,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ContentModeration() {
  const [selectedTab, setSelectedTab] = useState("flagged");

  const moderationStats = [
    {
      title: "Flagged Content",
      value: "23",
      change: "+5",
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pending Reviews",
      value: "45",
      change: "+12",
      icon: Eye,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Auto-Moderated",
      value: "156",
      change: "+34",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Manual Reviews",
      value: "89",
      change: "+8",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  const flaggedContent = [
    {
      id: 1,
      type: "Job Post",
      title: "Software Engineer - Urgent Hiring",
      company: "TechStart Inc.",
      reason: "Suspicious salary claims",
      flaggedBy: "Auto-Detection",
      severity: "high",
      date: "2024-01-28",
      status: "pending",
    },
    {
      id: 2,
      type: "Company Profile",
      title: "InnovateLabs Company Page",
      company: "InnovateLabs",
      reason: "Unverified credentials",
      flaggedBy: "User Report",
      severity: "medium",
      date: "2024-01-27",
      status: "under_review",
    },
    {
      id: 3,
      type: "Student Profile",
      title: "John Doe - Resume",
      company: "Student User",
      reason: "Fake academic records",
      flaggedBy: "College Admin",
      severity: "high",
      date: "2024-01-26",
      status: "pending",
    },
  ];

  const reportedContent = [
    {
      id: 1,
      reporter: "student@university.edu",
      contentType: "Job Posting",
      description: "Misleading job requirements and fake company information",
      priority: "high",
      date: "2024-01-28",
      status: "investigating",
    },
    {
      id: 2,
      reporter: "admin@college.edu",
      contentType: "User Profile",
      description: "Student claiming false academic achievements",
      priority: "medium",
      date: "2024-01-27",
      status: "pending",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "investigating":
        return <Badge className="bg-purple-100 text-purple-800">Investigating</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-2">Monitor and moderate platform content</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Shield className="w-4 h-4 mr-2" />
          Security Settings
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {moderationStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change} today</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Moderation Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Content Review Dashboard</CardTitle>
          <CardDescription>Review flagged content and user reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flagged" className="flex items-center space-x-2">
                <Flag className="w-4 h-4" />
                <span>Flagged Content</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>User Reports</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Policies</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flagged" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                      <TableCell>{item.flaggedBy}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-600">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportedContent.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reporter}</TableCell>
                      <TableCell>{report.contentType}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell>{getSeverityBadge(report.priority)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Investigate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Check className="w-4 h-4 mr-2" />
                              Resolve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <X className="w-4 h-4 mr-2" />
                              Dismiss
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Job Posting Standards</h4>
                      <p className="text-sm text-blue-700">Requirements for company job postings</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Profile Verification</h4>
                      <p className="text-sm text-green-700">User profile authenticity rules</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">Communication Policy</h4>
                      <p className="text-sm text-purple-700">Platform communication guidelines</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moderation Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Auto-Moderation Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Flag className="w-4 h-4 mr-2" />
                      Keyword Filters
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Violation Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
