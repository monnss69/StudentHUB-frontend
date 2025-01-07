import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import Post from "../components/Post";
import UploadButton from "../components/UploadButton";
import { QUERY_KEYS } from "../constants/queryKeys";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { UserData, Post as PostType } from "../types";

// Define interface for the data structure returned by the query
interface QueryData {
  posts: PostType[];
  authorsMap: { [key: string]: UserData };
}

const PlatformSupport: React.FC = () => {
  // Type-safe React Query implementation
  const { data, isLoading } = useQuery<QueryData, Error>({
    queryKey: QUERY_KEYS.PLATFORM_SUPPORT,
    queryFn: async () => {
      // Fetch posts with type safety
      const posts: PostType[] = await apiService.getPostsByCategory("Platform Support");
      
      // Fetch authors with type safety
      const authors: UserData[] = await Promise.all(
        posts.map(
          (post: PostType): Promise<UserData> => 
            apiService.getUser(post.author_id)
        )
      );

      // Type-safe authors map construction
      const authorsMap = authors.reduce<{ [key: string]: UserData }>(
        (map, author) => {
          map[author.id] = author;
          return map;
        },
        {}
      );

      return {
        posts,
        authorsMap
      };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  if (isLoading) return <LoadingState />;
  if (!data?.posts?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
        <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-900/30">
          <p className="text-gray-300 text-center">No posts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-200 mb-8 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          Platform Support
        </h1>
        
        <div className="space-y-6">
          {data.posts.map((post) => (
            <Post 
              key={post.id}
              post={post}
              author={data.authorsMap[post.author_id]}
            />
          ))}
        </div>
        
        <UploadButton />
      </div>
    </div>
  );
};

export default PlatformSupport;