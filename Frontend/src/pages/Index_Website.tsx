import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
// import { Card, CardContent } from "../components/ui/card";
// import { Badge } from "../components/ui/badge";
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthButtons from '../components/landingWebsite/AuthButtons';
import HowItWorks from '../components/landingWebsite/HowItWorks';
import Features from '../components/landingWebsite/Features';
import FAQ from '../components/landingWebsite/FAQ';
import CTASection from '../components/landingWebsite/CTASection';
import { 
  Users, 
  GraduationCap, 
  Building2,
  Search,
  User,
  BarChart3,
  MapPin,
  Briefcase,
  ArrowRight,
  Star,
  Github,
  Twitter,
  Linkedin,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  Award,
  Zap,
  Target,
  Globe,
  Heart,
  ChevronRight,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchDropdown from "../components/SearchDropdown";
import { Carousel, CarouselContent, CarouselItem } from "../components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Index_Website: React.FC = () => {
  const navigate = useNavigate();
  const [activeJob, setActiveJob] = useState(0);
  const [stats, setStats] = useState({ students: 0, jobs: 0, companies: 0, placements: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchSkills, setSearchSkills] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearchJobs = () => {
    console.log('Searching jobs with:', { skills: searchSkills, location: searchLocation });
    // You can add search logic here
    navigate('/login_panel', { state: { searchSkills, searchLocation } });
  };

  // Animated counter effect
  useEffect(() => {
    const targets = { students: 10000000, jobs: 100000, companies: 50000, placements: 1000000 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        students: Math.floor(targets.students * progress),
        jobs: Math.floor(targets.jobs * progress),
        companies: Math.floor(targets.companies * progress),
        placements: Math.floor(targets.placements * progress)
      });
      
      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'FAQ', href: '#faq' }
  ];

  // Auto-rotate featured jobs
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveJob((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSignIn = () => {
    navigate('/login_panel');
  };


  // Enhanced Search suggestions data
  const skillsSuggestions = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript',
    'Kotlin', 'Swift', 'Dart', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML/CSS',
    
    // Web Development
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Laravel',
    'Spring Boot', 'ASP.NET', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery',
    
    // Mobile Development
    'React Native', 'Flutter', 'Android Development', 'iOS Development', 'Xamarin', 'Ionic',
    
    // Data Science & AI/ML
    'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'Artificial Intelligence',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Keras', 'OpenCV',
    'Natural Language Processing', 'Computer Vision', 'Big Data', 'Apache Spark',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD',
    'Terraform', 'Ansible', 'Linux', 'DevOps', 'Microservices',
    
    // Database
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB',
    
    // Design & UI/UX
    'UI/UX Design', 'Graphic Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator',
    'Sketch', 'InVision', 'User Research', 'Wireframing', 'Prototyping',
    
    // Digital Marketing
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads', 'PPC',
    
    // Business & Management
    'Project Management', 'Product Management', 'Business Analysis', 'Agile', 'Scrum',
    'Leadership', 'Strategy', 'Operations', 'Sales', 'Customer Service',
    
    // Job Roles
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
    'Digital Marketing Specialist', 'Business Analyst', 'Quality Assurance', 'System Administrator',
    'Cybersecurity Specialist', 'Mobile App Developer', 'Game Developer', 'AI Engineer',
    
    // Companies
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Uber', 'Airbnb',
    'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Accenture', 'IBM', 'Oracle', 'SAP',
    'Flipkart', 'Paytm', 'Zomato', 'Swiggy', 'Byju\'s', 'Ola', 'Myntra', 'BigBasket'
  ];

  const locationSuggestions = [
    // Major Indian Cities
    'Bangalore', 'Mumbai', 'Delhi', 'Gurgaon', 'Noida', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
    'Ahmedabad', 'Jaipur', 'Kochi', 'Indore', 'Coimbatore', 'Chandigarh', 'Bhubaneswar',
    'Mysore', 'Nagpur', 'Lucknow', 'Vadodara', 'Surat', 'Rajkot', 'Bhopal', 'Visakhapatnam',
    'Thiruvananthapuram', 'Mangalore', 'Nashik', 'Aurangabad', 'Madurai', 'Tiruchirappalli',
    'Salem', 'Jodhpur', 'Gwalior', 'Vijayawada', 'Guntur', 'Warangal', 'Hubli', 'Belgaum',
    'Jalandhar', 'Ludhiana', 'Amritsar', 'Dehradun', 'Haridwar', 'Rishikesh', 'Shimla',
    'Jammu', 'Srinagar', 'Guwahati', 'Silchar', 'Agartala', 'Imphal', 'Aizawl', 'Kohima',
    'Itanagar', 'Gangtok', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Patna', 'Muzaffarpur',
    'Rourkela', 'Cuttack', 'Sambalpur', 'Berhampur', 'Durgapur', 'Asansol', 'Siliguri'
  ];

  const handleJoinAsStudent = () => {
    navigate('/student-login');
  };

  // const handleRegisterCollege = () => {
  //   navigate('/college-registration');
  // };

  const handleHireTalent = () => {
    navigate('/company-login');
  };

  // const handleGetStarted = () => {
  //   navigate('/get-started');
  // };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/campus-connect-demo', '_blank');
  };

  // const handleForStudents = () => {
  //   navigate('/student-portal');
  // };

  // const handleForColleges = () => {
  //   navigate('/college-portal');
  // };

  // const handleForCompanies = () => {
  //   navigate('/company-portal');
  // };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  // const handleCareersClick = () => {
  //   window.open('/careers', '_blank');
  // };

  // const handlePressClick = () => {
  //   window.open('/press', '_blank');
  // };

  // const handleBlogClick = () => {
  //   window.open('/blog', '_blank');
  // };

  // const handleHelpCenterClick = () => {
  //   window.open('/help', '_blank');
  // };

  // const handlePrivacyClick = () => {
  //   window.open('/privacy', '_blank');
  // };

  // const handleTermsClick = () => {
  //   window.open('/terms', '_blank');
  // };

  // const jobs = [
  //   {
  //     title: "Senior Software Engineer",
  //     company: "Microsoft",
  //     location: "Bangalore",
  //     salary: "₹15-25 LPA",
  //     type: "Full-time",
  //     posted: "2 days ago",
  //     skills: ["React", "Node.js", "Python"]
  //   },
  //   {
  //     title: "Data Scientist",
  //     company: "Google",
  //     location: "Mumbai",
  //     salary: "₹18-30 LPA",
  //     type: "Full-time",
  //     posted: "1 day ago",
  //     skills: ["Python", "ML", "AI"]
  //   },
  //   {
  //     title: "Product Manager",
  //     company: "Amazon",
  //     location: "Delhi",
  //     salary: "₹20-35 LPA",
  //     type: "Full-time",
  //     posted: "3 days ago",
  //     skills: ["Strategy", "Analytics", "Leadership"]
  //   }
  // ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Enhanced Navigation with backdrop blur */}
      {/* <nav className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                ROJGAR SETU
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('jobs')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
                Jobs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('companies')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
                Companies
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <Button variant="outline" size="sm" onClick={handleSignIn} className="font-medium hover:shadow-md transition-all duration-200">
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav> */}
      <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center group">
              <div className="flex items-center space-x-3">
                <img src="/images/favicon.png" alt="Rojgar Setu Logo" className="w-12 h-12 rounded-full border-2 border-blue-200 shadow-md bg-white p-1 mr-2" />
                <span className="flex flex-col items-start">
                  <span
                    style={{
                      background: 'linear-gradient(to right, #0d47a1, #42a5f5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '1.35rem',
                      fontFamily: 'Noto Sans, Arial, sans-serif',
                      lineHeight: 1.1,
                    }}
                  >
                    Rojgar Setu
                  </span>
                  <span
                    style={{
                      background: 'linear-gradient(to right, #0d47a1, #42a5f5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      fontFamily: 'Noto Sans Devanagari, Mangal, Arial, sans-serif',
                      lineHeight: 1.1,
                      marginTop: '-0.1rem',
                    }}
                  >
                    रोज़गार सेतु
                  </span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-electric text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              onClick={handleSignIn}
            >
              Login
            </motion.button> */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-white"
              style={{
                background: 'linear-gradient(to right,rgb(156, 34, 197),rgb(40, 80, 167))', // gray-900 to blue-600
              }}
              onClick={handleSignIn}
            >
              Login
            </motion.button>

          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                >
                  {item.name}
                </motion.a>
              ))}
              <div className="pt-4 space-y-3">
                {/* <button onClick={handleSignIn} className="w-full px-6 py-2 bg-gradient-electric text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                  Login
                </button> */}
                <button
                  onClick={handleSignIn}
                  className="w-full px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-white"
                  style={{
                    background: 'linear-gradient(to right,rgb(156, 34, 197),rgb(40, 80, 167))', // gray-900 to blue-600
                  }}
                >
                  Login
                </button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

      {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="animate-fade-in">
                    <div className="flex flex-col items-center mb-4">
                      <img src="/images/favicon.png" alt="Rojgar Setu Logo" className="w-20 h-20 rounded-full border-2 border-blue-200 shadow-md bg-white mb-2" />
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">India's #1 Career Platform</span>
                    </div>
                    <h1 className="mb-6 leading-tight text-center">
                      <span
                        className="block"
                        style={{
                          color: '#FF6F00',
                          fontSize: '3.3rem', // slightly smaller, fits one line
                          fontFamily: 'Noto Sans Devanagari, Mangal, Arial, sans-serif',
                          fontWeight: 700,
                          lineHeight: 1.1,
                        }}
                      >
                        आत्मनिर्भर भारत का सेतु -
                      </span>
                      <span
                        className="block"
                        style={{
                          color: '#388E3C',
                          fontSize: '3.5rem', // larger than above
                          fontFamily: 'Noto Sans Devanagari, Mangal, Arial, sans-serif',
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        रोज़गार सेतु
                      </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                      Join over 100k+ students who found their perfect career match. Connect with top employers and unlock unlimited opportunities.
                    </p>
                    {/* Enhanced Search Bar */}
                    <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <SearchDropdown
                            placeholder="Skills, Designations, Companies"
                            suggestions={skillsSuggestions}
                            value={searchSkills}
                            onChange={setSearchSkills}
                            onSelect={setSearchSkills}
                          />
                        </div>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <SearchDropdown
                            placeholder="Enter location"
                            suggestions={locationSuggestions}
                            value={searchLocation}
                            onChange={setSearchLocation}
                            onSelect={setSearchLocation}
                          />
                        </div>
                        <Button onClick={handleSearchJobs} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg font-semibold hover:shadow-lg transition-all duration-200">
                          Search Jobs
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Button onClick={handleJoinAsStudent} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-200 group">
                        <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Register as Student
                      </Button>
                      <Button onClick={handleHireTalent} variant="outline" size="lg" className="hover:shadow-lg transition-all duration-200 group">
                        <Building2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Hire Talent
                      </Button>
                    </div>
                  </div>
                  <div className="hidden lg:block animate-scale-in w-full max-w-xl mx-auto">
                    <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 3000 })]} className="relative">
                      <CarouselContent>
                        <CarouselItem>
                          <img src="/images/Rojgar-setu-1.jpg" alt="Rojgar Setu 1" className="rounded-2xl shadow-2xl w-full object-cover" />
                        </CarouselItem>
                        <CarouselItem>
                          <img src="/images/Rojgar-setu-2.jpg" alt="Rojgar Setu 2" className="rounded-2xl shadow-2xl w-full object-cover" />
                        </CarouselItem>
                        <CarouselItem>
                          <img src="/images/Rojgar-setu-3.jpg" alt="Rojgar Setu 3" className="rounded-2xl shadow-2xl w-full object-cover" />
                        </CarouselItem>
                        <CarouselItem>
                          <img src="/images/Rojgar-setu-4.jpg" alt="Rojgar Setu 4" className="rounded-2xl shadow-2xl w-full object-cover" />
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
              </div>
            </section>

      <AuthButtons />
      <HowItWorks />
      <Features />
      <FAQ />
      <CTASection />

      {/* Animated Stats Section */}
      {/* <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Registered Students", value: stats.students, suffix: "M+", icon: Users, color: "blue" },
              { label: "Active Jobs", value: stats.jobs, suffix: "K+", icon: Briefcase, color: "green" },
              { label: "Companies", value: stats.companies, suffix: "K+", icon: Building2, color: "purple" },
              { label: "Success Stories", value: stats.placements, suffix: "M+", icon: Award, color: "orange" }
            ].map((stat, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-${stat.color}-200 transition-colors`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>
                  {(stat.value / (stat.suffix.includes('M') ? 1000000 : 1000)).toFixed(stat.suffix.includes('M') ? 0 : 0)}{stat.suffix}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Enhanced Services Section */}
      {/* <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Complete Career Solutions</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From profile building to job placement, we've got your entire career journey covered
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "For Students",
                description: "Build your profile, search jobs, and connect with recruiters from top companies worldwide.",
                icon: Users,
                color: "blue",
                features: ["AI-Powered Job Matching", "Skill Assessment", "Interview Preparation"],
                onClick: handleSignIn
              },
              {
                title: "For Colleges",
                description: "Manage placements, track student progress, and partner with industry leaders seamlessly.",
                icon: GraduationCap,
                color: "green",
                features: ["Placement Management", "Analytics Dashboard", "Industry Partnerships"],
                onClick: handleSignIn
              },
              {
                title: "For Employers",
                description: "Access quality talent, streamline hiring, and build your employer brand effectively.",
                icon: Building2,
                color: "purple",
                features: ["Talent Pool Access", "Recruitment Tools", "Brand Building"],
                onClick: handleSignIn
              }
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white transform hover:-translate-y-2" onClick={service.onClick}>
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${service.color}-100 to-${service.color}-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-10 h-10 text-${service.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Enhanced Featured Jobs with Auto-rotation */}
      {/* <section id="jobs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Trending Opportunities</h2>
              <p className="text-gray-600">Hand-picked jobs from top companies</p>
            </div>
            <Button variant="outline" onClick={handleSignIn} className="hover:shadow-lg transition-all duration-200">
              View All Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, index) => (
              <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-blue-200 transform hover:-translate-y-1 ${activeJob === index ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-100'}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-blue-600 font-semibold">{job.company}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">{job.type}</Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-semibold text-green-600">{job.salary}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs">{job.posted}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg transition-all duration-200" size="sm">
                    Apply Now
                    <Play className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Enhanced Companies Section */}
      {/* <section id="companies" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Global Partners</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              Join professionals working at these top companies worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {["Microsoft", "Google", "Amazon", "TCS", "Infosys", "Wipro"].map((company, index) => (
              <div key={index} className="group text-center">
                <div className="h-20 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-lg transition-all duration-300 group-hover:scale-105 border border-gray-100">
                  <span className="text-lg font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{company}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-6">and 50,000+ more companies trust ROJGAR SETU</p>
            <Button onClick={handleSignIn} variant="outline" className="hover:shadow-lg transition-all duration-200">
              Join Our Network
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section> */}

      {/* Enhanced Success Stories */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Success Stories</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Stories, Real Success</h2>
            <p className="text-xl text-gray-600">Hear from our community members</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Software Engineer at Microsoft",
                story: "ROJGAR SETU's AI-powered matching connected me with my dream job at Microsoft. The journey was seamless and the support was incredible!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
              },
              {
                name: "Rahul Kumar",
                role: "Data Scientist at Google",
                story: "The platform's career guidance and networking opportunities opened doors I never knew existed. Highly recommend for all students!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
              },
              {
                name: "Anita Patel",
                role: "Product Manager at Amazon",
                story: "From college to corporate - ROJGAR SETU made the transition smooth. The mentorship program was a game-changer for my career.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
              }
            ].map((story, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-blue-50/50">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">"{story.story}"</p>
                  <div className="flex items-center">
                    <img 
                      src={story.image} 
                      alt={story.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{story.name}</div>
                      <div className="text-sm text-blue-600">{story.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Enhanced CTA Section */}
      {/* <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Join the Revolution</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join millions of students and professionals building successful careers with ROJGAR SETU
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold hover:shadow-2xl transition-all duration-300 group"
              onClick={handleSignIn}
            >
              <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Your Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold hover:shadow-2xl transition-all duration-300 group"
              onClick={handleScheduleDemo}
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
          
          <div className="flex justify-center items-center space-x-8 text-white/80">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure & Trusted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">100% Free to Start</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Proven Results</span>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div>
                  <img src="/images/favicon.png" alt="Rojgar Setu Logo" className="w-12 h-12 rounded-full border-2 border-blue-200 shadow-md bg-white p-1 mr-2" />
                </div>
                <span className="text-xl font-bold">ROJGAR SETU</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                India's leading career platform connecting students with unlimited opportunities and helping them build successful careers.
              </p>
              <div className="flex space-x-4">
                <button onClick={() => window.open('https://twitter.com', '_blank')} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                  <Twitter className="w-5 h-5" />
                </button>
                <button onClick={() => window.open('https://linkedin.com', '_blank')} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button onClick={() => window.open('https://github.com', '_blank')} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                  <Github className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">For Students</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={handleSignIn} className="hover:text-white transition-colors">Register</button></li>
                <li><button onClick={handleSignIn} className="hover:text-white transition-colors">Search Jobs</button></li>
                <li><button onClick={handleSignIn} className="hover:text-white transition-colors">Career Resources</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">For Employers</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={handleSignIn} className="hover:text-white transition-colors">Post Jobs</button></li>
                <li><button onClick={handleSignIn} className="hover:text-white transition-colors">Hire Talent</button></li>
                <li><button onClick={handleScheduleDemo} className="hover:text-white transition-colors">Enterprise Solutions</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={handleContactClick} className="hover:text-white transition-colors">Contact Us</button></li>
                {/* <li><button onClick={handleHelpCenterClick} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={handlePrivacyClick} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={handleTermsClick} className="hover:text-white transition-colors">Terms of Service</button></li> */}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ROJGAR SETU. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0 flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for students across India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index_Website;
