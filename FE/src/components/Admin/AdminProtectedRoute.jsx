import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const AdminProtectedRoute = ({ children }) => {
    const [cookies] = useCookies(["token", "role"]);

    const token = cookies.token;
    const role = cookies.role;

    // Nếu chưa đăng nhập hoặc không phải admin → chuyển hướng
    if (!token || role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
