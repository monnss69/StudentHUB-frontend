import { useAuth } from '../context/authProvider.tsx';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { User, Mail, Calendar, Edit } from 'lucide-react';
import { LoadingState } from '../components/common';
import { useNavigate } from 'react-router-dom';
import { DecodedToken, Post, UserData } from '../types';

const MyProfile = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserAndPosts = async () => {
            try {
                const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
                const username = decoded?.sub;
                if (!username) throw new Error('Invalid token data');
                const userData: UserData = await apiService.getUserByUsername(username);
                const userPosts: Post[] = await apiService.getUserPosts(userData.id);
                
                setUser(userData);
                setPosts(userPosts);
                setLoading(false);
            } catch (err) {
                setUser(null);
                setLoading(false);
                console.error('Error fetching user data:', err);
            }
        };

        if (token) fetchUserAndPosts();
    }, [token]);

    const handleEditPost = (postId: string) => {
        navigate(`/edit-post/${postId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <LoadingState />;
    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-900 px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
                    My Profile
                </h1>

                <div className="bg-gray-800 rounded-xl p-6 ring-1 ring-blue-400/20 mb-8">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
                        <User className="text-blue-400" size={24} />
                        <div>
                            <p className="text-sm text-blue-200/70">Username</p>
                            <p className="text-lg text-blue-100">{user.username}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
                        <Mail className="text-blue-400" size={24} />
                        <div>
                            <p className="text-sm text-blue-200/70">Email</p>
                            <p className="text-lg text-blue-100">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
                        <Calendar className="text-blue-400" size={24} />
                        <div>
                            <p className="text-sm text-blue-200/70">Member Since</p>
                            <p className="text-lg text-blue-100">
                                {formatDate(user.created_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="bg-gray-800 rounded-xl p-6 ring-1 ring-blue-400/20">
                    <h2 className="text-2xl font-semibold mb-6 text-blue-400">My Posts</h2>
                    {posts.length === 0 ? (
                        <p className="text-blue-200/70 text-center py-4">No posts yet</p>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-gray-900/50 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-medium text-blue-100">
                                            {post.title}
                                        </h3>
                                        <button
                                            onClick={() => handleEditPost(post.id)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors"
                                        >
                                            <Edit size={16} />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                    <p className="text-blue-200/70 text-sm mb-2">
                                        {formatDate(post.created_at)}
                                    </p>
                                    <p className="text-blue-100">{post.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProfile;