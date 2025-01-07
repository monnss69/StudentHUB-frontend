import { useQuery } from "@tanstack/react-query";
import { apiService } from '../services/api';
import Post from '../components/Post';
import UploadButton from '../components/UploadButton';
import { QUERY_KEYS } from '../constants/queryKeys.js';
import LoadingState from '@/components/LoadingState';
import { User, Mail, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '@/provider/authProvider';
import { jwtDecode } from 'jwt-decode';
import { UserData } from '../types'

const UserProfileSidebar = ({ userData, postsCount }: { userData: UserData, postsCount: number }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-900/30 h-fit sticky top-8">
      <h2 className="text-xl font-semibold text-blue-200 mb-6">Profile</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
          <User className="text-blue-400" size={20} />
          <div>
            <p className="text-sm text-blue-200/70">Username</p>
            <p className="text-blue-100">{userData.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
          <Mail className="text-blue-400" size={20} />
          <div>
            <p className="text-sm text-blue-200/70">Email</p>
            <p className="text-blue-100">{userData.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
          <Calendar className="text-blue-400" size={20} />
          <div>
            <p className="text-sm text-blue-200/70">Member Since</p>
            <p className="text-blue-100">{formatDate(userData.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
          <BookOpen className="text-blue-400" size={20} />
          <div>
            <p className="text-sm text-blue-200/70">Academic Posts</p>
            <p className="text-blue-100">{postsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AcademicHub = () => {
  const { token } = useAuth();
  const decoded = token ? jwtDecode(token) : null;
  const username = decoded?.sub;

  const { 
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: QUERY_KEYS.ACADEMIC_HUB,
    queryFn: async () => {
      const posts = await apiService.getPostsByCategory("Academic Hub");
      const authors = await Promise.all(
        posts.map(post => apiService.getUser(post.author_id))
      );
      
      // Get current user data if logged in
      let currentUser = null;
      if (username) {
        currentUser = await apiService.getUserByUsername(username);
      }

      const authorsMap = authors.reduce((map, author) => {
        map[author.id] = author;
        return map;
      }, {});

      return {
        posts,
        authorsMap,
        currentUser
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

  // Count user's posts
  const userPostsCount = data.posts.filter(
    post => post.author_id === data.currentUser?.id
  ).length;

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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicHub;