import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Zap } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const CTASection: React.FC = () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
    navigate('/login_panel');
  };
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-purple-400/20 rounded-full blur-xl animate-bounce-gentle"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse-glow"></div>
        </div>
      </div>

{/* Infinite Sliding Wave */}
<div className="absolute bottom-0 left-0 right-0 overflow-hidden h-20 z-10">
  <div className="wave-slider flex w-[200%] animate-slide-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-[50%] h-full">
      <defs>
        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
      </defs>
      <path
        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,
        70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,
        512.34,53.67,583,72.05c69.27,18,138.3,24.88,
        209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,
        25,1113-14.29,1200,52.47V0Z"
        fill="url(#waveGradient1)"
      />
    </svg>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-[50%] h-full -ml-px transform scale-x-[-1.001]">
      <defs>
        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
      </defs>
      <path
        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,
        70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,
        512.34,53.67,583,72.05c69.27,18,138.3,24.88,
        209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,
        25,1113-14.29,1200,52.47V0Z"
        fill="url(#waveGradient2)"
      />
    </svg>
  </div>
</div>



      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white mb-8"
            >
              <Zap className="mr-2 text-yellow-300" size={20} />
              <span className="font-medium">Join 2M+ Users Already Transforming Their Careers</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
            >
              Ready to Bridge Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300">
                Future?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Don't let opportunities pass by. Join India's most trusted platform 
              for connecting talent with success. Your dream career is just one click away.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                onClick={handleSignIn}
              >
                <span>Start Your Journey Now</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={24} />
              </motion.button>

              {/* <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Learn More
              </motion.button> */}
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Users,
                number: "2M+",
                label: "Active Users",
                gradient: "from-blue-400 to-purple-500"
              },
              {
                icon: Target,
                number: "95%",
                label: "Success Rate",
                gradient: "from-green-400 to-blue-500"
              },
              {
                icon: Zap,
                number: "24/7",
                label: "Support",
                gradient: "from-yellow-400 to-orange-500"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.gradient} mb-4`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Urgency Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-12 inline-flex items-center px-6 py-3 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-300/30 text-white"
          >
            <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium">
              🔥 Limited Time: Free premium access for first 1000 students!
            </span>
          </motion.div>
        </div>
      </div>
      <style>{`
  @keyframes wave {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .animate-wave {
    animation: wave 15s linear infinite;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-bounce-gentle {
    animation: bounce-gentle 5s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }

  @keyframes slide-wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-slide-wave {
  animation: slide-wave 6s linear infinite;
}

`}</style>

    </section>
  );
};

export default CTASection;