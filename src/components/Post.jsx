import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";

const Post = ({ post, author }) => {
  // Create a state to store comments
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await apiService.getPostComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchComments();
  }, [post.id]); // Only re-fetch if post.id changes

  return (
    <Link to={`/posts/${post.id}`} className="block mb-6">
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg 
                 border border-blue-900/30 hover:border-blue-700/50 transition-all duration-300
                 hover:shadow-blue-900/20 hover:shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="font-semibold text-lg text-blue-200">
                {post.title}
              </h2>
              <p className="text-sm text-gray-400">
                Posted by{" "}
                <span className="text-blue-400">{author.username}</span>
                {" • "}
                <span className="text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center text-gray-400 text-sm">
          <span className="flex items-center group hover:text-blue-400 transition-colors cursor-pointer">
            <svg
              className="w-5 h-5 mr-1 group-hover:stroke-blue-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{comments.length} comments</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Post;
