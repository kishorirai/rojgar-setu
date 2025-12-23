import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  MessageCircle, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const HowItWorks: React.FC = () => {
    const navigate = useNavigate();
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Sign up and build a comprehensive profile showcasing your skills, experience, and aspirations.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Search,
      title: 'Discover Opportunities',
      description: 'Browse through thousands of job openings, internships, and collaboration projects tailored to your interests.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: MessageCircle,
      title: 'Connect & Collaborate',
      description: 'Engage with recruiters, connect with peers, and collaborate on projects that matter to you.',
      color: 'from-pink-500 to-red-600'
    },
    {
      icon: CheckCircle,
      title: 'Achieve Success',
      description: 'Land your dream job, build meaningful relationships, and grow your professional network.',
      color: 'from-red-500 to-orange-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      }
    }
  };

  const handleSignIn = () => {
    navigate('/login_panel');
  };

  return (
    <section id="how-it-works" className="py-20 bg-white">
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
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your journey to success starts with these simple steps. 
            Join the revolution that's transforming how India works.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={stepVariants}
              className={`relative mb-16 lg:mb-24 ${
                index % 2 === 0 ? 'lg:text-right lg:pr-1/2' : 'lg:text-left lg:pl-1/2'
              }`}
            >
              <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                {/* Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl shadow-xl p-8 relative border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} mb-6`}>
                    <step.icon className="text-white" size={32} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2">
                      <div className={`${
                        index % 2 === 0 
                          ? '-right-8 rotate-45' 
                          : '-left-8 -rotate-45'
                      } w-4 h-4 bg-gradient-to-r ${step.color} rounded-sm`}>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Timeline Node */}
                <div className="hidden lg:block absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
            style={{
                background: 'linear-gradient(to right,rgb(156, 34, 197),rgb(40, 80, 167))', // gray-900 to blue-600
              }}
              onClick={handleSignIn}
          >
            <span>Start Your Journey</span>
            <ArrowRight className="ml-2" size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;