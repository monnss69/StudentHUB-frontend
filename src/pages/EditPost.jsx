import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { useParams } from "react-router-dom";

const EditPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await apiService.getPost(id);
        setPost(postData);
        setFormData({
            title: postData.title,
            content: postData.content,
        });
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    if (id) fetchPost();
  }, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updatePost(post.id, formData);
      navigate('/posts/' + post.id);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-semibold text-white mb-6">Edit Post</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-400 text-sm mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-800/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-gray-400 text-sm mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full bg-gray-800/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-900/30 hover:shadow-blue-500/40 flex items-center space-x-3 transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-blue-400/30 backdrop-blur-sm"
          >
            <span>Update Post</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
