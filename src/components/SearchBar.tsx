import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch = () => {}, 
  placeholder = "Search posts..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800/50 text-white pl-12 pr-4 py-3 rounded-lg border border-blue-900/20 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                   placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
        />
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={20} 
        />
      </div>
      
      {/* Optional clear button when there's text */}
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 
                   hover:text-gray-300 focus:outline-none"
        >
          ×
        </button>
      )}
    </form>
  );
};

export default SearchBar;