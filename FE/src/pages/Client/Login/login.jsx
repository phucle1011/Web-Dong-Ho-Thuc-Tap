import axios from "axios";
import { useForm } from "react-hook-form";
import Constants from "../../../Constants";
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import "./login.css";

const Login = () => {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(["token", "role"]);

    const {
        handleSubmit,
        register,
        formState: { errors },
        setError,
    } = useForm();

    const handleLogin = async ({ email, password }) => {
        try {
            const res = await axios.post(`${Constants.DOMAIN_API}/login`, {
                email,
                password
            });

            const { token, user } = res.data;

            const expiresDate = new Date();
            expiresDate.setHours(expiresDate.getHours() + 10);

            // Lưu cookies
            setCookie("token", token, { expires: expiresDate });
            setCookie("role", `${user.role}`, { expires: expiresDate });

            // ✅ Lưu user vào localStorage để Header đọc được
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            const message = err.response?.data?.message || "";

            if (message === "Email không tồn tại") {
                setError("email", { type: "manual", message: "Email không tồn tại trong hệ thống" });
            } else if (message === "Sai mật khẩu") {
                setError("password", { type: "manual", message: "Mật khẩu không chính xác" });
            } else {
                setError("password", { type: "manual", message: "Đăng nhập thất bại, vui lòng thử lại" });
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Đăng Nhập</h2>

                <form onSubmit={handleSubmit(handleLogin)} className="login-form">
                    <div className="form-group">
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Nhập email"
                            {...register("email", {
                                required: "Vui lòng nhập email",
                                pattern: {
                                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                    message: "Email không hợp lệ",
                                },
                            })}
                        />
                        {errors.email && <div className="error-text">{errors.email.message}</div>}
                    </div>

                    <div className="form-group">
                        <label className="login-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="login-input"
                            placeholder="Nhập mật khẩu"
                            {...register("password", {
                                required: "Vui lòng nhập mật khẩu",
                            })}
                        />
                        {errors.password && <div className="error-text">{errors.password.message}</div>}
                    </div>

                    <button type="submit" className="login-button">
                        Đăng Nhập
                    </button>
                </form>

                <div className="auth-links">
                    <a href="/forgot-password" className="forgot-password">
                        Quên mật khẩu?
                    </a>
                    <p className="switch-link">
                        Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
