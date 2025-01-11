import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from "../services/api";
import { useAuth } from "../context/authProvider.tsx";
import { jwtDecode } from "jwt-decode";
import { QUERY_KEYS } from "../constants/queryKeys";
import { Category, CreatePostInput, DecodedToken, UserData } from "../types";
import LoadingState from "@/components/common/LoadingState.tsx";

const CreatePost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreatePostInput>({
    title: '',
    content: '',
    category_id: '',
    author_id: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
        const username = decoded?.sub;
        if (!username) throw new Error('Error fetching user data');

        const [categoryResponse, userResponse] : [Category[], UserData] = await Promise.all([
          apiService.getCategories(),
          apiService.getUserByUsername(username)
        ]);
        
        setCategories(categoryResponse);
        setFormData(prev => ({ ...prev, author_id: userResponse.id }));
      } catch (err: unknown) {
        console.error(err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.createPost(formData);
      const category = categories.find(cat => cat.id === formData.category_id)?.name;
      
      if (!category) {
        throw new Error('Category not found');
      }

      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS[category.replace(' ', '_')]]
      });
      navigate(`/post/${category.toLowerCase().replace(' ', '-')}`);
    } catch (err: unknown) {
      console.error(err);
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
                <option key={category.id} value={category.id}>{category.name}</option>
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