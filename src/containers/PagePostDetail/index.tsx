import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { useAuth } from "@/auth/authProvider";
import { jwtDecode } from "jwt-decode";
import LoadingState from "@/components/CommonState/LoadingState";
import PostDetail from "@/components/Post/PostDetail";
import { CommentWithUser, Post, UserData, DecodedToken, Category, Tag } from "@/types";

const PagePostDetail = () => {
  const { id } = useParams();
  if (!id) throw new Error("Invalid post ID");

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [author, setAuthor] = useState<UserData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newComment, setNewComment] = useState({
    content: "",
    author_id: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAuthorID = async () => {
      try {
        const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
        const username = decoded?.sub;
        if (!username) {
          throw new Error("Failed to decode username from token");
        }

        const user = await apiService.getUserByUsername(username);
        setNewComment(prev => ({ ...prev, author_id: user.id }));
      } catch (error) {
        console.error("Error fetching author ID:", error);
      }
    };

    if (token) fetchAuthorID();
  }, [token]);

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
              avatar_url: userData.avatar_url,
              user_id: userData.id,
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

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(prev => ({ ...prev, content: e.target.value }));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.createComment(id, newComment);
      window.location.reload();
      setNewComment(prev => ({ ...prev, content: "" }));
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!post) throw new Error("Post not found");
  if (!author) throw new Error("Author not found");
  if (!category) throw new Error("Category not found");

  return (
    <PostDetail
      post={post}
      author={author}
      category={category}
      tags={tags}
      comments={comments}
      newComment={newComment}
      onCommentChange={handleCommentChange}
      onCommentSubmit={handleCommentSubmit}
    />
  );
};

export default PagePostDetail;