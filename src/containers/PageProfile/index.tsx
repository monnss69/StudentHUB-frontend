import { useAuth } from '@/auth/authProvider';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { jwtDecode } from 'jwt-decode';
import { User, Mail, Calendar, Edit, Settings } from 'lucide-react';
import LoadingState from '@/components/CommonState/LoadingState';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DecodedToken, Post, UserData } from '@/types';

const PageProfile = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch username based on token or ID if provided
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Step 1: Get username
                let fetchedUsername: string | undefined;
                
                if (id) {
                    const userData: UserData = await apiService.getUser(id);
                    fetchedUsername = userData.username;
                } else {
                    const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
                    fetchedUsername = decoded?.sub;
                }
    
                if (!fetchedUsername) {
                    setLoading(false);
                    return;
                }

                setUsername(fetchedUsername);

                // Step 2: Only proceed with user and posts fetch if we have a token
                if (token) {
                    const userData: UserData = await apiService.getUserByUsername(fetchedUsername);
                    const userPosts: Post[] = await apiService.getUserPosts(userData.id);
    
                    setUser(userData);
                    setPosts(userPosts);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [id, token]);

    // If click on edit post button, navigate to edit post page based on post ID
    const handleEditPost = (postId: string) => {
        navigate(`/edit-post/${postId}`);
    };

    // Format date string to human-readable format
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Render loading state while fetching data
    if (loading) return <LoadingState />;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Section - Left Side */}
                <div className="lg:col-span-4">
                    <div className="sticky top-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-blue-400">
                                {id ? `${username}'s Profile` : 'My Profile'}
                            </h1>

                            {!id && <Link
                                to="/edit-profile"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
                                         from-blue-600 to-indigo-700 rounded-lg shadow-lg 
                                         hover:shadow-blue-500/50 transform hover:-translate-y-0.5 
                                         transition-all duration-200 ring-1 ring-blue-400/30"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </Link>}
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 ring-1 ring-blue-400/20">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative w-48 h-48">
                                    <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-blue-400/30">
                                        <img
                                            src={user.avatar_url}
                                            alt={`${user.username}'s avatar`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* User Info Cards - Keep existing structure */}
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
                    </div>
                </div>

                {/* Posts Section - Right Side (Keep existing code) */}
                <div className="lg:col-span-8">
                    <div className="bg-gray-800 rounded-xl p-6 ring-1 ring-blue-400/20">
                        <h2 className="text-2xl font-semibold mb-6 text-blue-400">{id ? `${username}'s Posts` : 'My Posts'}</h2>
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
                                            {!id && <button
                                                onClick={() => handleEditPost(post.id)}
                                                className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors"
                                            >
                                                <Edit size={16} />
                                                <span>Edit</span>
                                            </button>}
                                        </div>
                                        <p className="text-blue-200/70 text-sm mb-2">
                                            {formatDate(post.created_at)}
                                        </p>
                                        <p className="text-blue-100">{post.content.length > 250 ? `${post.content.slice(0, 250)}...` : post.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PageProfile;