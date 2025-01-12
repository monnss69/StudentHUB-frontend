import React, { useState } from "react";
import { Search } from "lucide-react";
import { SearchBarProps } from "@/types";

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch = () => {},
  placeholder = "Search posts...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value); // Notify parent component immediately
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch(""); // Notify parent when clearing
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
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

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
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
