
import React from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Book, FileText, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const Academics = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Academics</h1>
          <p className="text-gray-500">Course information, schedules, and resources</p>
        </div>
        
        <Tabs defaultValue="courses">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekdays.map((day, index) => (
                    <div key={index} className="pb-4 border-b last:border-0">
                      <h3 className="font-semibold text-lg mb-2">{day.name}</h3>
                      {day.classes.length > 0 ? (
                        <div className="space-y-2">
                          {day.classes.map((cls, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                              <div>
                                <p className="font-medium">{cls.name}</p>
                                <p className="text-sm text-gray-500">{cls.time} • {cls.location}</p>
                              </div>
                              <Badge className={cls.isLab ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                                {cls.isLab ? "Lab" : "Lecture"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No classes scheduled</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grades" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Semester Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-10 rounded-full mr-4 ${getGradeColor(course.grade)}`}></div>
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getGradeTextColor(course.grade)}`}>{course.grade}</p>
                        <p className="text-sm text-gray-500">Credits: {course.credits}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-right">
                  <p className="text-sm text-gray-500">Current GPA</p>
                  <p className="text-2xl font-bold">8.7/10</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-md mr-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-xs text-gray-500">{resource.course} • {resource.size}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.success(`Downloading ${resource.name}`)}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Important Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a href="#" className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <p className="font-medium">Student Handbook</p>
                      <p className="text-sm text-gray-500">Academic policies and guidelines</p>
                    </a>
                    <a href="#" className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <p className="font-medium">Library Portal</p>
                      <p className="text-sm text-gray-500">Access online books and journals</p>
                    </a>
                    <a href="#" className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <p className="font-medium">Learning Management System</p>
                      <p className="text-sm text-gray-500">Access course materials and assignments</p>
                    </a>
                    <a href="#" className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <p className="font-medium">Hostel Management</p>
                      <p className="text-sm text-gray-500">Room allocation and maintenance requests</p>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

interface Course {
  id: number;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  progress: number;
  grade?: string;
  assignments: { total: number; completed: number };
}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{course.code}</p>
            <CardTitle className="text-lg">{course.title}</CardTitle>
          </div>
          <Badge className="bg-blue-100 text-blue-800">{course.credits} Credits</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Instructor: <span className="font-medium text-gray-700">{course.instructor}</span>
          </p>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Course Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>
                {course.assignments.completed}/{course.assignments.total} Assignments
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => toast.info(`Viewing ${course.title} details`)}
            >
              View Course
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const courses: Course[] = [
  {
    id: 1,
    code: "CS301",
    title: "Data Structures & Algorithms",
    instructor: "Dr. Anita Desai",
    credits: 4,
    progress: 65,
    grade: "A",
    assignments: { total: 8, completed: 5 }
  },
  {
    id: 2,
    code: "CS302",
    title: "Database Management Systems",
    instructor: "Prof. Rahul Sharma",
    credits: 4,
    progress: 78,
    grade: "A-",
    assignments: { total: 6, completed: 5 }
  },
  {
    id: 3,
    code: "CS303",
    title: "Computer Networks",
    instructor: "Dr. Sanjay Kumar",
    credits: 3,
    progress: 42,
    grade: "B+",
    assignments: { total: 5, completed: 2 }
  },
  {
    id: 4,
    code: "MA201",
    title: "Advanced Mathematics",
    instructor: "Dr. Priya Mehta",
    credits: 3,
    progress: 50,
    grade: "B",
    assignments: { total: 7, completed: 3 }
  },
  {
    id: 5,
    code: "HU101",
    title: "Professional Ethics",
    instructor: "Prof. Meera Gupta",
    credits: 2,
    progress: 90,
    grade: "A+",
    assignments: { total: 4, completed: 4 }
  },
  {
    id: 6,
    code: "CS304",
    title: "Operating Systems",
    instructor: "Dr. Vikram Singh",
    credits: 4,
    progress: 55,
    grade: "B+",
    assignments: { total: 6, completed: 3 }
  }
];

const resources = [
  {
    name: "Data Structures Notes.pdf",
    course: "CS301",
    size: "2.4 MB"
  },
  {
    name: "DBMS Lab Manual.pdf",
    course: "CS302",
    size: "3.7 MB"
  },
  {
    name: "Computer Networks Study Material.pdf",
    course: "CS303",
    size: "5.1 MB"
  },
  {
    name: "Mathematics Formulas.pdf",
    course: "MA201",
    size: "1.8 MB"
  },
  {
    name: "Ethics Case Studies.docx",
    course: "HU101",
    size: "967 KB"
  }
];

const weekdays = [
  {
    name: "Monday",
    classes: [
      { name: "CS301: Data Structures & Algorithms", time: "9:00 AM - 10:30 AM", location: "Room 201", isLab: false },
      { name: "CS302: Database Management Systems", time: "11:00 AM - 12:30 PM", location: "Room 105", isLab: false },
      { name: "CS304: Operating Systems", time: "2:00 PM - 4:00 PM", location: "Computer Lab 2", isLab: true }
    ]
  },
  {
    name: "Tuesday",
    classes: [
      { name: "MA201: Advanced Mathematics", time: "9:00 AM - 10:30 AM", location: "Room 301", isLab: false },
      { name: "CS303: Computer Networks", time: "11:00 AM - 12:30 PM", location: "Room 202", isLab: false },
      { name: "CS302: DBMS Lab", time: "2:00 PM - 4:00 PM", location: "Database Lab", isLab: true }
    ]
  },
  {
    name: "Wednesday",
    classes: [
      { name: "CS301: Data Structures & Algorithms", time: "9:00 AM - 10:30 AM", location: "Room 201", isLab: false },
      { name: "HU101: Professional Ethics", time: "11:00 AM - 12:30 PM", location: "Room 401", isLab: false }
    ]
  },
  {
    name: "Thursday",
    classes: [
      { name: "CS304: Operating Systems", time: "9:00 AM - 10:30 AM", location: "Room 203", isLab: false },
      { name: "CS303: Computer Networks", time: "11:00 AM - 12:30 PM", location: "Room 202", isLab: false },
      { name: "CS301: DSA Lab", time: "2:00 PM - 4:00 PM", location: "Computer Lab 1", isLab: true }
    ]
  },
  {
    name: "Friday",
    classes: [
      { name: "MA201: Advanced Mathematics", time: "9:00 AM - 10:30 AM", location: "Room 301", isLab: false },
      { name: "HU101: Professional Ethics", time: "11:00 AM - 12:30 PM", location: "Room 401", isLab: false },
      { name: "CS303: Networks Lab", time: "2:00 PM - 4:00 PM", location: "Networking Lab", isLab: true }
    ]
  },
  {
    name: "Saturday",
    classes: []
  },
  {
    name: "Sunday",
    classes: []
  }
];

const getGradeColor = (grade?: string) => {
  if (!grade) return "bg-gray-300";
  
  switch (grade[0]) {
    case 'A': return "bg-green-500";
    case 'B': return "bg-blue-500";
    case 'C': return "bg-yellow-500";
    case 'D': return "bg-orange-500";
    default: return "bg-red-500";
  }
};

const getGradeTextColor = (grade?: string) => {
  if (!grade) return "text-gray-500";
  
  switch (grade[0]) {
    case 'A': return "text-green-600";
    case 'B': return "text-blue-600";
    case 'C': return "text-yellow-600";
    case 'D': return "text-orange-600";
    default: return "text-red-600";
  }
};

export default Academics;
