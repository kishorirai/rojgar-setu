
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RevenueChart: React.FC = () => {
  const data = [
    { name: "Jan", revenue: 3000 },
    { name: "Feb", revenue: 5000 },
    { name: "Mar", revenue: 4000 },
    { name: "Apr", revenue: 6500 },
    { name: "May", revenue: 5800 },
    { name: "Jun", revenue: 7500 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          formatter={(value) => [`₹${value}`, "Revenue"]}
          labelStyle={{ color: "#111" }}
          contentStyle={{ 
            backgroundColor: "white", 
            borderColor: "#ddd" 
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          fillOpacity={0.2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
