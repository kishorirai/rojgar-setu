
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TicketVolumeChart: React.FC = () => {
  const data = [
    { day: "Mon", new: 18, resolved: 15 },
    { day: "Tue", new: 25, resolved: 20 },
    { day: "Wed", new: 20, resolved: 22 },
    { day: "Thu", new: 30, resolved: 25 },
    { day: "Fri", new: 22, resolved: 18 },
    { day: "Sat", new: 15, resolved: 12 },
    { day: "Sun", new: 10, resolved: 8 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ 
            backgroundColor: "white", 
            borderColor: "#ddd" 
          }}
        />
        <Legend />
        <Bar dataKey="new" name="New Tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="resolved" name="Resolved Tickets" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketVolumeChart;
