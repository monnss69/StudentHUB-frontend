import { Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const UploadButton = () => {
  return (
    <Link to="/create-post">
      <button
        className="fixed bottom-12 right-12 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700
                  hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600
                  text-blue-100 px-6 py-3 rounded-lg 
                  shadow-lg shadow-blue-900/30 hover:shadow-blue-500/40
                  flex items-center space-x-3 transition-all duration-300 transform hover:-translate-y-1
                  ring-1 ring-blue-400/30 backdrop-blur-sm"
      >
        <Upload className="w-6 h-6" />
        <span className="text-lg font-medium">Create Post</span>
      </button>
    </Link>
  );
};

export default UploadButton;