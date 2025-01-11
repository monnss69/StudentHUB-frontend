import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../services/api";
import { User, Calendar, Tag, Hash, MessageCircle } from "lucide-react";
import LoadingState from "@/components/LoadingState.tsx";
import { useAuth } from "@/provider/authProvider.tsx";
import { jwtDecode } from "jwt-decode";
import {
  CommentWithUser,
  Post,
  UserData,
  DecodedToken,
  Category,
  Tag as TagType,
} from "@/types";

const PostDetail = () => {
  const { id } = useParams();
  if (!id) throw new Error("Invalid post ID");
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState({
    content: "",
    author_id: "",
  });
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [author, setAuthor] = useState<UserData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState<TagType[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAuthorID = async () => {
      const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
      const username = decoded?.sub;
      if (!username) {
        throw new Error("Failed to decode username from token");
      }

      const user = await apiService.getUserByUsername(username);
      const authorID = user.id;
      if (!authorID) {
        throw new Error("Failed to fetch author ID");
      }

      setNewComment({ ...newComment, author_id: authorID });
    };
    if (token) fetchAuthorID();
  }, [token]);

  // Fetch post and its comments
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const [postData, commentsData, tagData] = await Promise.all([
          apiService.getPost(id),
          apiService.getPostComments(id),
          apiService.getTagByPost(id),
        ]);
        const [authorData, categoryData] = await Promise.all([
          apiService.getUser(postData.author_id),
          apiService.getCategory(postData.category_id),
        ]);
        const enhancedComments = await Promise.all(
          commentsData.map(async (comment: CommentWithUser) => {
            const userData = await apiService.getUser(comment.author_id);
            return {
              ...comment,
              user: userData.username,
            };
          })
        );

        setTags(tagData);
        setCategory(categoryData);
        setAuthor(authorData);
        setPost(postData);
        setComments(enhancedComments);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPostData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLFormElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const newCommentData = {
      ...newComment,
      content: e.target.value,
    };
    setNewComment(newCommentData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createComment(id, newComment);
      window.location.reload();
      setNewComment({ ...newComment, content: "" });
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  if (loading) return <LoadingState />;
  if (!post) throw new Error("Post not found");
  if (!author) throw new Error("Author not found");
  if (!category) throw new Error("Category not found");

  const isCommentEmpty = !newComment?.content?.trim();

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Background animation elements remain the same */}

      {/* Main content */}
      <div className="relative px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-8 mb-8">
            <h1 className="text-4xl font-bold text-blue-200 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              {post.title}
            </h1>

            {/* Author, Date, and Category */}
            <div className="flex flex-wrap gap-6 mb-6 text-gray-300">
              <div className="flex items-center gap-2">
                <User className="text-blue-400" size={20} />
                <span>{author.username || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                <span>{formatDate(post.created_at)}</span>
              </div>
              {category && (
                <div className="flex items-center gap-2">
                  <Tag className="text-blue-400" size={20} />
                  <span>{category.name}</span>
                </div>
              )}
            </div>

            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-blue-600/20 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-500/20 hover:bg-blue-600/30 transition-colors duration-200"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 whitespace-pre-wrap">
                {post.content}
              </p>
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
