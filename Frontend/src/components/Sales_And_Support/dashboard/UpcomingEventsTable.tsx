
import React from 'react';
import { Badge } from '@/components/ui/badge';

const UpcomingEventsTable = () => {
  const events = [
    {
      id: 1,
      title: 'Tech Fest 2025',
      date: 'May 25, 2025',
      time: '9:00 AM',
      location: 'Main Auditorium',
      category: 'Technical'
    },
    {
      id: 2,
      title: 'Campus Placement Drive - TechSolutions Inc',
      date: 'May 28, 2025',
      time: '10:00 AM',
      location: 'Placement Center',
      category: 'Placement'
    },
    {
      id: 3,
      title: 'Annual Sports Meet',
      date: 'Jun 01, 2025',
      time: '8:30 AM',
      location: 'Sports Complex',
      category: 'Sports'
    },
    {
      id: 4,
      title: 'Alumni Meet & Networking Event',
      date: 'Jun 05, 2025',
      time: '5:00 PM',
      location: 'Conference Hall',
      category: 'Networking'
    },
    {
      id: 5,
      title: 'Workshop on Machine Learning',
      date: 'Jun 10, 2025',
      time: '2:00 PM',
      location: 'Computer Lab B',
      category: 'Workshop'
    }
  ];
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Technical':
        return 'bg-blue-100 text-blue-800';
      case 'Placement':
        return 'bg-green-100 text-green-800';
      case 'Sports':
        return 'bg-orange-100 text-orange-800';
      case 'Networking':
        return 'bg-purple-100 text-purple-800';
      case 'Workshop':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
          <tr>
            <th className="px-6 py-3 text-left">EVENT</th>
            <th className="px-6 py-3 text-left">DATE & TIME</th>
            <th className="px-6 py-3 text-left">LOCATION</th>
            <th className="px-6 py-3 text-left">CATEGORY</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {events.map(event => (
            <tr 
              key={event.id} 
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{event.title}</div>
              </td>
              <td className="px-6 py-4 text-gray-500">
                <div>{event.date}</div>
                <div className="text-xs">{event.time}</div>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {event.location}
              </td>
              <td className="px-6 py-4">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpcomingEventsTable;
