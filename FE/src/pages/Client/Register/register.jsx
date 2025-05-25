import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../Constants";
import "./register.css";

const Register = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setError,
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(`${Constants.DOMAIN_API}/user/register`, data);
            console.log("Đăng ký thành công:", res.data);
            navigate("/login");
        } catch (err) {
            // Bắt lỗi "Email đã tồn tại"
            if (
                err.response &&
                err.response.status === 400 &&
                err.response.data.message === "Email đã tồn tại"
            ) {
                setError("email", {
                    type: "manual",
                    message: "Email đã tồn tại. Vui lòng chọn email khác",
                });
            } else {
                console.error("Lỗi đăng ký:", err);
            }
        }
    };

    return (
        <main className="register-page">
            <div className="register-container">
                <div className="register-box">
                    <h2>Đăng Ký</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                        <div className="form-group">
                            <label className="register-label">Họ và tên</label>
                            <input
                                type="text"
                                className="register-input"
                                placeholder="Nhập họ và tên"
                                {...register("name", {
                                    required: "Vui lòng nhập họ tên",
                                    minLength: { value: 2, message: "Ít nhất 2 ký tự" },
                                    maxLength: { value: 255, message: "Tối đa 255 ký tự" },
                                })}
                            />
                            {errors.name && <div className="error-text">{errors.name.message}</div>}
                        </div>

                        <div className="form-group">
                            <label className="register-label">Email</label>
                            <input
                                type="email"
                                className="register-input"
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
                            <label className="register-label">Số điện thoại</label>
                            <input
                                type="text"
                                className="register-input"
                                placeholder="Nhập số điện thoại"
                                {...register("phone", {
                                    required: "Vui lòng nhập số điện thoại",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Số điện thoại phải đúng 10 số",
                                    },
                                })}
                            />
                            {errors.phone && <div className="error-text">{errors.phone.message}</div>}
                        </div>

                        <div className="form-group">
                            <label className="register-label">Mật khẩu</label>
                            <input
                                type="password"
                                className="register-input"
                                placeholder="Nhập mật khẩu"
                                {...register("password", {
                                    required: "Vui lòng nhập mật khẩu",
                                    minLength: { value: 6, message: "Ít nhất 6 ký tự" },
                                })}
                            />
                            {errors.password && <div className="error-text">{errors.password.message}</div>}
                        </div>

                        <div className="form-group">
                            <label className="register-label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="register-input"
                                placeholder="Nhập lại mật khẩu"
                                {...register("confirmPassword", {
                                    required: "Vui lòng xác nhận mật khẩu",
                                    validate: (value) =>
                                        value === getValues("password") || "Mật khẩu xác nhận không khớp",
                                })}
                            />
                            {errors.confirmPassword && (
                                <div className="error-text">{errors.confirmPassword.message}</div>
                            )}
                        </div>

                        <button type="submit" className="register-button">
                            Đăng Ký
                        </button>

                        <p className="switch-link">
                            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Register;
