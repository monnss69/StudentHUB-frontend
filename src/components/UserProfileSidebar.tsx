import React from 'react'
import { User, Calendar, BookOpen } from 'lucide-react';
import { UserProfileSidebarProps } from '../types';

const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({ userData, postsCount, category }) => {
  // Type-safe date formatting function
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-900/30 h-fit sticky top-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-400/30 mb-4">
          <img
            src={userData.avatar_url}
            alt={`${userData.username}'s avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-semibold text-blue-200">Your Profile</h2>
      </div>

      <div className="space-y-4">

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
            <User className="text-blue-400" size={20} />
            <div>
              <p className="text-sm text-blue-200/70">Username</p>
              <p className="text-blue-100">{userData.username}</p>
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
              <p className="text-sm text-blue-200/70">{category} Posts</p>
              <p className="text-blue-100">{postsCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSidebar