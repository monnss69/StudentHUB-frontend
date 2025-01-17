import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { Tag } from "@/types";
import { PostContainerProps, QueryData } from "./PagePostListing.types";
import PostListing from "@/components/Post/PostListing";

const PagePostListing = ({ post, author }: PostContainerProps) => {
  const { data, isLoading, error } = useQuery<QueryData, Error>({
    queryKey: ["post", post.id, "comments-and-tags"],
    queryFn: async () => {
      const [fetchedTags, fetchedComments] = await Promise.all([
        apiService.getTagByPost(post.id),
        apiService.getPostComments(post.id),
      ]);

      return {
        tags: fetchedTags.map((tag: Tag) => tag.name),
        comments: fetchedComments,
      };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { tags = [], comments = [] } = data || {};

  if (error) {
    return <div>Error loading post data</div>;
  }

  return <PostListing post={post} author={author} tags={tags} comments={comments} />;
};

export default PagePostListing;