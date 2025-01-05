import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../services/api";
import { User, Calendar, Tag, MessageCircle } from "lucide-react";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/provider/authProvider";
import {jwtDecode} from "jwt-decode";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState({
    content: "",
    author_id: null,
  });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [author, setAuthor] = useState(null);
  const [category, setCategory] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAuthorID = async () => {
      const decoded = jwtDecode(token);
      const username = decoded.sub;
      const user = await apiService.getUserByUsername(username);
      const authorID = user.id;
      setNewComment({ ...newComment, author_id: authorID });
    };
    if (token) fetchAuthorID();
  }, [token]);

  // Fetch post and its comments
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const [postData, commentsData] = await Promise.all([
          apiService.getPost(id),
          apiService.getPostComments(id),
        ]);
        const [authorData, categoryData] = await Promise.all([
          apiService.getUser(postData.author_id),
          apiService.getCategory(postData.category_id),
        ]);
        const enhancedComments = await Promise.all(
          commentsData.map(async (comment) => {
            const userData = await apiService.getUser(comment.author_id);
            return {
              ...comment,
              user: userData.username,
            };
          })
        );
        setCategory(categoryData);
        setAuthor(authorData);
        setPost(postData);
        setComments(enhancedComments);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPostData();
  }, [id]);

  const handleChange = (e) => {
    e.preventDefault();
    const newCommentData = {
      ...newComment,
      content: e.target.value,
    };
    setNewComment(newCommentData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createComment(id, newComment);
      window.location.reload();
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!post) return null;

  const isCommentEmpty = !newComment?.content?.trim();

  // Format date to be more readable
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Background animation elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      {/* Main content */}
      <div className="relative px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-8 mb-8">
            <h1 className="text-4xl font-bold text-blue-200 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              {post.title}
            </h1>

            {/* Author and Date */}
            <div className="flex flex-wrap gap-6 mb-6 text-gray-300">
              <div className="flex items-center gap-2">
                <User className="text-blue-400" size={20} />
                <span>{author.username || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                <span>{formatDate(post.created_at)}</span>
              </div>
              {post.category && (
                <div className="flex items-center gap-2">
                  <Tag className="text-blue-400" size={20} />
                  <span>{category.name}</span>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-200 mb-4 flex items-center gap-2">
              Add a Comment
            </h2>
            <div className="space-y-4">
              {/* Wrap in a form for better accessibility and Enter key support */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  name="content"
                  value={newComment.content}
                  onChange={handleChange}
                  placeholder="Write your comment here..."
                  className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-lg border border-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent min-h-24 resize-y"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit" // Add type="submit" for form submission
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCommentEmpty}
                  >
                    <MessageCircle size={18} />
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-8">
            <h2 className="text-2xl font-bold text-blue-200 mb-6 flex items-center gap-2">
              <MessageCircle className="text-blue-400" size={24} />
              Comments ({comments.length})
            </h2>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-900/50 rounded-lg p-4 border border-blue-900/20"
                >
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <User className="text-blue-400" size={16} />
                    <span>{comment.user}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-200">{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
