import AtomicSpinner from "atomic-spinner";
import React from "react";

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-40">
      <AtomicSpinner atomSize={300} />
      <div className="text-2xl font-bold text-gray-800 mt-4">Loading...</div>
    </div>
  );
};

export default LoadingState;
