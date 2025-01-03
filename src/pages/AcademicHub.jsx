import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiService } from '../services/api';
import Post from '../components/Post';
import UploadButton from '../components/UploadButton';
import { QUERY_KEYS } from '@/constants/QueryKeys';

const AcademicHub = () => {
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

      const authorsMap = authors.reduce((map, author) => {
        map[author.id] = author;
        return map;
      }, {});

      return {
        posts,
        authorsMap
      };
    },
    staleTime: 0,              // Make data stale immediately
    refetchOnMount: true,      // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  if (!data?.posts?.length) return <div>No posts found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Academic Hub</h1>
      <div className="space-y-4">
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
  );
};