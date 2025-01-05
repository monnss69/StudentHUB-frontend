import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiService } from '../services/api';
import Post from '../components/Post';
import UploadButton from '../components/UploadButton';
import { QUERY_KEYS } from '../constants/queryKeys.js';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const PlatformSupport = () => {
  const { 
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: QUERY_KEYS.PLATFORM_SUPPORT,
    queryFn: async () => {
      const posts = await apiService.getPostsByCategory("Platform Support");
      const authors = await Promise.all(
        posts.map(post => apiService.getUser(post.author_id))
      );

      const authorsMap = authors.reduce((map, author) => {
        map[author.id] = author;
        return map;
      }, {});

      return {
        posts,
        authorsMap
      };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (isError) {
    return (
      <ErrorState message={error.message} />
    );
  }

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
              key={post.ID}
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