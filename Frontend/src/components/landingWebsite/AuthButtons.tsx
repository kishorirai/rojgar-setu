import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building, 
  Users, 
  UserPlus,
  LogIn,
  Briefcase
} from 'lucide-react';
import { FaUserGraduate, FaBuilding, FaUniversity } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const AuthButtons: React.FC = () => {
  const navigate = useNavigate();
  const userTypes = [
    {
      type: 'student',
      title: 'Students',
      loginIcon: FaUserGraduate,
      signupIcon: UserPlus,
      gradient: 'from-blue-500 to-purple-600',
      description: 'Discover opportunities & build your career',
      loginText: 'Student Login',
      path: '/student-login'
    },
    {
      type: 'college',
      title: 'Colleges',
      loginIcon: FaUniversity,
      signupIcon: Users,
      gradient: 'from-orange-500 to-red-600',
      description: 'Connect students with industry partners',
      loginText: 'College Login',
      path: '/college-login'
    },
    {
      type: 'company',
      title: 'Companies',
      loginIcon: FaBuilding,
      signupIcon: Building,
      gradient: 'from-green-500 to-teal-600',
      description: 'Find talented professionals & interns',
      loginText: 'Company Login',
      path: '/company-login'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Choose Your Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of students, colleges, and companies already transforming 
            careers through Rojgar Setu
          </p>
        </motion.div>

        {/* Auth Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {userTypes.map((userType, index) => (
            <motion.div
              key={userType.type}
              variants={cardVariants}
              className="relative group"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${userType.gradient} mb-4`}>
                    <userType.loginIcon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {userType.title}
                  </h3>
                  <p className="text-gray-600">
                    {userType.description}
                  </p>
                </div>

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full mb-4 px-6 py-3 bg-gradient-to-r ${userType.gradient} text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300`}
                  onClick={() => navigate(userType.path)}
                >
                  <LogIn size={20} />
                  <span>{userType.loginText}</span>
                </motion.button>

                {/* Signup Button */}
                {/* <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-6 py-3 border-2 border-gradient-to-r border-gray-300 text-gray-700 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-50 transition-all duration-300 group-hover:border-gray-400`}
                >
                  <userType.signupIcon size={20} />
                  <span>{userType.signupText}</span>
                </motion.button> */}

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${userType.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Why Choose Rojgar Setu?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">100k+</div>
                <div className="text-gray-600">Job Opportunities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">99%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuthButtons;