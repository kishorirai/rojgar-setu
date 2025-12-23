import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const FAQ: React.FC = () => {
    const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const handleContactClick = () => {
    navigate('/contact');
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: 'How do I register on Rojgar Setu?',
      answer: 'Registration is simple! Choose your user type (Student, College, or Company), fill out your profile with relevant details, and verify your email. The entire process takes less than 5 minutes.'
    },
    {
      question: 'Is Rojgar Setu free to use?',
      answer: 'Yes! Rojgar Setu is completely free for colleges and companies. For students, there is only an affordable charge of ₹85 for the KYC process.'
    },
    {
      question: 'How does the job matching algorithm work?',
      answer: 'Our AI-powered algorithm analyzes your skills, experience, location preferences, salary expectations, and career goals to suggest the most relevant opportunities. It learns from your interactions to improve recommendations over time.'
    },
    {
      question: 'Can I apply for jobs in different cities?',
      answer: 'Absolutely! Rojgar Setu covers all major cities across India. You can set multiple location preferences and apply for opportunities nationwide. We also provide relocation assistance information.'
    },
    {
      question: 'How do colleges benefit from Rojgar Setu?',
      answer: 'Colleges can manage student placements, track success metrics, connect with industry partners, and showcase their placement statistics. Our platform helps increase placement rates by up to 40%.'
    },
    {
      question: 'What verification process do you have for companies?',
      answer: 'All companies undergo a thorough verification process by our sales team. We check their business registration, employee count, and past hiring history to ensure legitimacy.'
    },
    {
      question: 'Can I get internship opportunities through the platform?',
      answer: 'Yes! We have thousands of internship opportunities ranging from 1-month to 1-year programs. Many of our internships also convert to full-time offers based on performance.'
    },
    {
      question: 'Is my personal data secure on the platform?',
      answer: 'Data security is our top priority. We use enterprise-grade encryption, secure servers, and follow strict privacy policies. Your data is never shared without your explicit consent.'
    },
    {
      question: 'How can I contact customer support?',
      answer: 'Our support team is available 24/7.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers! Find everything you need to know 
            about Rojgar Setu and how it can transform your career journey.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <motion.button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-2 rounded-full ${
                      openItems.includes(index) 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {openItems.includes(index) ? <Minus size={20} /> : <Plus size={20} />}
                  </motion.div>
                </div>
              </motion.button>

              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="h-px bg-gray-200 mb-4"></div>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="rounded-2xl p-8 text-white"
          style={{
                background: 'linear-gradient(to right,rgb(156, 34, 197),rgb(40, 80, 167))', // gray-900 to blue-600
              }}
          >
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-white/90 mb-6">
              Our friendly support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                onClick={handleContactClick}
              >
                Contact Support
              </motion.button>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Schedule a Call
              </motion.button> */}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;