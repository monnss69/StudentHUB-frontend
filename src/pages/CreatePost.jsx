import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from "../services/api";
import { useAuth } from "@/provider/authProvider";
import { jwtDecode } from "jwt-decode";
import { QUERY_KEYS } from "@/constants/queryKeys";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

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
        const decoded = jwtDecode(token);
        const username = decoded.sub;
        const [categoryResponse, userResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getUserByUsername(username)
        ]);
        
        setCategories(categoryResponse);
        setFormData(prev => ({ ...prev, author_id: userResponse.id }));
      } catch (err) {
        setError(err.message || 'Failed to load necessary data');
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.createPost(formData);
      const category = categories.find(cat => cat.ID === formData.category_id)?.Name;
      await queryClient.invalidateQueries([QUERY_KEYS[category.replace(' ', '_')]]);
      navigate(`/post/${category.toLowerCase().replace(' ', '-')}`);
    } catch (err) {
      setError(err.message || "Failed to create post");
    }
    setLoading(false);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-blue-900/30">
        <h1 className="text-3xl font-bold text-blue-200 mb-8 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          Create New Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form inputs with consistent styling */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-blue-200 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg text-gray-200 placeholder-gray-500"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-blue-200 mb-2">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg text-gray-200"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.ID} value={category.ID}>{category.Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-blue-200 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg text-gray-200 placeholder-gray-500"
              rows={10}
              placeholder="Write your post content here..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg 
                       hover:shadow-blue-500/50 transition-all duration-200 ring-1 ring-blue-400/30"
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={() => navigate("/post/academic-hub")}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 
                       ring-1 ring-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;