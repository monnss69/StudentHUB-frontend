import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider.tsx";
import { LogOut } from "lucide-react";
import { apiService } from "@/services/api";

const Logout = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleLogout = async () => {
    try {
      const logoutSuccessful: boolean = await apiService.logout();
      
      if (logoutSuccessful) {
        setToken(null);
        navigate("/", { replace: true });
      }
    } catch (error: unknown) {
      console.error("Logout error:", error);
    }
  };


  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 
                 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
    >
      <LogOut className="h-4 w-4 mr-2" />
      <span>Logout</span>
    </button>
  );
};

export default Logout;