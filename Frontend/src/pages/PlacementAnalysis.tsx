import React from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useEffect, useState } from "react";
// Sample data for the charts
const placementData_Dummy = {
  overview: {
    totalStudents: 850,
    placed: 680,
    intern: 120,
    unplaced: 50,
    averageSalary: "8.2 LPA",
    highestSalary: "32 LPA",
    companiesVisited: 72,
    offersGenerated: 724,
  },
  placementByDepartment: [
    { name: "Computer Science", placed: 95, total: 100 },
    { name: "Electronics", placed: 85, total: 100 },
    { name: "Mechanical", placed: 75, total: 100 },
    { name: "Civil", placed: 65, total: 100 },
    { name: "Electrical", placed: 80, total: 100 },
    { name: "IT", placed: 90, total: 100 },
  ],
  salaryDistribution: [
    { range: "3-5 LPA", count: 120 },
    { range: "5-8 LPA", count: 230 },
    { range: "8-12 LPA", count: 180 },
    { range: "12-16 LPA", count: 90 },
    { range: "16-20 LPA", count: 40 },
    { range: ">20 LPA", count: 20 },
  ],
  placementTrend: [
    { year: "2020", placement: 78 },
    { year: "2021", placement: 82 },
    { year: "2022", placement: 75 },
    { year: "2023", placement: 80 },
    { year: "2024", placement: 85 },
    { year: "2025", placement: 90 },
  ],
  topRecruiters: [
    { name: "TechCorp", offers: 45 },
    { name: "GlobalSoft", offers: 38 },
    { name: "InnovateTech", offers: 35 },
    { name: "DataSystems", offers: 30 },
    { name: "CloudWorks", offers: 25 },
  ],
  offersByMonth: [
    { month: "Jul", offers: 50 },
    { month: "Aug", offers: 65 },
    { month: "Sep", offers: 80 },
    { month: "Oct", offers: 95 },
    { month: "Nov", offers: 120 },
    { month: "Dec", offers: 85 },
    { month: "Jan", offers: 70 },
    { month: "Feb", offers: 60 },
    { month: "Mar", offers: 45 },
    { month: "Apr", offers: 40 },
    { month: "May", offers: 10 },
    { month: "Jun", offers: 5 },
  ],
};

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PlacementAnalysis = () => {

    const [placementData, setPlacementData] = useState(placementData_Dummy);

    useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, deptRes, salaryRes, trendRes, recruitersRes, monthRes] =
          await Promise.all([
            axios.get("https://campusadmin.onrender.com/api/v1/placement/overview"),
            axios.get("https://campusadmin.onrender.com/api/v1/placement/by-department"),
            axios.get("https://campusadmin.onrender.com/api/v1/placement/salary-distribution"),
            axios.get("https://campusadmin.onrender.com/api/v1/placement/trend"),
            axios.get("https://campusadmin.onrender.com/api/v1/placement/top-recruiters"),
            axios.get("https://campusadmin.onrender.com/api/v1/placement/offers-by-month"),
          ]);

        setPlacementData({
          overview: overviewRes.data,
          placementByDepartment: deptRes.data,
          salaryDistribution: salaryRes.data,
          placementTrend: trendRes.data,
          topRecruiters: recruitersRes.data,
          offersByMonth: monthRes.data,
        });
      } catch (error) {
        console.error("Error fetching placement dashboard data:", error);
      }
    };

    fetchData();
  }, []);
  const token = localStorage.getItem("token");
  if(!token){
    window.location.href = "https://company.rojgarsetu.org/";
  }
  console.log("Token:", token);
  const [selectedBatch, setSelectedBatch] = React.useState("2025");
  const batches = ["2025", "2024", "2023"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Placement Analysis</h1>
            <p className="text-gray-500">Comprehensive analysis of student placements</p>
          </div>
          
          <div className="w-full flex justify-end mb-4">
            <div className="relative" style={{ zIndex: 100 }}>
              <Select
                value={selectedBatch}
                onValueChange={(value) => setSelectedBatch(value)}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white shadow-lg z-[1000]" 
                  position="item-aligned" 
                  sideOffset={8} 
                  align="end"
                  style={{ width: '180px' }}
                >
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch} Batch
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Students"
            value={placementData.overview.totalStudents}
            subtitle="In final year"
            color="blue"
          />
          <MetricCard
            title="Placement Rate"
            value={`${Math.round((placementData.overview.placed / placementData.overview.totalStudents) * 100)}%`}
            subtitle={`${placementData.overview.placed} students placed`}
            color="green"
          />
          <MetricCard
            title="Average Package"
            value={placementData.overview.averageSalary}
            subtitle="Cost to company"
            color="purple"
          />
          <MetricCard
            title="Companies Visited"
            value={placementData.overview.companiesVisited}
            subtitle={`${placementData.overview.offersGenerated} offers generated`}
            color="orange"
          />
        </div>
        
        {/* Placement Status Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Placement Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Placed', value: placementData.overview.placed },
                        { name: 'Internship', value: placementData.overview.intern },
                        { name: 'Unplaced', value: placementData.overview.unplaced }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Students']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Placement by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={placementData.placementByDepartment}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Placement %" dataKey="placed" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="salary" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="salary">Salary Distribution</TabsTrigger>
            <TabsTrigger value="trend">Placement Trend</TabsTrigger>
            <TabsTrigger value="recruiters">Top Recruiters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={placementData.salaryDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trend">
            <Card>
              <CardHeader>
                <CardTitle>Placement Trend (Last 6 Years)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={placementData.placementTrend}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Placement Rate']} />
                      <Line
                        type="monotone"
                        dataKey="placement"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        strokeWidth={3}
                        name="Placement %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recruiters">
            <Card>
              <CardHeader>
                <CardTitle>Top Recruiters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={placementData.topRecruiters}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="offers" fill="#82ca9d" name="Offers Made" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Monthly Offers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Offers by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={placementData.offersByMonth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Offers']} />
                  <Line
                    type="monotone"
                    dataKey="offers"
                    stroke="#ff7300"
                    activeDot={{ r: 8 }}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs mt-1 text-gray-500">{subtitle}</p>
          </div>
          <div className={`rounded-full p-2 ${colorClasses[color]}`}>
            <div className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlacementAnalysis;
