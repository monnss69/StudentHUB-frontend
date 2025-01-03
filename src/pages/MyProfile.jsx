import { useAuth } from '@/provider/authProvider';
import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { jwtDecode } from 'jwt-decode';
import ErrorState from '@/components/ErrorState';
import { User, Mail, Calendar } from 'lucide-react';

const MyProfile = () => {
    // State to hold user data matching the backend User struct
    const { token } = useAuth();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const decoded = jwtDecode(token);
                const username = decoded.sub;
                const userData = await apiService.getUserByUsername(username);
                setUser(userData);
                setError(null);
            } catch (err) {
                setError('Failed to load profile data');
                setUser(null);
            }
        };

        if (token) fetchUser();
    }, [token]);

    if (error) return <ErrorState message={error} />;
    if (!user) return null;

    // Format date to be more readable
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-900 px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
                    My Profile
                </h1>

                <div className="bg-gray-800 rounded-xl p-6 ring-1 ring-blue-400/20">
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
    );
};

export default MyProfile;