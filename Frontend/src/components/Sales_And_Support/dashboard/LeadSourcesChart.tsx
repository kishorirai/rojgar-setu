
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LeadSourcesChart: React.FC = () => {
  const data = [
    { name: "Website", value: 120 },
    { name: "Referral", value: 80 },
    { name: "Social Media", value: 60 },
    { name: "Email", value: 40 },
    { name: "Events", value: 30 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" axisLine={false} tickLine={false} />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          width={100}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: "white", 
            borderColor: "#ddd"
          }}
          formatter={(value) => [`${value} leads`, "Count"]}
        />
        <Bar 
          dataKey="value" 
          fill="#3b82f6" 
          radius={[0, 4, 4, 0]} 
          barSize={20} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeadSourcesChart;
