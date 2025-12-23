import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Building2, School, Activity } from "lucide-react";

export function Analytics() {
  const placementData = [
    { month: "Jan", placements: 245, applications: 1200 },
    { month: "Feb", placements: 278, applications: 1450 },
    { month: "Mar", placements: 312, applications: 1680 },
    { month: "Apr", placements: 287, applications: 1520 },
    { month: "May", placements: 356, applications: 1890 },
    { month: "Jun", placements: 423, applications: 2100 },
  ];

  const userGrowthData = [
    { month: "Jan", students: 7200, colleges: 280, companies: 890 },
    { month: "Feb", students: 7450, colleges: 295, companies: 920 },
    { month: "Mar", students: 7680, colleges: 310, companies: 980 },
    { month: "Apr", students: 7920, colleges: 325, companies: 1030 },
    { month: "May", students: 8180, colleges: 335, companies: 1100 },
    { month: "Jun", students: 8456, colleges: 342, companies: 1156 },
  ];

  const industryData = [
    { name: "Technology", value: 35, color: "#3B82F6" },
    { name: "Finance", value: 25, color: "#10B981" },
    { name: "Healthcare", value: 20, color: "#F59E0B" },
    { name: "Manufacturing", value: 12, color: "#EF4444" },
    { name: "Others", value: 8, color: "#8B5CF6" },
  ];

  const keyMetrics = [
    {
      title: "Placement Rate",
      value: "73.2%",
      change: "+5.2%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Users",
      value: "8,456",
      change: "+12.3%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Company Engagement",
      value: "89.4%",
      change: "+8.1%",
      icon: Building2,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive platform insights and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-green-600 font-medium">{metric.change} from last month</p>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>Deep dive into platform performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="placements" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="placements">Placements</TabsTrigger>
              <TabsTrigger value="users">User Growth</TabsTrigger>
              <TabsTrigger value="industry">Industry Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="placements" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="placements" fill="#3B82F6" name="Successful Placements" />
                    <Bar dataKey="applications" fill="#93C5FD" name="Total Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={3} name="Students" />
                    <Line type="monotone" dataKey="companies" stroke="#10B981" strokeWidth={3} name="Companies" />
                    <Line type="monotone" dataKey="colleges" stroke="#F59E0B" strokeWidth={3} name="Colleges" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="industry" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <h3 className="text-lg font-semibold mb-4">Company Distribution by Industry</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Industry Statistics</h3>
                  <div className="space-y-3">
                    {industryData.map((industry) => (
                      <div key={industry.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: industry.color }}
                          ></div>
                          <span className="font-medium">{industry.name}</span>
                        </div>
                        <span className="text-gray-600">{industry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}