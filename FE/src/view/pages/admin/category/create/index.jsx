import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import HeaderAdmin from "../../layout/header";
import { useForm } from "react-hook-form";
import "./category.css"

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
};

function CategoryCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            status: "active",
        },
    });

    const nameValue = watch("name");
    const slugValue = watch("slug");

    if (nameValue && !slugValue) {
        setValue("slug", generateSlug(nameValue));
    }

    const onSubmit = async (formData) => {
        setLoading(true);

        const cleanedData = {
            ...formData,
            name: formData.name.trim().replace(/\s+/g, " "),
            slug: generateSlug(formData.name),
            description: formData.description.trim(),
        };

        try {
            await axios.post(`${Constants.DOMAIN_API}/admin/categories/create`, cleanedData);
            toast.success("Thêm danh mục thành công!");
            navigate("/admin/categories/getAll");
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error("Tên danh mục đã tồn tại.");
            } else {
                toast.error("Thêm danh mục thất bại.");
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div style={{ marginLeft: "16rem" }} className="min-h-screen bg-gray-100 p-4">
                <div className="container mx-auto bg-white shadow rounded p-6 max-w-lg">
                    <h2 className="text-xl font-semibold mb-6">Thêm danh mục mới</h2>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">
                                Tên danh mục <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="VD: Đồng hồ thời trang"
                                className="form-input"
                                {...register("name", {
                                    required: "Tên danh mục không được để trống",
                                    minLength: {
                                        value: 4,
                                        message: "Tên danh mục phải ít nhất 4 ký tự",
                                    },
                                })}
                            />
                            {errors.name && <p className="form-error">{errors.name.message}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">
                                Mô tả <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                placeholder="Thông tin chi tiết về danh mục"
                                className="form-textarea"
                                {...register("description", {
                                    required: "Mô tả không được để trống",
                                })}
                            />
                            {errors.description && <p className="form-error">{errors.description.message}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="status">
                                Trạng thái <span className="required">*</span>
                            </label>
                            <select
                                id="status"
                                className="form-select"
                                {...register("status", {
                                    required: "Trạng thái là bắt buộc",
                                })}
                            >
                                <option value="active">Hiển thị</option>
                                <option value="inactive">Ẩn</option>
                            </select>
                            {errors.status && <p className="form-error">{errors.status.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? "Đang thêm..." : "Thêm danh mục"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CategoryCreate;