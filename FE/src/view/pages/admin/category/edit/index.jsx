import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import HeaderAdmin from "../../layout/header";
import { useForm } from "react-hook-form";

const generateSlug = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

export default function CategoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            status: "active"
        }
    });

    useEffect(() => {
        axios.get(`${Constants.DOMAIN_API}/admin/categories/detail/${id}`)
            .then(res => {
                const cat = res.data.data;
                setValue("name", cat.name);
                setValue("slug", cat.slug);
                setValue("description", cat.description);
                setValue("status", cat.status);
            })
            .catch(() => {
                toast.error("Không thể tải danh mục.");
                navigate("/admin/categories/getAll");
            });
    }, [id, navigate, setValue]);

    const nameValue = watch("name");
    const slugValue = watch("slug");
    useEffect(() => {

        if (nameValue && (!slugValue || slugValue === generateSlug(nameValue))) {
            setValue("slug", generateSlug(nameValue));
        }
    }, [nameValue, slugValue, setValue]);

    const onSubmit = async (formData) => {
        setLoading(true);
        const payload = {
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            status: formData.status
        };

        try {
            await axios.put(
                `${Constants.DOMAIN_API}/admin/categories/edit/${id}`,
                payload
            );
            toast.success("Cập nhật danh mục thành công!");
            navigate("/admin/categories/getAll");
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error("Tên danh mục đã tồn tại.");
            } else {
                toast.error("Cập nhật danh mục thất bại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div style={{ marginLeft: "16rem" }} className="min-h-screen bg-gray-100 p-4">
                <div className="container mx-auto bg-white shadow rounded p-6 max-w-lg">
                    <h2 className="text-xl font-semibold mb-6 mt-3">Cập nhật danh mục</h2>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Name */}
                        <div className="form-group mb-4">
                            <label htmlFor="name" className="form-label">
                                Tên danh mục <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="VD: Đồng hồ thời trang"
                                className="form-input"
                                {...register("name", {
                                    required: "Tên danh mục không được để trống",
                                    minLength: { value: 4, message: "Phải ít nhất 4 ký tự" }
                                })}
                            />
                            {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Slug */}
                        <div className="form-group mb-4">
                            <label htmlFor="slug" className="form-label">
                                Slug
                            </label>
                            <input
                                id="slug"
                                type="text"
                                placeholder="auto-generated slug"
                                className="form-input"
                                {...register("slug", {
                                    required: "Slug không được để trống",
                                })}
                            />
                            {errors.slug && <p className="text-red-500 mt-1">{errors.slug.message}</p>}
                        </div>

                        {/* Description */}
                        <div className="form-group mb-4">
                            <label htmlFor="description" className="form-label">
                                Mô tả <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                placeholder="Thông tin chi tiết về danh mục"
                                className="form-textarea"
                                {...register("description", {
                                    required: "Mô tả không được để trống"
                                })}
                            />
                            {errors.description && <p className="text-red-500 mt-1">{errors.description.message}</p>}
                        </div>

                        {/* Status */}
                        <div className="form-group mb-6">
                            <label htmlFor="status" className="form-label">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                className="form-select"
                                {...register("status", {
                                    required: "Trạng thái là bắt buộc"
                                })}
                            >
                                <option value="active">Hiển thị</option>
                                <option value="inactive">Ẩn</option>
                            </select>
                            {errors.status && <p className="text-red-500 mt-1">{errors.status.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
                        >
                            {loading ? "Đang cập nhật..." : "Cập nhật danh mục"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
