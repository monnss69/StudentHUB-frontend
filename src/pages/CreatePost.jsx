import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useAuth } from "@/provider/authProvider";
import { jwtDecode } from "jwt-decode";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQueryClient } from '@tanstack/react-query';

const CreatePost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    author_id: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Decode token to get username
        const decoded = jwtDecode(token);
        const username = decoded.sub;

        // Fetch categories
        const categoryResponse = await apiService.getCategories();
        setCategories(categoryResponse);

        // Fetch user ID using username
        const userResponse = await apiService.getUserByUsername(username);

        setFormData(prev => ({
          ...prev,
          author_id: userResponse.id
        }));
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('Failed to load necessary data');
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createPost(formData);
      
      const categoryName = categories.find(cat => cat.ID === formData.category_id).Name;
      
      if (categoryName === 'Academic Hub') {
        queryClient.invalidateQueries(QUERY_KEYS.ACADEMIC_HUB);
        navigate("/academic-hub");
      } else if (categoryName === 'Campus Community') {
        queryClient.invalidateQueries(QUERY_KEYS.CAMPUS_COMMUNITY);
        navigate("/campus-community");
      } else if (categoryName === 'Platform Support') {
        queryClient.invalidateQueries(QUERY_KEYS.PLATFORM_SUPPORT);
        navigate("/platform-support");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Post</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="Title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter post title"
          />
        </div>

        <div>
          <label
            htmlFor="CategoryID"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.ID} value={category.ID}>
                {category.Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="Content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your post content here..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/academic-hub")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
