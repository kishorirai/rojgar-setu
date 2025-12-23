
import React, { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";
import { toast } from "sonner";

const Events = () => {
  const [filter, setFilter] = useState<string>("all");
  
  const eventsList = [
    {
      id: 1,
      title: 'Tech Fest 2025',
      date: 'May 25, 2025',
      time: '9:00 AM - 6:00 PM',
      location: 'Main Auditorium',
      category: 'Technical',
      description: 'Annual tech festival featuring coding competitions, hackathons, and tech exhibitions.',
      organizer: 'Computer Science Department'
    },
    {
      id: 2,
      title: 'Campus Placement Drive - TechSolutions Inc',
      date: 'May 28, 2025',
      time: '10:00 AM - 4:00 PM',
      location: 'Placement Center',
      category: 'Placement',
      description: 'On-campus recruitment drive for full-time and internship positions.',
      organizer: 'Career Development Cell'
    },
    {
      id: 3,
      title: 'Annual Sports Meet',
      date: 'Jun 01, 2025',
      time: '8:30 AM - 5:30 PM',
      location: 'Sports Complex',
      category: 'Sports',
      description: 'Inter-department sports competition featuring athletics, cricket, football, and more.',
      organizer: 'Sports Committee'
    },
    {
      id: 4,
      title: 'Alumni Meet & Networking Event',
      date: 'Jun 05, 2025',
      time: '5:00 PM - 8:00 PM',
      location: 'Conference Hall',
      category: 'Networking',
      description: 'Connect with alumni and industry professionals to expand your network.',
      organizer: 'Alumni Association'
    },
    {
      id: 5,
      title: 'Workshop on Machine Learning',
      date: 'Jun 10, 2025',
      time: '2:00 PM - 5:00 PM',
      location: 'Computer Lab B',
      category: 'Workshop',
      description: 'Hands-on workshop covering basics of machine learning algorithms and implementations.',
      organizer: 'AI Research Club'
    },
    {
      id: 6,
      title: 'Cultural Fest',
      date: 'Jun 15, 2025',
      time: '3:00 PM - 10:00 PM',
      location: 'Open Air Theatre',
      category: 'Cultural',
      description: 'Annual cultural festival featuring music, dance, and theatrical performances.',
      organizer: 'Cultural Committee'
    },
    {
      id: 7,
      title: 'Career Guidance Seminar',
      date: 'Jun 20, 2025',
      time: '11:00 AM - 1:00 PM',
      location: 'Seminar Hall',
      category: 'Career',
      description: 'Guidance session on career options after graduation.',
      organizer: 'Career Development Cell'
    },
    {
      id: 8,
      title: 'Industry Visit - Infotech Solutions',
      date: 'Jun 25, 2025',
      time: '9:00 AM - 3:00 PM',
      location: 'Departure from Main Gate',
      category: 'Industrial',
      description: 'Industry visit to gain practical insights about software development processes.',
      organizer: 'Training & Placement Cell'
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
      case 'Cultural':
        return 'bg-pink-100 text-pink-800';
      case 'Career':
        return 'bg-indigo-100 text-indigo-800';
      case 'Industrial':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredEvents = filter === "all" 
    ? eventsList 
    : eventsList.filter(event => event.category === filter);

  const registerForEvent = (eventId: number) => {
    toast.success("Registration successful!", {
      description: "You have successfully registered for this event."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Campus Events</h1>
            <p className="text-gray-500">Upcoming events and activities on campus</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-md px-2 border">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] border-0 focus:ring-0">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Placement">Placement</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Career">Career</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Input 
              type="text" 
              placeholder="Search events..." 
              className="w-64"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    <CardTitle className="mt-2 text-lg">
                      {event.title}
                    </CardTitle>
                  </div>
                  <div className="bg-blue-100 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    <div>
                      <span className="font-medium text-gray-700">Date:</span> {event.date}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time:</span> {event.time}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span> {event.location}
                    </div>
                    <div className="mt-1">
                      <span className="font-medium text-gray-700">Organizer:</span> {event.organizer}
                    </div>
                  </div>
                  
                  <p className="text-sm">{event.description}</p>
                  
                  <Button 
                    onClick={() => registerForEvent(event.id)} 
                    className="w-full bg-campus-blue hover:bg-blue-700"
                  >
                    Register
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;
