"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "./lib/axios";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
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
    <div className="min-h-screen flex bg-[#FDF6EC] text-[#2C2C2C]">
      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-6 space-x-2">
            <div className="bg-green-600 p-2 rounded-lg">
                        <Zap className="text-white w-6 h-6" />
                      </div>
            <h1 className="text-3xl font-bold">PowerShare</h1>
          </div>

          <h2 className="text-2xl font-semibold mb-1">
            {isLogin ? "Welcome Back" : "Join the Solar Movement"}
          </h2>
          <p className="mb-6 text-sm text-[#555]">
            {isLogin
              ? "Log in to access community-powered EV charging"
              : "Create an account to start sharing your energy"}
          </p>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block mb-1 text-sm font-medium">Name:</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-2 w-full border italic border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F2B705] outline-none"
                    placeholder="Enter your name"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium">Email:</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-2 w-full border italic border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F2B705] outline-none"
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label className="block mb-1 text-sm font-medium">Mobile Number:</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-2 w-full border italic border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F2B705] outline-none"
                    placeholder="Enter your mobile number"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium">Password:</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={isShowPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-12 py-2 w-full border italic border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F2B705] outline-none"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!isShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  disabled={isLoading}
                >
                  {isShowPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block mb-1 text-sm font-medium">Confirm Password:</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={isShowPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-2 w-full border italic border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F2B705] outline-none"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-2 bg-[#1F7A8C] text-white rounded-lg hover:bg-[#18606F] transition font-medium flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-sm text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleAuthMode}
              className="ml-1 font-medium text-[#F2B705] hover:text-[#E89A00]"
              disabled={isLoading}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side: Branding */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-[#FFEABF]">
        <div className="max-w-xs text-center px-6">
          <p className="text-lg italic text-[#333] mb-4">
            "Lets share power."
          </p>
          <img alt="power share"></img>
        </div>
      </div>
    </div>
  );
};

export default PowerShareLogin;