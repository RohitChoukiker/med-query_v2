import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Stethoscope,
  Brain,
  Shield,
  Zap,
  Users,
  FileText,
  MessageSquare,
  ChevronRight,
  Play,
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Lock,
  TrendingUp,
  Heart,
  Activity,
  Microscope,
  UserCheck,
  UserPlus,
} from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onSignupClick,
}) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Medical Analysis",
      description:
        "Advanced machine learning algorithms trained on medical literature to provide accurate diagnostic insights and treatment recommendations.",
      color: "from-brand-500 to-accent-blue-light dark:to-accent-blue-dark",
      medicalField: "Artificial Intelligence in Medicine",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant Security",
      description:
        "Enterprise-grade security with end-to-end encryption ensuring complete patient data privacy and regulatory compliance.",
      color:
        "from-accent-green-light to-brand-600 dark:from-accent-green-dark dark:to-brand-500",
      medicalField: "Healthcare Data Protection",
    },
    {
      icon: Activity,
      title: "Real-time Medical Monitoring",
      description:
        "Continuous analysis of patient vitals, lab results, and medical imaging with instant alerts for critical conditions.",
      color:
        "from-accent-purple-light to-accent-blue-light dark:from-accent-purple-dark dark:to-accent-blue-dark",
      medicalField: "Clinical Decision Support",
    },
    {
      icon: Microscope,
      title: "Research & Evidence-Based Care",
      description:
        "Access to latest medical research, clinical trials, and evidence-based treatment protocols from global medical databases.",
      color:
        "from-accent-orange-light to-red-500 dark:from-accent-orange-dark dark:to-red-400",
      medicalField: "Medical Research Integration",
    },
  ];

  const stats = [
    {
      number: "",
      label: "Medical Cases Analyzed",
      icon: FileText,
      description: "Diagnostic accuracy rate of 98.5%",
    },
    {
      number: "",
      label: "Healthcare Professionals",
      icon: UserCheck,
      description: "Across 45+ countries worldwide",
    },
    {
      number: "",
      label: "Clinical Accuracy Rate",
      icon: TrendingUp,
      description: "Validated by medical experts",
    },
    {
      number: "",
      label: "Medical Support Available",
      icon: Heart,
      description: "Emergency response system",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson, MD",
      role: "Chief of Cardiology",
      hospital: "Mayo Clinic",
      content:
        "MedQuery Agent has revolutionized our diagnostic workflow. The AI-powered insights have improved our diagnostic accuracy by 23% and reduced time-to-diagnosis significantly.",
      rating: 5,
      avatar:
        "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150",
      specialty: "Cardiology",
    },
    {
      name: "Dr. Michael Chen, PhD",
      role: "Director of Medical Research",
      hospital: "Johns Hopkins Hospital",
      content:
        "The research capabilities are outstanding. We can analyze complex medical datasets and identify patterns that would take months of manual review in just minutes.",
      rating: 5,
      avatar:
        "https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&w=150",
      specialty: "Medical Research",
    },
    {
      name: "Dr. Emily Rodriguez, MD",
      role: "Emergency Medicine Physician",
      hospital: "Cleveland Clinic",
      content:
        "In emergency situations, every second counts. MedQuery Agent provides instant clinical decision support that has literally helped save lives in our ER.",
      rating: 5,
      avatar:
        "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=150",
      specialty: "Emergency Medicine",
    },
  ];

  const medicalSpecialties = [
    { name: "Cardiology", icon: Heart, patients: "" },
    { name: "Neurology", icon: Brain, patients: "" },
    { name: "Radiology", icon: Activity, patients: "" },
    { name: "Pathology", icon: Microscope, patients: "Rohit" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-black transition-colors duration-300 font-medical">
      {/* Medical Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Medical Background Elements */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-brand-400/10 to-accent-blue-light/10 dark:from-brand-400/5 dark:to-accent-blue-dark/5 rounded-full blur-3xl animate-pulse-medical" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent-green-light/10 to-brand-500/10 dark:from-accent-green-dark/5 dark:to-brand-500/5 rounded-full blur-3xl animate-pulse-medical"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-300/5 to-brand-400/5 dark:from-brand-300/3 dark:to-brand-400/3 rounded-full blur-3xl" />

          {/* Medical Cross Pattern */}
          <div className="absolute top-1/4 right-1/4 w-8 h-8 text-brand-200/20 dark:text-brand-700/20">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <div className="absolute bottom-1/4 left-1/4 w-6 h-6 text-brand-200/20 dark:text-brand-700/20">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-brand-600 via-accent-blue-light to-brand-500 dark:from-brand-400 dark:via-accent-blue-dark dark:to-brand-400 bg-clip-text text-transparent">
              MedQuery
            </span>
            <br />
            <span className="text-light-text-primary dark:text-dark-text-primary">
              Agent
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary mb-4 max-w-4xl mx-auto leading-relaxed"
          >
            Revolutionizing healthcare with AI-powered medical insights,
            clinical decision support, and evidence-based diagnostic assistance
            for healthcare professionals worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-center gap-4 text-sm text-light-text-muted dark:text-dark-text-muted">
              <span className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-brand-500" />
                <span>HIPAA Compliant</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-green-light" />
                <span>FDA Validated</span>
              </span>
              <span className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-brand-500" />
                <span>Global Medical Database</span>
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <motion.button
              onClick={onSignupClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gradient-to-r from-brand-500 to-accent-blue-light dark:to-accent-blue-dark text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-medical dark:shadow-medical-dark hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Join Medical Platform</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              onClick={onLoginClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary px-8 py-4 rounded-2xl font-semibold text-lg border border-light-border/50 dark:border-dark-border/50 hover:bg-surface-light dark:hover:bg-surface-dark transition-all duration-300 flex items-center space-x-2 shadow-professional dark:shadow-professional-dark"
            >
              <Activity className="w-5 h-5" />
              <span>Medical Login</span>
            </motion.button>
          </motion.div>

          {/* Medical Specialties Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 relative"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {medicalSpecialties.map((specialty, index) => {
                const Icon = specialty.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-4 border border-light-border/50 dark:border-dark-border/50 hover:bg-surface-light dark:hover:bg-surface-dark transition-all duration-300 shadow-professional dark:shadow-professional-dark"
                  >
                    <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                      {specialty.name}
                    </p>
                   
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Medical Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-brand-50/30 dark:to-brand-900/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
              Advanced Medical AI
              <span className="bg-gradient-to-r from-brand-600 to-accent-blue-light dark:from-brand-400 dark:to-accent-blue-dark bg-clip-text text-transparent">
                {" "}
                Technology
              </span>
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Cutting-edge artificial intelligence designed specifically for
              healthcare professionals, medical researchers, and clinical
              decision support systems.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-8 border border-light-border/50 dark:border-dark-border/50 shadow-medical dark:shadow-medical-dark hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-brand-100/50 dark:bg-brand-900/30 rounded-full">
                    <span className="text-xs font-medium text-brand-700 dark:text-brand-300">
                      {feature.medicalField}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Medical Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-50/50 to-blue-50/50 dark:from-brand-900/20 dark:to-blue-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
              Trusted by Medical Professionals
              <span className="bg-gradient-to-r from-brand-600 to-accent-green-light dark:from-brand-400 dark:to-accent-green-dark bg-clip-text text-transparent">
                {" "}
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Leading hospitals, research institutions, and healthcare systems
              rely on our AI-powered medical platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-6 border border-light-border/50 dark:border-dark-border/50 shadow-medical dark:shadow-medical-dark"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-heartbeat">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2"
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-2">
                    {stat.label}
                  </p>
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    {stat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Medical Testimonials Section */}
      {/* <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
              What Medical Experts Say
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
              Hear from leading physicians and researchers about their experience with MedQuery Agent.
            </p>
          </motion.div>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-8 border border-light-border/50 dark:border-dark-border/50 shadow-medical dark:shadow-medical-dark"
          >
            <div className="flex items-center mb-6">
              <img
                src={testimonials[currentTestimonial].avatar}
                alt={testimonials[currentTestimonial].name}
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-brand-200 dark:border-brand-700"
              />
              <div>
                <h4 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  {testimonials[currentTestimonial].role}
                </p>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">
                  {testimonials[currentTestimonial].hospital}
                </p>
                <span className="inline-flex items-center px-2 py-1 bg-brand-100/50 dark:bg-brand-900/30 rounded-full mt-1">
                  <span className="text-xs text-brand-700 dark:text-brand-300">
                    {testimonials[currentTestimonial].specialty}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex mb-4">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary italic leading-relaxed">
              "{testimonials[currentTestimonial].content}"
            </p>
          </motion.div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-brand-500 scale-125'
                    : 'bg-light-text-muted dark:bg-dark-text-muted hover:bg-brand-300 dark:hover:bg-brand-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section> */}

      {/* Medical CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-500 to-accent-blue-light dark:to-accent-blue-dark">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <Stethoscope className="w-16 h-16 text-white mx-auto mb-4 animate-heartbeat" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Advance Medical Care?
            </h2>
            <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals using MedQuery Agent to
              improve patient outcomes, accelerate research, and enhance
              clinical decision-making.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button
                onClick={onSignupClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-brand-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Medical Account</span>
              </motion.button>
              <motion.button
                onClick={onLoginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Sign In</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Medical Footer */}
      <footer className="py-12 px-4 bg-gradient-to-br from-gray-900 via-gray-950 to-black dark:from-gray-950 dark:via-black dark:to-gray-900">
  <div className="max-w-6xl mx-auto">
    {/* Top Section */}
    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
      {/* Logo + Title */}
      <div className="flex items-center space-x-3 mb-6 md:mb-0">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-accent-blue-light dark:to-accent-blue-dark rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold text-white tracking-wide">
          MedQuery Agent
        </span>
      </div>

      {/* Certifications */}
      <div className="flex items-center space-x-8 text-gray-400 text-sm md:text-base">
        <span className="flex items-center space-x-2 hover:text-white transition-colors duration-200">
          <Lock className="w-4 h-4" />
          <span>HIPAA Compliant</span>
        </span>
        <span className="flex items-center space-x-2 hover:text-white transition-colors duration-200">
          <Shield className="w-4 h-4" />
          <span>FDA Validated</span>
        </span>
      </div>
    </div>

    {/* Bottom Section */}
    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
      <p className="text-sm md:text-base">
        &copy; {new Date().getFullYear()} <span className="font-semibold text-white">MedQuery Agent</span>.  
        All rights reserved. | Medical AI Platform for Healthcare Professionals
      </p>
      <p className="text-xs md:text-sm mt-3 text-gray-500 italic">
        Advancing healthcare through artificial intelligence and evidence-based medicine.
      </p>
      <p className="text-sm mt-4">
        Built by{" "}
        <a
          href="https://www.rohitsudo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-blue-light hover:text-accent-blue-dark hover:underline transition-colors duration-200 font-semibold"
        >
          Rohit Choukiker
        </a>
      </p>
    </div>
  </div>
</footer>

    </div>
  );
};

export default LandingPage;
