import React, { useState, useContext, useEffect } from 'react';
import { Sparkles, Menu, Loader2, Star, Award, Briefcase, Code, FileText, Cpu, Zap, BookOpen, GraduationCap, Lightbulb, Rocket, Trophy, Users, Globe, Heart, ShieldAlert, ArrowRight, CheckCircle, Lock, User, Sparkles as SparklesIcon } from 'lucide-react';
import Sidebar from './Sidebar';    
import { motion } from 'framer-motion';
import axios from 'axios';
import { SidebarContext } from './Sidebar';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AIProfilePortfolio = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/student/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/student-login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        const profileInfo = data.profile || data;
        setProfileData(profileInfo);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Unknown error');
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token]);

  const generatePortfolio = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/api/portfolio/generate`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate portfolio');
          } else {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      if (data.success && data.portfolio) {
        // Save portfolio data to localStorage for the premium portfolio view
        localStorage.setItem('portfolioData', JSON.stringify(data.portfolio));
        // Open premium portfolio in a new tab
        window.open('/portfolio-view', '_blank');
      } else {
        throw new Error('Invalid portfolio data received');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating portfolio');
      console.error('Portfolio generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // We don't need the downloadAsPDF and refreshPortfolio functions anymore
  // since we're not displaying the portfolio in this component

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }

  if (!profileData) {
    return <div className="p-10 text-center text-gray-500">No profile data found.</div>;
  }

  // Show verification completion message if payment is not paid
  if (profileData?.payment?.status !== 'paid') {
    return (
      <SidebarContext.Provider value={{ isCollapsed }}>
        <div className="flex min-h-screen">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            {/* Mobile Header */}
            <div className="lg:hidden p-4 bg-white shadow flex items-center">
              <button onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <span className="ml-4 font-bold">Rojgar Setu</span>
            </div>
            
            {/* Ultra Enhanced Verification Required Message */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
                
                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute h-${i % 3 === 0 ? 2 : 1} w-${i % 3 === 0 ? 2 : 1} ${i % 4 === 0 ? 'bg-blue-400' : i % 4 === 1 ? 'bg-purple-400' : i % 4 === 2 ? 'bg-pink-400' : 'bg-indigo-400'} rounded-full animate-float opacity-60`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 4}s`,
                      animationDuration: `${8 + Math.random() * 8}s`,
                    }}
                  />
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-lg mx-auto w-full relative z-10"
              >
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
                  
                  {/* Header Section */}
                  <div className="text-center mb-6 relative z-10">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="relative mx-auto mb-4"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl relative">
                        <Lock className="w-10 h-10 text-white" />
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <SparklesIcon className="w-3 h-3 text-white" />
                      </div>
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3"
                    >
                      🔒 Verification Required
                    </motion.h1>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-300 text-sm leading-relaxed"
                    >
                      Unlock AI Portfolio Generator with quick KYC verification
                    </motion.p>
                  </div>

                  {/* Benefits */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-6"
                  >
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white text-sm">AI-Powered Portfolios</span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Generate stunning, professional portfolios in minutes
                      </p>
                    </div>
                  </motion.div>

                  {/* Progress Steps */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mb-6"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-semibold text-blue-300 text-xs">KYC</span>
                      </div>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-gray-500"></div>
                      <div className="flex items-center space-x-2 opacity-50">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="font-semibold text-gray-400 text-xs">Portfolio</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={() => navigate('/studentProfile')}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      <ShieldAlert className="w-4 h-4 group-hover:rotate-12 transition-transform relative z-10" />
                      <span className="relative z-10">Complete Verification</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                    </button>
                    
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Back to Dashboard</span>
                    </button>
                  </motion.div>

                  {/* Quick info */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-4 text-center"
                  >
                    <p className="text-xs text-gray-400">
                      ⚡ Takes only 2-3 minutes
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Mobile Header */}
          <div className="lg:hidden p-4 bg-white shadow flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="text-indigo-600 hover:text-indigo-800 transition-colors">
              <Menu size={24} />
            </button>
            <div className="ml-4 flex items-center">
              <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Rojgar Setu</span>
            </div>
          </div>
          <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.1),transparent_50%)]" />
              
              {/* Floating particles */}
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute h-${i % 3 === 0 ? 2 : 1} w-${i % 3 === 0 ? 2 : 1} ${i % 5 === 0 ? 'bg-purple-500' : 'bg-indigo-500'} rounded-full animate-float`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 8}s`,
                    animationDuration: `${15 + Math.random() * 15}s`,
                    opacity: 0.2 + (Math.random() * 0.3)
                  }}
                />
              ))}
              
              {/* Glowing orbs */}
              <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-indigo-600/5 blur-2xl" />
              <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-purple-600/5 blur-3xl" />
              <div className="absolute top-3/4 right-1/3 h-24 w-24 rounded-full bg-blue-600/5 blur-2xl" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900 bg-opacity-50 backdrop-blur-xl shadow-2xl rounded-2xl max-w-4xl w-full px-8 py-10 text-center border border-slate-700/50 relative z-10 overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-0 h-24 w-1 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
              <div className="absolute top-1/2 right-0 h-24 w-1 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
              <div className="flex items-center justify-center mb-2">
                <Cpu className="h-8 w-8 text-indigo-400 mr-2 animate-pulse" />
                <Zap className="h-8 w-8 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">AI Portfolio Generator</h2>
              <p className="text-slate-300 text-lg mb-6">
                Generate your personalized portfolio based on your profile data. After generating, you can view your portfolio and download it as a professional PDF resume from the portfolio page.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-indigo-500/20 flex flex-col items-center">
                  <div className="bg-indigo-500/10 p-3 rounded-full mb-3">
                    <Rocket className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Professional Design</h3>
                  <p className="text-slate-400 text-sm">Stand out with a modern, eye-catching portfolio</p>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20 flex flex-col items-center">
                  <div className="bg-purple-500/10 p-3 rounded-full mb-3">
                    <GraduationCap className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Showcase Skills</h3>
                  <p className="text-slate-400 text-sm">Highlight your education and technical abilities</p>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-indigo-500/20 flex flex-col items-center">
                  <div className="bg-indigo-500/10 p-3 rounded-full mb-3">
                    <Trophy className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Feature Projects</h3>
                  <p className="text-slate-400 text-sm">Display your achievements and best work</p>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 px-6 py-4 rounded-xl relative z-10" 
                  role="alert"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="font-semibold text-red-300">Error Occurred!</strong>
                      <span className="ml-2 block text-sm opacity-90">{error}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 relative overflow-hidden group ${generating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={generatePortfolio}
                  disabled={generating}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl group-hover:opacity-75 transition-opacity opacity-0"></span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur group-hover:opacity-100 transition-opacity opacity-0"></span>
                  
                  <span className="relative flex items-center">
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        <span>Generate & View Portfolio</span>
                      </>
                    )}
                  </span>
                </motion.button>
                

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AIProfilePortfolio;