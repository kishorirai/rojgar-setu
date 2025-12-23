
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AttendanceChart: React.FC = () => {
  const data = [
    { name: "Mon", attendance: 85 },
    { name: "Tue", attendance: 88 },
    { name: "Wed", attendance: 90 },
    { name: "Thu", attendance: 87 },
    { name: "Fri", attendance: 82 },
    { name: "Sat", attendance: 75 },
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
          domain={[60, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, "Attendance Rate"]}
          labelStyle={{ color: "#111" }}
          contentStyle={{ 
            backgroundColor: "white", 
            borderColor: "#ddd" 
          }}
        />
        <Line
          type="monotone"
          dataKey="attendance"
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

export default AttendanceChart;
