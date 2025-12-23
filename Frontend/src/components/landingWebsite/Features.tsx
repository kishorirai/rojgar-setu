import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Building,
  Search,
  MessageSquare,
  TrendingUp,
  Shield,
  Globe,
  Zap
} from 'lucide-react';

const Features: React.FC = () => {
  const userTypeFeatures = [
    {
      type: 'Students',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-purple-600',
      features: [
        { icon: Search, text: 'Smart Job Matching' },
        { icon: TrendingUp, text: 'Skill Development' },
        { icon: Users, text: 'Peer Networking' },
        { icon: MessageSquare, text: 'Mentor Connect' }
      ]
    },
    {
      type: 'Colleges',
      icon: Building,
      gradient: 'from-green-500 to-teal-600',
      features: [
        { icon: Users, text: 'Student Placement' },
        { icon: TrendingUp, text: 'Industry Connect' },
        { icon: Shield, text: 'Quality Assurance' },
        { icon: Globe, text: 'Global Reach' }
      ]
    },
    {
      type: 'Companies',
      icon: Building,
      gradient: 'from-orange-500 to-red-600',
      features: [
        { icon: Search, text: 'Talent Discovery' },
        { icon: Zap, text: 'Quick Hiring' },
        { icon: TrendingUp, text: 'Growth Analytics' },
        { icon: Shield, text: 'Verified Profiles' }
      ]
    }
  ];

  const globalFeatures = [
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Enterprise-grade security with verified profiles and data protection.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'AI-powered matching engine that connects you instantly.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Pan-India Network',
      description: 'Access opportunities across all states and territories of India.',
      color: 'from-green-500 to-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with comprehensive analytics.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
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
            Features That Empower
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Rojgar Setu transforms the way students, colleges, 
            and companies connect and collaborate.
          </p>
        </motion.div>

        {/* User Type Features */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {userTypeFeatures.map((userType, index) => (
            <motion.div
              key={userType.type}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${userType.gradient} mb-4`}>
                    <userType.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    For {userType.type}
                  </h3>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  {userType.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 + featureIndex * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${userType.gradient}`}>
                        <feature.icon className="text-white" size={16} />
                      </div>
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${userType.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Rojgar Setu?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {globalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-4`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl p-12 text-center text-white"
          style={{
                background: 'linear-gradient(to right,rgb(156, 34, 197),rgb(40, 80, 167))', // gray-900 to blue-600
              }}
        >
          <h3 className="text-3xl font-bold mb-8">Our Impact Across India</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-white/90">Successful Placements</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-white/90">Partner Institutes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/90">Hiring Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">28</div>
              <div className="text-white/90">States & UTs</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;