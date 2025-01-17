import React, { useState } from "react";
import { User, Lock, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../../services/api.ts";
import { useAuth } from "../../../auth/authProvider.tsx";
import LoadingState from "@/components/CommonState/LoadingState.tsx";
import { LoginInput } from "@/types";

const Login = () => {
  const [formData, setFormData] = useState<LoginInput>({ username: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.login(formData);
      if (response) {
        setToken(response.token);
        navigate("/");
      }
    } catch (err: unknown) {
      console.error("Error during login:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Background animation elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      {/* Main Container */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <GraduationCap className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-blue-200 mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              Welcome Back
            </h1>
            <p className="text-gray-400">Continue your learning journey</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                required
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg 
                         text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg 
                         text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white 
                       font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transform 
                       hover:-translate-y-0.5 transition-all duration-200 ring-1 ring-blue-400/30"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              New to StudentHub? Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
