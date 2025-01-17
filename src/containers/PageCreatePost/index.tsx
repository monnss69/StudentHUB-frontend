import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { useAuth } from "@/provider/authProvider.tsx";
import { jwtDecode } from "jwt-decode";
import { QUERY_KEYS } from "@/constants/queryKeys";
import LoadingState from "@/components/LoadingState.tsx";
import {
  Category,
  CreatePostInput,
  DecodedToken,
  UserData,
  Tag,
} from "@/types";

const CreatePost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreatePostInput>({
    title: "",
    content: "",
    category_id: "",
    author_id: "",
    tags: [],
  });
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const handleTagSelect = (tag: Tag) => {
    // Check if this exact tag object isn't already in the array
    const isTagSelected = formData.tags.some(
      (selectedTag) => selectedTag.id === tag.id
    );

    if (!isTagSelected) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setIsTagDropdownOpen(false);
  };

  // Fix the handleRemoveTag function:
  const handleRemoveTag = (tagToRemove: Tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.id !== tagToRemove.id),
    }));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
        const username = decoded?.sub;
        if (!username) throw new Error("Error fetching user data");

        const [categoryResponse, userResponse, tagResponse]: [
          Category[],
          UserData,
          Tag[]
        ] = await Promise.all([
          apiService.getCategories(),
          apiService.getUserByUsername(username),
          apiService.getAllTag(),
        ]);

        setCategories(categoryResponse);
        setFormData((prev) => ({ ...prev, author_id: userResponse.id }));
        setTags(tagResponse);
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
      const category = categories.find(
        (cat) => cat.id === formData.category_id
      )?.name;

      if (!category) {
        throw new Error("Category not found");
      }

      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS[category.replace(" ", "_")]],
      });
      
      navigate(`/post/${category.toLowerCase().replace(" ", "-")}`);
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
            <label
              htmlFor="title"
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg text-gray-200 placeholder-gray-500"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category_id: e.target.value,
                }))
              }
              className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg text-gray-200"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Selection Area */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-blue-200">
                Tags <span className="text-red-400">*</span>
              </label>
            </div>

            {/* Custom Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg 
                text-left text-gray-200 hover:border-blue-700/50 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="block truncate">
                  {formData.tags.length > 0
                    ? `${formData.tags.length} tag${
                        formData.tags.length > 1 ? "s" : ""
                      } selected`
                    : "Select Tags"}
                </span>
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {isTagDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Dropdown Menu with improved accessibility and UX */}
              {isTagDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 bg-gray-800 border border-blue-900/30 
                   rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  role="listbox"
                  aria-label="Available tags"
                >
                  {tags.length === 0 ? (
                    <div className="px-4 py-2 text-gray-400 italic">
                      No tags available
                    </div>
                  ) : (
                    tags
                      .filter(
                        (tag) =>
                          !formData.tags.some(
                            (selectedTag) => selectedTag.id === tag.id
                          )
                      )
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            handleTagSelect(tag);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-200 hover:bg-blue-900/30 
                       transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg
                       focus:outline-none focus:bg-blue-900/50"
                          role="option"
                          aria-selected="false"
                        >
                          {tag.name}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Tags Display with improved interactions */}
            <div className="flex flex-wrap gap-2" aria-label="Selected tags">
              {formData.tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 px-3 py-1 bg-blue-900/30 
                   rounded-full border border-blue-800/30 hover:border-blue-700/50
                   transition-all duration-200"
                >
                  <span className="text-blue-200 text-sm">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200
                     focus:outline-none focus:text-red-400"
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
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
