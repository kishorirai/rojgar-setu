
import React from "react";
import { Badge } from "@/components/ui/badge";

const leads = [
  {
    id: "L001",
    name: "Raj Kumar",
    company: "ABC University",
    date: "15/6/2025",
    status: "New"
  },
  {
    id: "L002",
    name: "Priya Sharma",
    company: "XYZ College",
    date: "14/6/2025",
    status: "Contacted"
  },
  {
    id: "L003",
    name: "Ajay Patel",
    company: "Tech Solutions",
    date: "13/6/2025",
    status: "Qualified"
  }
];

const RecentLeadsTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="text-left text-xs text-gray-500 border-b">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">NAME</th>
            <th className="p-2">COMPANY</th>
            <th className="p-2">DATE</th>
            <th className="p-2">STATUS</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-gray-100">
              <td className="p-2">{lead.id}</td>
              <td className="p-2 font-medium">{lead.name}</td>
              <td className="p-2 text-gray-500">{lead.company}</td>
              <td className="p-2 text-gray-500">{lead.date}</td>
              <td className="p-2">
                <Badge className={`
                  ${lead.status === "New" ? "bg-blue-100 text-blue-800" : 
                    lead.status === "Contacted" ? "bg-purple-100 text-purple-800" : 
                    "bg-green-100 text-green-800"}
                `}>
                  {lead.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentLeadsTable;
