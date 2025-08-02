import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import HeaderAdmin from "../../layout/header";
import FormDelete from "../../../../components/formDelete/index.jsx";
import "./category.css";

import {
    FaChevronLeft,
    FaChevronRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaEdit,
    FaTrashAlt
} from "react-icons/fa";

function CategoryGetAll() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        getCategories(currentPage, searchTerm);
    }, [currentPage]);

    const getCategories = async (page = 1, search = "") => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/categories/list`, {
                params: { page, limit: perPage, searchTerm: search },
            });
            setCategories(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            if (search && (res.data.data || []).length === 0) {
                toast.info("Không tìm thấy danh mục nào.");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách danh mục:", error);
            toast.error("Không thể tải danh mục.");
        }
    };

  // thay vì setSelectedCategory -> show modal, mình sẽ dùng confirm:
const handleDeleteClick = (cat) => {
  const ok = window.confirm(`Xóa danh mục "${cat.name}"?`);
  if (!ok) return;
  axios.delete(`${Constants.DOMAIN_API}/admin/categories/delete/${cat.id}`)
    .then(() => {
      toast.success("Xóa thành công!");
      // reload data
      const isLast = categories.length === 1 && currentPage > 1;
      setCurrentPage(isLast ? currentPage - 1 : currentPage);
    })
    .catch(err => {
      const msg = err.response?.data?.error?.includes("foreign key")
        ? "Không thể xóa do ràng buộc sản phẩm."
        : "Xóa thất bại.";
      toast.error(msg);
    });
};

    const handleSearch = () => {
        setCurrentPage(1);
        getCategories(1, searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
        getCategories(1, "");
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        return (
            <div className="d-flex justify-content-center mt-3 mb-4">
                <div className="d-flex align-items-center flex-wrap">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        <FaAngleDoubleLeft />
                    </button>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        <FaChevronLeft />
                    </button>

                    {currentPage > 2 && (
                        <>
                            <button
                                onClick={() => handlePageChange(1)}
                                className="px-3 py-1 border rounded"
                            >
                                1
                            </button>
                            {currentPage > 3 && <span className="px-2">...</span>}
                        </>
                    )}

                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page >= currentPage - 1 && page <= currentPage + 1) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded ${currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-black hover:bg-gray-200"
                                        }`}
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
                                <span className="px-2">...</span>
                            )}
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                className="px-3 py-1 border rounded"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        <FaChevronRight />
                    </button>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        <FaAngleDoubleRight />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <HeaderAdmin />
            <div style={{ marginLeft: "14rem" }} className="min-h-screen bg-gray-100 p-4">
                <div className="container mx-auto bg-white shadow rounded">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold mt-3">Danh sách danh mục</h2>
                        <Link
                            to="/admin/categories/create"
                            className="category-button"
                        >
                            + Thêm danh mục
                        </Link>
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Nhập tên danh mục cần tìm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                        <button onClick={handleSearch} className="search-button mb-2">
                            Tìm kiếm
                        </button>
                        {searchTerm && (
                            <button onClick={handleClearSearch} className="search-button mb-2">
                                Xem tất cả
                            </button>
                        )}
                    </div>

                    <table className="w-full table-auto border border-collapse border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">#</th>
                                <th className="border p-2">Tên</th>
                                <th className="border p-2">Mô tả</th>
                                <th className="border p-2">Trạng thái</th>
                                <th className="border p-2">Ngày tạo</th>
                                <th className="border p-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, index) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="border p-2 text-center">
                                        {(currentPage - 1) * perPage + index + 1}
                                    </td>
                                    <td className="border p-2">{cat.name}</td>
                                    <td className="border p-2">{cat.description || "-"}</td>
                                    <td className="border p-2 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${cat.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {cat.status === "active" ? "Hiển thị" : "Ẩn"}
                                        </span>
                                    </td>
                                    <td className="border p-2 text-center">
                                        {new Date(cat.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="border p-2">
                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                            <Link
                                                to={`/admin/categories/edit/${cat.id}`}
                                                className="btn btn-warning d-flex align-items-center justify-content-center p-0 mt-2"
                                                style={{ width: '36px', height: '36px' }}
                                            >
                                                <FaEdit style={{ color: 'white', width: '20px', height: '20px' }} />
                                            </Link>

                                            <button
                                                onClick={() => handleDeleteClick(cat)}
    className="w-9 h-9 bg-red-600 text-white flex items-center justify-center rounded"
                                                style={{ width: '36px', height: '36px' }}
                                            >
                                                <FaTrashAlt style={{ color: 'white', width: '18px', height: '18px' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {renderPagination()}
                </div>
            </div>
            {/* <FormDelete
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onConfirm={deleteCategory}
        message={`Xóa danh mục "${selectedCategory?.name}"?`}
        Id={selectedCategory?.id}
      /> */}
        </>
    );
}

export default CategoryGetAll;