import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import PagePostListing from "../PagePostListing";
import UploadButton from "@/components/UploadButton.tsx";
import LoadingState from "@/components/CommonState/LoadingState";
import { useAuth } from "@/auth/authProvider";
import { jwtDecode } from "jwt-decode";
import { FeedProps } from "./PageFeed.types";
import { UserData, Post as PostType, DecodedToken, QueryData } from "@/types";
import UserProfileSidebar from "@/components/UserProfileSidebar.tsx";
import SearchBar from "@/components/SearchBar.tsx";

const PageFeed: React.FC<FeedProps> = ({
    category,
    queryKey,
    title,
    sidebarCategory,
}) => {
    // Primary states
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredData, setFilteredData] = useState<QueryData | null>(null);

    const { token } = useAuth();
    const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
    const username = decoded?.sub;

    if (!username) {
        throw new Error("Failed to decode username from token");
    }

    // Main data query - remains unchanged to maintain data integrity
    const { data, isLoading } = useQuery<QueryData, Error>({
        queryKey: [queryKey],
        queryFn: async () => {
            const posts: PostType[] = await apiService.getPostsByCategory(category);
            const authorIds = Array.from(new Set(posts.map(post => post.author_id)));

            const authors = await Promise.all(
                authorIds.map((authorId) => apiService.getUser(authorId))
            );

            const currentUser = await apiService.getUserByUsername(username);

            if (!currentUser) {
                throw new Error("Failed to fetch current user data");
            }

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
        staleTime: 5000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Effect to initialize filteredData when data is first loaded
    useEffect(() => {
        if (data) {
            setFilteredData(data);
        }
    }, [data]);

    // Effect to update filteredData when search term changes
    useEffect(() => {
        if (!data) return;

        if (!searchTerm) {
            // If search is empty, restore original data
            setFilteredData(data);
            return;
        }

        // Create new filtered version while keeping original data intact
        const searchLower = searchTerm.toLowerCase();
        const filteredPosts = data.posts.filter((post) =>
            post.title.toLowerCase().includes(searchLower) ||
            post.content.slice(0, 200).toLowerCase().includes(searchLower)
        );

        // Update filtered data with new posts array but keep other properties
        setFilteredData({
            ...data,
            posts: filteredPosts,
        });
    }, [searchTerm, data]);

    const userPostsCount = useMemo(() => {
        if (!filteredData?.currentUser || !filteredData.posts) return 0;
        return filteredData.posts.filter(
            (post) => post.author_id === filteredData.currentUser?.id
        ).length;
    }, [filteredData]);

    if (isLoading) return <LoadingState />;

    if (!filteredData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
                <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-900/30">
                    <p className="text-gray-300 text-center">Error loading data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 space-y-6">
                    <h1 className="text-3xl font-bold text-blue-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        {title}
                    </h1>

                    <div className="max-w-2xl">
                        <SearchBar
                            onSearch={setSearchTerm}
                            placeholder="Search posts..."
                        />
                    </div>
                </div>

                <div className="flex gap-8">
                    <div className="flex-1 space-y-6">
                        {filteredData.posts.length > 0 ? (
                            <>
                                {filteredData.posts.map((post) => (
                                    <PagePostListing
                                        key={post.id}
                                        post={post}
                                        author={filteredData.authorsMap[post.author_id]}
                                    />
                                ))}
                                <UploadButton />
                            </>
                        ) : (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-900/30">
                                <p className="text-gray-300 text-center">No posts found</p>
                            </div>
                        )}
                    </div>

                    {filteredData.currentUser && (
                        <div className="w-80">
                            <UserProfileSidebar
                                userData={filteredData.currentUser}
                                postsCount={userPostsCount}
                                category={sidebarCategory}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageFeed;