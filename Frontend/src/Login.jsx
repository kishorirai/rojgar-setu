import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBuilding, FaUniversity, FaChartLine, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Student Login',
      description: 'Access your student dashboard and explore career opportunities',
      icon: FaUserGraduate,
      color: '#3B82F6',
      bgGradient: 'from-sky-500 to-blue-600',
      hoverGradient: 'from-sky-600 to-blue-700',
      path: '/student-login'
    },
    {
      title: 'College Login',
      description: 'Manage your college dashboard and student placements',
      icon: FaUniversity,
      color: '#F59E0B',
      bgGradient: 'from-orange-500 to-amber-600',
      hoverGradient: 'from-orange-600 to-amber-700',
      path: '/college-login'
    },
    {
      title: 'Company Login',
      description: 'Access your company dashboard and recruitment tools',
      icon: FaBuilding,
      color: '#10B981',
      bgGradient: 'from-emerald-500 to-green-600',
      hoverGradient: 'from-emerald-600 to-green-700',
      path: '/company-login'
    },
    // {
    //   title: 'Sales Login',
    //   description: 'Access your sales dashboard and analytics',
    //   icon: FaChartLine,
    //   color: '#8B5CF6',
    //   bgGradient: 'from-purple-500 to-violet-600',
    //   hoverGradient: 'from-purple-600 to-violet-700',
    //   path: '/sales-login'
    // }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white/90 rounded-lg shadow-sm transition-all duration-300 backdrop-blur-sm"
      >
        <FaArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="max-w-6xl w-full space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-green-700 bg-clip-text text-transparent tracking-tight leading-tight py-2">
              रोजगार सेतु
        </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-green-600 mx-auto rounded-full"></div>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Your one-stop platform for campus placements and career opportunities
        </p>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Connect students, colleges, and companies in a seamless recruitment ecosystem
          </p>
      </div>

        {/* Login Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {loginOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => navigate(option.path)}
              className={`group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-orange-100`}
            >
              {/* Gradient Background Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Card Content */}
              <div className="relative p-8 text-center space-y-6">
                {/* Icon */}
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${option.bgGradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                  <option.icon 
                    size={32} 
                    className="text-white drop-shadow-sm" 
                  />
            </div>

                {/* Title */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
              {option.title}
            </h2>
                  <p className="text-gray-600 leading-relaxed">
              {option.description}
            </p>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${option.bgGradient} text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}>
                    <span>Access Portal</span>
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${option.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
          </div>
        ))}
      </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="w-full max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
          <p className="text-gray-600 text-sm">
            Don't have an account? Contact your administrator
          </p>
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} रोजगार सेतु. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 