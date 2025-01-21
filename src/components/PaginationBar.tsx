import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaginationBarProps {
  currentPage: number;
  category: string;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, category }) => {
  const navigate = useNavigate();
  const [customPage, setCustomPage] = useState('');

  // Convert category to lowercase and replace spaces with hyphens to match the format in the URL
  category = category.toLowerCase().split(' ').join('-');

  // Generate array of page numbers to show (current page and 4 pages before/after)
  const pages = Array.from(new Set([
    0,
    1,
    2,
    3,
    currentPage - 1,
    currentPage,
    currentPage + 1
  ])).filter(page => page >= 0)
    .sort((a, b) => a - b);

  // Handle page navigation on click
  const handlePageClick = (pageNum: number) => {
    navigate(`/post/${category}/${pageNum}`);
    window.location.reload();
  };

  // Handle custom page number submission
  const handleCustomPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(customPage);
    if (!isNaN(pageNum) && pageNum >= 0) {
      navigate(`/post/${category}/${pageNum}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCustomPage('');
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center space-x-4 mt-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-blue-900/30">
      <div className="flex space-x-2">
        {pages.map((page, index) => (
          <React.Fragment key={page}>
            {index > 0 && pages[index] - pages[index - 1] > 1 && (
              <span className="px-3 py-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => handlePageClick(page)}
              className={`px-3 py-2 rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
      </div>
      
      <form onSubmit={handleCustomPageSubmit} className="flex items-center space-x-2">
        <input
          type="number"
          min="0"
          value={customPage}
          onChange={(e) => setCustomPage(e.target.value)}
          placeholder="Go to page..."
          className="px-3 py-2 rounded bg-gray-700 text-gray-300 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Go
        </button>
      </form>
    </div>
  );
};

export default PaginationBar;