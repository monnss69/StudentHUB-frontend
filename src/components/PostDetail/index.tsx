import { Calendar, Tag, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { CommentWithUser, Post, UserData, Category, Tag as TagType } from "@/types";

interface PostDetailProps {
  post: Post;
  author: UserData;
  category: Category;
  tags: TagType[];
  comments: CommentWithUser[];
  newComment: {
    content: string;
    author_id: string;
  };
  onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
}

const PostDetail = ({
  post,
  author,
  category,
  tags,
  comments,
  newComment,
  onCommentChange,
  onCommentSubmit,
}: PostDetailProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isCommentEmpty = !newComment?.content?.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
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
                <img src={author.avatar_url} alt="Author Avatar" className="w-8 h-8 rounded-full" />
                <span>{author.username || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="text-blue-400" size={20} />
                <span>{category.name}</span>
              </div>
            </div>

            {/* Tags Section */}
            {tags.length > 0 && (
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
              <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>

          {/* Comment Form */}
          <form
            onSubmit={onCommentSubmit}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-900/30 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-blue-200 mb-6 flex items-center gap-2">
              <MessageCircle className="text-blue-400" size={24} />
              Add a Comment
            </h2>

            <textarea
              onChange={onCommentChange}
              value={newComment.content}
              placeholder="Write your comment here..."
              className="w-full bg-gray-900/50 rounded-lg p-4 border border-blue-900/20 text-gray-200"
            />

            <button
              type="submit"
              disabled={isCommentEmpty}
              className={`mt-4 px-6 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors ${
                isCommentEmpty ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Post Comment
            </button>
          </form>

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
                    <Link to={`/profile/${comment.user_id}`}>
                      <img src={comment.avatar_url} alt="User Avatar" className="w-5 h-5 rounded-full" />
                    </Link>
                    <Link to={`/profile/${comment.user_id}`}>
                      {comment.user}
                    </Link>
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