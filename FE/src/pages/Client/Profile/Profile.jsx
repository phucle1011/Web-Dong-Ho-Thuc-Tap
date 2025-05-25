import { useState, useEffect } from "react";
import { Pencil, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Constants from "../../../Constants";
import "./Profile.css";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [cookies, , removeCookie] = useCookies(["token", "role"]);
    const [localUser, setLocalUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({ message: "", type: "" });
    const navigate = useNavigate();

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", Constants.UPLOAD_PRESET);

        const res = await axios.post( `https://api.cloudinary.com/v1_1/${Constants.CLOUD_NAME}/image/upload`, formData );

        return res.data.secure_url;
    };

    const reloadUserData = () => {
        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setLocalUser({
                    ...parsed,
                    avatarPreview: parsed.avatar || require("../../../assets/img/user-4.jpg"),
                });
            } else {
                setUpdateStatus({ message: "Không tìm thấy dữ liệu người dùng.", type: "error" });
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (e) {
            console.error("Lỗi load user:", e);
            setUpdateStatus({ message: "Lỗi khi tải dữ liệu người dùng.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        reloadUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            const file = files[0];
            if (file) {
                setLocalUser((prev) => ({
                    ...prev,
                    avatar: file,
                    avatarPreview: URL.createObjectURL(file),
                }));
            }
        } else {
            setLocalUser((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            if (!localUser.name || localUser.name.trim().length < 2) {
                throw new Error("Tên phải có ít nhất 2 ký tự");
            }

            if (localUser.phone && !/^\d{10}$/.test(localUser.phone)) {
                throw new Error("Số điện thoại không hợp lệ");
            }

            const token = cookies.token;
            if (!token) throw new Error("Chưa đăng nhập");

            let avatarUrl = localUser.avatarPreview;

            if (localUser.avatar instanceof File) {
                avatarUrl = await uploadImageToCloudinary(localUser.avatar);
            }

            const payload = {
                name: localUser.name,
                phone: localUser.phone,
                email: localUser.email,
                avatar: avatarUrl,
            };

            const res = await axios.put(`${Constants.DOMAIN_API}/user/update-user/${localUser.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updated = {
                ...localUser,
                ...res.data.user,
                avatarPreview: res.data.user.avatar,
            };

            localStorage.setItem("user", JSON.stringify(updated));
            setLocalUser(updated);
            setIsEditing(false);
            setUpdateStatus({ message: "Cập nhật thành công!", type: "success" });
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            const message = err.response?.data?.message || err.message;
            setUpdateStatus({ message, type: "error" });
        }
    };

    const handleLogout = () => {
        removeCookie("token");
        removeCookie("role");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (!localUser) {
        return <div className="profile-container">Đang tải dữ liệu...</div>;
    }

    return (
        <main className="profile-container">
            <h2>Thông Tin Người Dùng</h2>

            {updateStatus.message && (
                <div className={`alert ${updateStatus.type}`}>{updateStatus.message}</div>
            )}

            <div className="profile-actions">
                <button onClick={reloadUserData} className="btn refresh-btn" disabled={isLoading}>
                    <RefreshCw className="icon" size={16} />
                    {isLoading ? "Đang tải..." : "Làm mới dữ liệu"}
                </button>
            </div>

            <div className="profile-card">
                <div className="profile-left">
                    <img
                        src={localUser.avatarPreview}
                        alt="Avatar"
                        className="profile-avatar"
                        onError={(e) => {
                            e.target.src = require("../../../assets/img/user-4.jpg");
                        }}
                    />
                    {isEditing && (
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleChange}
                            className="form-control mt-2"
                        />
                    )}
                </div>

                <div className="profile-right">
                    <div className="profile-field">
                        <label>Tên:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={localUser.name || ""}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>{localUser.name}</p>
                        )}
                    </div>

                    <div className="profile-field">
                        <label>Email:</label>
                        <p>{localUser.email}</p>
                    </div>

                    <div className="profile-field">
                        <label>Số điện thoại:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phone"
                                value={localUser.phone || ""}
                                onChange={handleChange}
                                maxLength={10}
                            />
                        ) : (
                            <p>{localUser.phone || "Chưa cập nhật"}</p>
                        )}
                    </div>

                    <div className="profile-footer">
                        {isEditing ? (
                            <>
                                <button className="btn save-btn" onClick={handleSave}>Lưu thay đổi</button>
                                <button className="btn cancel-btn" onClick={() => {
                                    setIsEditing(false);
                                    reloadUserData();
                                }}>Hủy</button>
                            </>
                        ) : (
                            <button className="btn" onClick={() => setIsEditing(true)}>
                                <Pencil className="icon" /> Chỉnh sửa
                            </button>
                        )}
                        <button className="btn logout-btn" onClick={handleLogout}>
                            <LogOut className="icon" /> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
