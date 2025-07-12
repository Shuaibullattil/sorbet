"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "./lib/axios";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  Sun,
  Battery,
  Users,
  Leaf,
} from "lucide-react";

// Type definitions for API responses
interface LoginResponse {
  token: string;
  token_type: string;
}

interface RegisterResponse {
  msg: string;
  token: string;
  user: {
    name: string;
    email: string;
  };
}

const PowerShareLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isShowPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isLogin && !formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!isLogin && !formData.mobile.trim()) {
      setError("Mobile number is required");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login API call
        const response = await api.post<LoginResponse>("/user/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.token) {
          // Store token in localStorage
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("token_type", response.data.token_type);
          
          // Redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        // Register API call
        const response = await api.post<RegisterResponse>("/user/register", {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
        });

        if (response.data.token) {
          // Store token in localStorage
          localStorage.setItem("token", response.data.token);
          
          // Store user info if needed
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
          
          // Redirect to dashboard
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError(isLogin ? "Login failed. Please try again." : "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 text-[#1B3C2E]">
      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-xl p-8 backdrop-blur-md">
          <div className="flex items-center mb-8 space-x-3 animate-fade-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
              <Zap className="text-white w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              PowerShare
            </h1>
          </div>

          <h2 className="text-3xl font-bold mb-2 animate-slide-up">
            {isLogin ? "Welcome Back" : "Join the Solar Movement"}
          </h2>
          <p className="mb-8 text-lg text-[#555] leading-relaxed animate-slide-up-delay">
            {isLogin
              ? "Log in to access community-powered EV charging and renewable energy sharing"
              : "Create an account to start sharing your energy and earning from your solar panels"}
          </p>

          {/* Feature highlights for registration */}
          {!isLogin && (
            <div className="mb-6 p-4 bg-white/50 rounded-xl border border-green-200 animate-fade-in">
              <div className="flex items-center space-x-2 mb-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-green-700">Why Join PowerShare?</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4 text-green-500" />
                  <span>Earn money from your excess solar energy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Join a community of energy producers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span>Contribute to a sustainable future</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div className="animate-slide-up-delay-2">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="animate-slide-up-delay-3">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {!isLogin && (
              <div className="animate-slide-up-delay-4">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Mobile Number</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your mobile number"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="animate-slide-up-delay-5">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                <input
                  name="password"
                  type={isShowPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-12 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!isShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {isShowPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="animate-slide-up-delay-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    name="confirmPassword"
                    type={isShowPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] animate-slide-up-delay-7"
            >
              <span>
                {isLoading 
                  ? (isLogin ? "Signing In..." : "Creating Account...") 
                  : (isLogin ? "Sign In" : "Create Account")
                }
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-sm text-center mt-8 text-gray-600 animate-fade-in-delay">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleAuthMode}
              className="ml-1 font-semibold text-green-600 hover:text-green-700 transition-colors"
              disabled={isLoading}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side: Enhanced Branding */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-lg text-center px-8 relative z-10">
          {/* Main image */}
          <div className="mb-8 animate-float">
            <Image
              src="/Wind turbine-bro.svg"
              alt="Renewable Energy Wind Turbine"
              width={400}
              height={400}
              className="w-full max-w-md mx-auto drop-shadow-2xl"
              priority
            />
          </div>
          
          {/* Engaging copy */}
          <div className="space-y-6">
            <h3 className="text-4xl font-bold text-gray-800 leading-tight animate-fade-in-up">
              Let's Share Power
            </h3>
            
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up-delay">
              Join thousands of households already sharing renewable energy and earning from their solar panels
            </p>
            
            {/* Key benefits */}
            <div className="grid grid-cols-1 gap-4 mt-8 animate-fade-in-up-delay-2">
              <div className="flex items-center justify-center space-x-3 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Instant Energy Sharing</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Community Driven</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium text-gray-700">Sustainable Future</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerShareLogin;