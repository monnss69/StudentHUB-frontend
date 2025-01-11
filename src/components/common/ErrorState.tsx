const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 p-8">
      <div className="max-w-2xl mx-auto bg-red-900/20 backdrop-blur-sm rounded-lg p-6 border border-red-700/30">
        <p className="text-red-200">Error: {message}</p>
      </div>
    </div>
  );
};

export default ErrorState;
