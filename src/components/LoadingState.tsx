import { BarLoader } from "react-spinner-animated";
import "react-spinner-animated/dist/index.css";

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <BarLoader />
      <div className="text-2xl font-bold text-blue-200 mt-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
        Loading...
      </div>
    </div>
  );
};

export default LoadingState;
