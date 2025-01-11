import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { useParams } from "react-router-dom";
import { Post, Tag, UpdatePostInput } from "@/types";
import LoadingState from "@/components/LoadingState";

const EditPost = () => {
  const { id } = useParams();
  if (!id) {
    throw new Error("Post ID not provided");
  }
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagAdding, setTagAdding] = useState<Tag[]>([]);
  const [tagRemoving, setTagRemoving] = useState<Tag[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<UpdatePostInput>({
    title: '',
    content: '',
  });
  const navigate = useNavigate();

  const isTagSelected = (tag: Tag) => {
    return tags.some(t => t.id === tag.id) || tagAdding.some(t => t.id === tag.id);
  };

  const getAvailableTags = () => {
    return allTags.filter(tag => !isTagSelected(tag));
  };

  const handleAddTag = (tag: Tag) => {
    if (tags.some(t => t.id === tag.id)) {
      setTagRemoving(tagRemoving.filter(t => t.id !== tag.id));
    } else {
      setTagAdding([...tagAdding, tag]);
    }
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (tag: Tag) => {
    setTags(tags.filter(t => t.id !== tag.id));
    if (tagAdding.some(t => t.id === tag.id)) {
      setTagAdding(tagAdding.filter(t => t.id !== tag.id));
    } else {
      setTagRemoving([...tagRemoving, tag]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchPost = async () => {
      try {
        const postData: Post | null = await apiService.getPost(id);
        const tagData: Tag[] = await apiService.getTagByPost(id);
        const allTagData: Tag[] = await apiService.getAllTag();  
        if (!postData) {
          throw new Error("Post not found");
        }

        if (!tagData) {
          throw new Error("Tag not found");
        }

        if (!allTagData) {
          throw new Error("All Tag not found");
        }

        setAllTags(allTagData);
        setTags(tagData);
        setPost(postData);
        setFormData({
          title: postData.title,
          content: postData.content,
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (post) {
        // Update post content
        await apiService.updatePost(post.id, formData);
        
        // Remove tags that were marked for removal
        for (const tag of tagRemoving) {
          await apiService.deleteTagByPost(post.id, tag.id);
        }
        
        // Add new tags
        if (tagAdding.length > 0) {
          await apiService.addTagToPost(post.id, tagAdding);
        }
        setIsLoading(false);
        navigate('/posts/' + post.id);
      } else {
        console.error("Post is null");
      }
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

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
            <label htmlFor="content" className="block text-gray-400 text-sm mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full h-64 bg-gray-800/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
            />
          </div>

          {/* Tags Section */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Tags</label>
            
            {/* Current Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-blue-600/30 text-white px-3 py-1 rounded-full flex items-center space-x-2"
                >
                  <span>{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-white hover:text-red-400 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Available Tags */}
            <div className="mt-2">
              <p className="text-gray-400 text-sm mb-2">Available Tags:</p>
              <div className="flex flex-wrap gap-2">
                {getAvailableTags().map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="bg-gray-700/50 hover:bg-blue-600/30 text-gray-300 px-3 py-1 rounded-full transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
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