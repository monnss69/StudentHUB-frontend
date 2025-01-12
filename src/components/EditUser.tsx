import { useAuth } from "@/provider/authProvider";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { DecodedToken, UserData, EditData } from "@/types";
import { apiService } from "@/services/api";
import { motion } from "framer-motion";
import { User, Mail, Camera, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EditUser = () => {
  const { token } = useAuth();
  const [editData, setEditData] = useState<EditData | null>({
    username: "",
    email: "",
    avatar_url: "",
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isDeletingImage, setIsDeletingImage] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalUsername, setOriginalUsername] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
      const username = decoded?.sub;
      if (!username) throw new Error("Error fetching user data");
      try {
        const user = await apiService.getUserByUsername(username);
        setUserData(user);
        setEditData({
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        });
        setOriginalUsername(user.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleAvatarUpdateForNewUsername = async (
    newUsername: string,
    currentAvatarUrl: string
  ) => {
    setIsUploadingImage(true);
    try {
      // First, fetch the image data from the current URL
      const response = await fetch(currentAvatarUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile-image.jpg", {
        type: "image/jpeg",
      });

      // Upload the image with the new username
      const newAvatarUrl = await apiService.uploadImage(file, newUsername);

      // Delete the old image
      await apiService.removeImage(originalUsername);

      return newAvatarUrl;
    } catch (error) {
      console.error("Error updating avatar for new username:", error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    // Create a temporary preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsUploadingImage(true);

    try {
      // Upload the image to the backend
      const uploadedUrl = await apiService.uploadImage(file, userData.username);

      // Update both the edit data and preview with the new URL
      setEditData((prev) => ({
        ...prev!,
        avatar_url: uploadedUrl,
      }));

      // Clean up the temporary preview URL
      URL.revokeObjectURL(previewUrl);
      setImagePreview(null);

      // Show success message
      window.alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      window.alert("Failed to upload profile picture");
      // Revert to the original avatar URL on failure
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRedoUpload = async () => {
    if (!userData || !editData?.avatar_url) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to change your profile picture? This will remove the current one."
    );

    if (!confirmDelete) return;

    setIsDeletingImage(true);
    try {
      // First, delete the existing image from Cloudinary
      await apiService.removeImage(userData.username);

      // Reset the avatar_url in editData
      setEditData((prev) => ({
        ...prev!,
        avatar_url: "", // Reset to empty or a default avatar URL
      }));

      // Trigger the file input click
      const fileInput = document.getElementById(
        "avatar-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    } catch (error) {
      console.error("Error removing image:", error);
      window.alert("Failed to remove current profile picture");
    } finally {
      setIsDeletingImage(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({
      ...editData!,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!userData || !editData) {
        throw new Error("Missing user data");
      }

      let finalAvatarUrl = editData.avatar_url;

      // Check if username has changed and there's an existing avatar
      if (editData.username !== originalUsername && editData.avatar_url) {
        try {
          finalAvatarUrl = await handleAvatarUpdateForNewUsername(
            editData.username,
            editData.avatar_url
          );
        } catch (error) {
          console.error("Failed to update avatar for new username:", error);
          window.alert(
            "Failed to update avatar for new username. Profile update cancelled."
          );
          return;
        }
      }

      // Update user profile with possibly new avatar URL
      await apiService.updateUser(userData.id, {
        ...editData,
        avatar_url: finalAvatarUrl,
      });

      // Update the original username after successful update
      setOriginalUsername(editData.username);

      window.alert("Profile updated successfully!");
      const logoutSuccess = await apiService.logoutAfterEdit();

      if (logoutSuccess) {
        // Small delay to ensure cookies are cleared before reload
        setTimeout(() => {
          window.location.href = "/login"; // Redirect to login page
        }, 500);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      window.alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!editData || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 via-blue-900 to-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 via-blue-900 to-gray-900">
      {/* Background animation elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-8"
        >
          {/* Header with Avatar */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-36 h-36 mx-auto mb-4"
            >
              <img
                src={imagePreview || editData?.avatar_url}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-2 border-blue-400"
              />
              {/* Camera icon for first upload */}
              {!editData?.avatar_url && (
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 
                                             cursor-pointer hover:bg-blue-600 transition-colors
                                             focus:outline-none focus:ring-2 focus:ring-offset-2 
                                             focus:ring-blue-500 ${
                                               isUploadingImage
                                                 ? "opacity-50 cursor-not-allowed"
                                                 : ""
                                             }`}
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                </label>
              )}

              {/* Change photo button */}
              {editData?.avatar_url && (
                <button
                  onClick={handleRedoUpload}
                  disabled={isUploadingImage || isDeletingImage}
                  className={`absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 
                                             cursor-pointer hover:bg-blue-600 transition-colors
                                             focus:outline-none focus:ring-2 focus:ring-offset-2 
                                             focus:ring-blue-500 group
                                             ${
                                               isUploadingImage ||
                                               isDeletingImage
                                                 ? "opacity-50 cursor-not-allowed"
                                                 : ""
                                             }`}
                >
                  {isDeletingImage ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-white group-hover:rotate-180 transition-transform duration-300" />
                  )}
                </button>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage || isDeletingImage}
                className="hidden"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-blue-200 mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              Edit Profile
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg 
                                         text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 
                                         focus:border-transparent transition-all"
                placeholder="Username"
              />
            </div>

            {/* Email input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg 
                                         text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 
                                         focus:border-transparent transition-all"
                placeholder="Email"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white 
                                     font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transform 
                                     hover:-translate-y-0.5 transition-all duration-200 
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     ring-1 ring-blue-400/30"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
    </div>
  );
};

export default EditUser;
