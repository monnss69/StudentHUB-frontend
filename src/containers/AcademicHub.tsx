import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { QUERY_KEYS } from "../constants/queryKeys";
import { useAuth } from "../context/authProvider.tsx";
import { jwtDecode } from "jwt-decode";
import { UserData, Post as PostType, DecodedToken } from "../types";
import LoadingState from "@/components/common/LoadingState.tsx";
import Post from "@/components/post/Post.tsx";
import UploadButton from "@/components/post/UploadButton.tsx";
import UserProfileSidebar from "@/components/profile/UserProfileSidebar.tsx";

// Define interface for the data structure returned by the query
interface QueryData {
  posts: PostType[];
  authorsMap: { [key: string]: UserData };
  currentUser: UserData;
}

const AcademicHub: React.FC = () => {
  const { token } = useAuth();
  const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
  const username = decoded?.sub;
  if (!username) {
    throw new Error("Failed to decode username from token");
  }

  const { data, isLoading } = useQuery<QueryData, Error>({
    queryKey: QUERY_KEYS.ACADEMIC_HUB,
    queryFn: async () => {
      const posts: PostType[] = await apiService.getPostsByCategory("Academic Hub");
      const authors: UserData[] = await Promise.all(
        posts.map(
          (post: PostType): Promise<UserData> =>
            apiService.getUser(post.author_id)
        )
      );

      // Get current user data if logged in
      const currentUser = await apiService.getUserByUsername(username);
      
      // Ensure we got user data
      if (!currentUser) {
        throw new Error("Failed to fetch current user data");
      }

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
        authorsMap,
        currentUser,
      };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

  // Type-safe posts counting
  const userPostsCount: number = data.currentUser
    ? data.posts.filter((post) => post.author_id === data.currentUser?.id)
        .length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-200 mb-8 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          Academic Hub
        </h1>

        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            {data.posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                author={data.authorsMap[post.author_id]}
              />
            ))}
            <UploadButton />
          </div>

          {data.currentUser && (
            <div className="w-80">
              <UserProfileSidebar
                userData={data.currentUser}
                postsCount={userPostsCount}
                category="Academic"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicHub;
