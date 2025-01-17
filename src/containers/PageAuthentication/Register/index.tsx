import React, { useState, useEffect } from "react";
import { User, Lock, Mail, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../../services/api";
import LoadingState from "@/components/CommonState/LoadingState";

const Register = () => {
  // Form state management
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar_url: "",
  });

  // File handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle initial file selection
  const handleImageSelection = (e: React.FormEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      window.alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      window.alert("File must be an image");
      return;
    }

    // Create preview URL for the UI
    const previewUrl = URL.createObjectURL(file);
    
    // Clean up previous preview URL if it exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(previewUrl);
    setSelectedFile(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      window.alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = "";

      // Upload image if one was selected
      if (selectedFile && formData.username) {
        try {
          avatarUrl = await apiService.uploadImage(selectedFile, formData.username);
        } catch (error) {
          console.error("Error uploading image:", error);
          window.alert("Failed to upload profile picture. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Create user with the avatar URL
      await apiService.createUser({
        username: formData.username,
        email: formData.email,
        password_hash: formData.password,
        avatar_url: avatarUrl,
      });

      window.alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Error during registration:", err);
      // If user creation fails and we uploaded an image, try to clean it up
      if (formData.username && selectedFile) {
        try {
          await apiService.removeImage(formData.username);
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded image:", cleanupError);
        }
      }
      window.alert(err instanceof Error ? err.message : "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = async () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);

    // If we already uploaded the image, remove it from Cloudinary
    if (formData.avatar_url && formData.username) {
      try {
        await apiService.removeImage(formData.username);
        setFormData(prev => ({ ...prev, avatar_url: "" }));
      } catch (error) {
        console.error("Error removing image:", error);
      }
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
              Join StudentHub
            </h1>
            <p className="text-gray-400">Begin your academic journey with us</p>
          </div>

          {/* Form Section - Username First */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username input moved before avatar upload */}
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

            {/* Avatar Upload Section */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 
                       transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 
                       hover:bg-red-600 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-red-500"
                      aria-label="Remove image"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <div
                      className="w-24 h-24 border-2 border-dashed border-blue-400 rounded-full 
                        flex items-center justify-center cursor-pointer
                        hover:border-blue-500 transition-all duration-200
                        group-hover:bg-gray-900/30"
                    >
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer p-6"
                      >
                        <User className="h-8 w-8 text-blue-400 mx-auto mb-1" />
                        <span className="text-sm text-blue-400 text-center block">
                          Add photo
                        </span>
                      </label>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelection}
                      className="hidden"
                      aria-label="Upload profile picture"
                    />
                  </div>
                )}
              </div>
              {formData.avatar_url && (
                <p className="text-sm text-green-400 text-center">
                  Image uploaded successfully
                </p>
              )}
            </div>

            {/* Remaining form inputs */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                placeholder="Email"
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

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                placeholder="Confirm Password"
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
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;