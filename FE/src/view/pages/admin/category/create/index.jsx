import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import HeaderAdmin from "../../layout/header";
import { useForm } from "react-hook-form";
import FormDelete from "../../../../components/formDelete";
import {
    FaChevronLeft,
    FaChevronRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaEdit,
    FaTrashAlt
} from "react-icons/fa";
import "./category.css";

const generateSlug = (text) =>
    text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

export default function CategoryCreateAndList() {
    const navigate = useNavigate();

    // --- form state
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            status: "active"
        }
    });
    const nameValue = watch("name");
    if (nameValue && !watch("slug")) {
        setValue("slug", generateSlug(nameValue));
    }

    const onSubmit = async (data) => {
        try {
            await axios.post(
                `${Constants.DOMAIN_API}/admin/categories/create`,
                {
                    name: data.name.trim(),
                    slug: generateSlug(data.name),
                    description: data.description.trim(),
                    status: data.status
                }
            );
            toast.success("Thêm danh mục thành công!");
            navigate("/admin/categories/getAll");
            fetchCategories(currentPage, searchTerm);
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error("Tên danh mục đã tồn tại.");
            } else {
                toast.error("Thêm danh mục thất bại.");
            }
        }
    };

    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchCategories(currentPage, searchTerm);
    }, [currentPage]);

    const fetchCategories = async (page = 1, search = "") => {
        try {
            const res = await axios.get(
                `${Constants.DOMAIN_API}/admin/categories/list`,
                { params: { page, limit: perPage, searchTerm: search } }
            );
            setCategories(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            if (search && (res.data.data || []).length === 0) {
                toast.info("Không tìm thấy danh mục nào.");
            }
        } catch {
            toast.error("Không thể tải danh mục.");
        }
    };

    const handlePageChange = (p) => {
        if (p >= 1 && p <= totalPages) setCurrentPage(p);
    };

    const renderPagination = () => (
        <div className="flex justify-center mt-3 mb-5">
            <div className="flex items-center flex-wrap gap-1">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                    className="px-2 py-0.5 border rounded bg-blue-600 text-white disabled:opacity-50 text-xs"
                >
                    <FaAngleDoubleLeft />
                </button>
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-2 py-0.5 border rounded bg-blue-600 text-white disabled:opacity-50 text-xs"
                >
                    <FaChevronLeft />
                </button>
                {currentPage > 2 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-2 py-0.5 border rounded bg-blue-600 text-white text-xs"
                        >
                            1
                        </button>
                        {currentPage > 3 && <span className="px-1 text-xs">...</span>}
                    </>
                )}
                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page >= currentPage - 1 && page <= currentPage + 1) {
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className="px-2 py-0.5 border rounded bg-blue-600 text-white text-xs"
                            >
                                {page}
                            </button>
                        );
                    }
                    return null;
                })}
                {currentPage < totalPages - 1 && (
                    <>
                        {currentPage < totalPages - 2 && (
                            <span className="px-1 text-xs">...</span>
                        )}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-2 py-0.5 border rounded bg-blue-600 text-white text-xs"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-2 py-0.5 border rounded bg-blue-600 text-white disabled:opacity-50 text-xs"
                >
                    <FaChevronRight />
                </button>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-2 py-0.5 border rounded bg-blue-600 text-white disabled:opacity-50 text-xs"
                >
                    <FaAngleDoubleRight />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <HeaderAdmin />
            <div
                style={{ marginLeft: "14rem" }}
                className="min-h-screen bg-gray-100 p-4"
            >
                <div className="container mx-auto bg-white shadow rounded p-6">
                    {/* ===== Form thêm danh mục ===== */}
                    <h2 className="text-xl font-semibold mb-4">Thêm danh mục mới</h2>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className="mb-4">
                            <label htmlFor="name" className="block font-medium mb-1">
                                Tên danh mục <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                {...register("name", {
                                    required: "Tên không được bỏ trống",
                                    minLength: {
                                        value: 4,
                                        message: "Phải ít nhất 4 ký tự"
                                    }
                                })}
                                className="w-full border px-3 py-2 rounded"
                                placeholder="VD: Đồng hồ thể thao"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block font-medium mb-1">
                                Mô tả <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                {...register("description", {
                                    required: "Mô tả không được bỏ trống"
                                })}
                                rows={3}
                                className="w-full border px-3 py-2 rounded"
                                placeholder="Mô tả ngắn về danh mục"
                            />
                            {errors.description && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="status" className="block font-medium mb-1">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                {...register("status", {
                                    required: true
                                })}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="active">Hiển thị</option>
                                <option value="inactive">Ẩn</option>
                            </select>
                        </div>
                        <button
                            onClick={() => navigate('/admin/categories/getAll')}
                            className="category-button bg-gray-500 mr-3"
                        >
                            &larr; Quay lại
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#1e40af] text-white rounded hover:[#1e40af]-700"
                        >
                            {isSubmitting ? "Đang lưu..." : "Thêm danh mục"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
