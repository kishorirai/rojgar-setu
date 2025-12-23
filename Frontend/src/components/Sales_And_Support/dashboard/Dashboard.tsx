
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, FileText } from "lucide-react";
import TicketVolumeChart from "./TicketVolumeChart";
import AttendanceChart from "./AttendanceChart";
import UpcomingEventsTable from "./UpcomingEventsTable";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of campus activities and information</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Students" 
          value="3,245" 
          change="+120" 
          trend="up"
          icon={<Users className="h-8 w-8 text-blue-500" />} 
        />
        <StatsCard 
          title="Upcoming Events" 
          value="8" 
          change="+2" 
          trend="up"
          icon={<Calendar className="h-8 w-8 text-blue-500" />} 
        />
        <StatsCard 
          title="Placement Rate" 
          value="89%" 
          change="+5.2%" 
          trend="up"
          icon={<TrendingUp className="h-8 w-8 text-blue-500" />} 
        />
        <StatsCard 
          title="Open Courses" 
          value="42" 
          change="+3" 
          trend="up"
          icon={<FileText className="h-8 w-8 text-blue-500" />} 
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <AttendanceChart />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TicketVolumeChart />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Events */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingEventsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {change} <span className="text-gray-500">vs last period</span>
            </p>
          </div>
          <div className="bg-blue-50 rounded-full p-3 self-start">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
