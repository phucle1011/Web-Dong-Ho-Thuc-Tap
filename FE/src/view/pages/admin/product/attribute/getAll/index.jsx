import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../../components/formDelete";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaTrashAlt,FaEdit,FaEye
} from "react-icons/fa";

function AttributeGetAll() {
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getAttributes(currentPage, searchTerm);
  }, [currentPage]);

  const getAttributes = async (page = 1, search = "") => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/attribute`, {
        params: { page, limit: perPage, searchTerm: search },
      });
      setAttributes(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      if (search && (res.data.data || []).length === 0) {
        toast.info("Không tìm thấy thuộc tính nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thuộc tính:", error);
      toast.error("Không thể tải danh sách.");
    }
  };

  const deleteAttribute = async () => {
    if (!selectedAttribute) return;

    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/attribute/${selectedAttribute.id}`);
      toast.success("Xoá thuộc tính thành công");
      if (attributes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        getAttributes(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Lỗi khi xoá thuộc tính:", error);
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setSelectedAttribute(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getAttributes(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    getAttributes(1, "");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => (
  <div className="flex justify-center mt-6 space-x-1">
    <button
      onClick={() => setCurrentPage(1)}
      disabled={currentPage === 1}
      className="px-2 py-1 border rounded disabled:opacity-50"
    >
      <FaAngleDoubleLeft />
    </button>

    <button
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className="px-2 py-1 border rounded disabled:opacity-50"
    >
      <FaChevronLeft />
    </button>

    {Array.from({ length: totalPages }).map((_, i) => {
      const page = i + 1;
      if (Math.abs(page - currentPage) <= 1) {
        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      }
      return null;
    })}

    <button
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className="px-2 py-1 border rounded disabled:opacity-50"
    >
      <FaChevronRight />
    </button>

    <button
      onClick={() => setCurrentPage(totalPages)}
      disabled={currentPage === totalPages}
      className="px-2 py-1 border rounded disabled:opacity-50"
    >
      <FaAngleDoubleRight />
    </button>
  </div>
);


  return (
            <div style={{ marginLeft: "14rem" }} className="min-h-screen bg-gray-100 p-4">
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h2 className="h5 fw-semibold">Danh sách thuộc tính</h2>
    <Link to="/admin/attribute/create" className="btn btn-primary">
      + Thêm thuộc tính
    </Link>
  </div>

  <div className="search-container flex gap-2 mb-4">
    <input
      type="text"
      className="search-input flex-1"
      placeholder="Nhập tên thuộc tính cần tìm..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSearch();
      }}
    />
    <button onClick={handleSearch} className="search-button mb-2">
Tìm kiếm    </button>
    {searchTerm && (
      <button
        onClick={handleClearSearch}
        className="search-button mb-2"
      >
        Xem tất cả
      </button>
    )}
  </div>


<table className="w-full table-auto border border-gray-300">
  <thead className="bg-gray-100">
    <tr>
      <th className="border p-2">#</th>
      <th className="border p-2">Tên thuộc tính</th>
      <th className="border p-2">Ngày tạo</th>
      <th className="border p-2 text-center">Hành động</th>
    </tr>
  </thead>
  <tbody>
    {attributes.length === 0 ? (
      <tr>
        <td colSpan="4" className="border p-4 text-center">
          Không có thuộc tính nào.
        </td>
      </tr>
    ) : (
      attributes.map((attr, index) => (
        <tr key={attr.id} className="hover:bg-gray-50">
          <td className="border p-2 text-center">
            {(currentPage - 1) * perPage + index + 1}
          </td>
          <td className="border p-2">{attr.name}</td>
          <td className="border p-2 text-center">
            {new Date(attr.created_at).toLocaleDateString()}
          </td>
          <td className="border p-2">
  <div className="flex justify-center items-center gap-2">
    <Link
      to={`/admin/attribute/edit/${attr.id}`}
      className="btn btn-warning flex items-center justify-center p-0"
      style={{ width: 36, height: 36 }}
    >
      <FaEdit className="text-white" size={20} />
    </Link>
    <button
      onClick={() => setSelectedAttribute(attr)}
      className="w-9 h-9 bg-red-600 text-white flex items-center justify-center rounded mb-2"
      style={{ width: 36, height: 36 }}
    >
      <FaTrashAlt size={18} />
    </button>
  </div>
</td>

        </tr>
      ))
    )}
  </tbody>
</table>


  {renderPagination()}

  {selectedAttribute && (
    <FormDelete
      isOpen={true}
      onClose={() => setSelectedAttribute(null)}
      onConfirm={deleteAttribute}
      message={`Bạn có chắc chắn muốn xoá thuộc tính "${selectedAttribute.name}" không?`}
    />
  )}
</div>

  );
}

export default AttributeGetAll;
