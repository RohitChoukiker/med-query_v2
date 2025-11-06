import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Stethoscope,
  Microscope,
  Heart,
  Shield,
  ArrowLeft,
  Activity,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth, UserRole } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from '../../api';

interface SignupPageProps {
  onBackToLanding?: () => void;
  onSwitchToLogin?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({
  onBackToLanding,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedRole: "doctor" as UserRole,
    licenseNumber: "",
    institution: "",
    specialization: "",
    agreeToTerms: false,
    agreeToHipaa: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: "doctor" as UserRole,
      label: "Medical Doctor",
      icon: Stethoscope,
      color: "from-brand-500 to-accent-blue-light dark:to-accent-blue-dark",
      description: "Licensed physician providing patient care",
      requirements: ["Medical License", "Hospital Affiliation"],
    },
    {
      id: "researcher" as UserRole,
      label: "Medical Researcher",
      icon: Microscope,
      color:
        "from-accent-purple-light to-pink-500 dark:from-accent-purple-dark dark:to-pink-400",
      description: "Research scientist in medical field",
      requirements: ["PhD/MD", "Research Institution"],
    },
    {
      id: "patient" as UserRole,
      label: "Patient",
      icon: Heart,
      color:
        "from-accent-green-light to-brand-600 dark:from-accent-green-dark dark:to-brand-500",
      description: "Individual seeking health information",
      requirements: ["Valid Email", "Age Verification"],
    },
    {
      id: "admin" as UserRole,
      label: "System Administrator",
      icon: Shield,
      color:
        "from-accent-orange-light to-red-500 dark:from-accent-orange-dark dark:to-red-400",
      description: "Healthcare system administrator",
      requirements: ["Admin Approval", "Institution Verification"],
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      (formData.selectedRole === "doctor" ||
        formData.selectedRole === "researcher") &&
      !formData.licenseNumber.trim()
    ) {
      newErrors.licenseNumber =
        "License/ID number is required for medical professionals";
    }

    if (!formData.institution.trim() && formData.selectedRole !== "patient") {
      newErrors.institution = "Institution/Hospital name is required";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    if (!formData.agreeToHipaa) {
      newErrors.agreeToHipaa =
        "You must acknowledge HIPAA compliance requirements";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.signup({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.selectedRole,
        license_number: formData.licenseNumber,
        institution: formData.institution,
        specialization: formData.specialization,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          "Welcome to MedQuery Agent! Account created successfully."
        );
        
        // Redirect to login page after successful signup
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error("Account creation failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      
      // Show specific error message from backend
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 flex items-center justify-center p-4 font-medical">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Medical Back Button */}
        {onBackToLanding && (
          <motion.button
            onClick={onBackToLanding}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            className="flex items-center space-x-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-all duration-300 p-2 rounded-lg hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Medical Portal</span>
          </motion.button>
        )}

        {/* Medical Header */}
        <div className="text-center mb-8">
         
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-blue-light dark:from-brand-400 dark:to-accent-blue-dark bg-clip-text text-transparent mb-2">
            Join our MedQuery Agent
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Create your professional medical account
          </p>
          
        </div>

        {/* Medical Signup Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl border border-light-border/50 dark:border-dark-border/50 shadow-medical dark:shadow-medical-dark p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medical Role Selection */}
            <div>
             
              <div className="flex gap-3 w-full overflow-x-auto">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      type="button"
                      onClick={() => handleInputChange("selectedRole", role.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 min-w-[90px] p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.selectedRole === role.id
                          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 shadow-medical dark:shadow-medical-dark"
                          : "border-light-border dark:border-dark-border bg-surface-light/30 dark:bg-surface-dark/30 hover:border-brand-300 dark:hover:border-brand-600"
                      }`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary block mb-1">
                        {role.label}
                      </span>
                      <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
                        {role.description}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter Your Full Name"
                    className={`w-full pl-10 pr-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${
                      errors.fullName
                        ? "border-red-500"
                        : "border-light-border/50 dark:border-dark-border/50"
                    }`}
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Medical Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="doctor@hospital.com"
                    className={`w-full pl-10 pr-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${
                      errors.email
                        ? "border-red-500"
                        : "border-light-border/50 dark:border-dark-border/50"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Information */}
            {formData.selectedRole !== "patient" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    {formData.selectedRole === "doctor"
                      ? "Medical License Number"
                      : formData.selectedRole === "researcher"
                      ? "Research ID/License"
                      : "Professional ID"}
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      handleInputChange("licenseNumber", e.target.value)
                    }
                    placeholder={
                      formData.selectedRole === "doctor"
                        ? "MD123456"
                        : "RES789012"
                    }
                    className={`w-full px-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${
                      errors.licenseNumber
                        ? "border-red-500"
                        : "border-light-border/50 dark:border-dark-border/50"
                    }`}
                    required
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    {formData.selectedRole === "doctor"
                      ? "Hospital/Clinic"
                      : formData.selectedRole === "researcher"
                      ? "Research Institution"
                      : "Organization"}
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) =>
                      handleInputChange("institution", e.target.value)
                    }
                    placeholder={
                      formData.selectedRole === "doctor"
                        ? "Your Clinic"
                        : "Your University"
                    }
                    className={`w-full px-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${
                      errors.institution
                        ? "border-red-500"
                        : "border-light-border/50 dark:border-dark-border/50"
                    }`}
                    required
                  />
                  {errors.institution && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.institution}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Specialization (Optional) */}
            {(formData.selectedRole === "doctor" ||
              formData.selectedRole === "researcher") && (
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Specialization (Optional)
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  placeholder={
                    formData.selectedRole === "doctor"
                      ? "Cardiology, Neurology, etc."
                      : "Oncology Research, Clinical Trials, etc."
                  }
                  className="w-full px-4 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border border-light-border/50 dark:border-dark-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted"
                />
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Create a strong password"
                    className={`w-full pl-10 pr-12 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${
                      errors.password
                        ? "border-red-500"
                        : "border-light-border/50 dark:border-dark-border/50"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-secondary dark:hover:text-dark-text-secondary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordStrength
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                      Password strength:{" "}
                      {passwordStrength <= 2
                        ? "Weak"
                        : passwordStrength <= 3
                        ? "Medium"
                        : "Strong"}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-12 py-3 bg-surface-light/50 dark:bg-surface-dark/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-light-border/50 dark:border-dark-border/50"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-secondary dark:hover:text-dark-text-secondary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p className="mt-1 text-xs text-green-500 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Passwords match
                    </p>
                  )}
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    handleInputChange("agreeToTerms", e.target.checked)
                  }
                  className="mt-1 w-4 h-4 text-brand-600 bg-surface-light dark:bg-surface-dark border-light-border dark:border-dark-border rounded focus:ring-brand-500 focus:ring-2"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-light-text-secondary dark:text-dark-text-secondary"
                >
                  I agree to the{" "}
                  <span className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                    Privacy Policy
                  </span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.agreeToTerms}
                </p>
              )}

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToHipaa"
                  checked={formData.agreeToHipaa}
                  onChange={(e) =>
                    handleInputChange("agreeToHipaa", e.target.checked)
                  }
                  className="mt-1 w-4 h-4 text-brand-600 bg-surface-light dark:bg-surface-dark border-light-border dark:border-dark-border rounded focus:ring-brand-500 focus:ring-2"
                />
                <label
                  htmlFor="agreeToHipaa"
                  className="text-sm text-light-text-secondary dark:text-dark-text-secondary"
                >
                  I acknowledge and agree to{" "}
                  <span className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                    HIPAA compliance requirements
                  </span>{" "}
                  and medical data handling policies
                </label>
              </div>
              {errors.agreeToHipaa && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.agreeToHipaa}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-brand-500 to-accent-blue-light dark:to-accent-blue-dark text-white py-3 rounded-xl font-medium transition-all hover:shadow-medical dark:hover:shadow-medical-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-professional flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Create Medical Account</span>
                </>
              )}
            </motion.button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Already have a medical account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>

          {/* Medical Security Notice */}
          <div className="mt-6 p-4 bg-accent-green-light/10 dark:bg-accent-green-dark/10 rounded-xl border border-accent-green-light/20 dark:border-accent-green-dark/20">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-accent-green-light dark:text-accent-green-dark" />
              <span className="text-sm font-medium text-accent-green-light dark:text-accent-green-dark">
                Medical Grade Security
              </span>
            </div>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
              Your account will be verified according to medical industry
              standards. All data is encrypted and HIPAA compliant.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
