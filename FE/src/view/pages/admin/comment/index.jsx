import { useEffect, useState } from "react";
import axios from "axios";
import HeaderAdmin from "../layout/header";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import constant from "../../../../Constants";
import "./comment.css";

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${constant.DOMAIN_API}/admin/comment/list`, {
        params: {
          page: currentPage,
          limit: perPage,
          search: searchTerm.trim(),
        },
      });
      setComments(res.data.data || []);
      setTotalPages(Math.ceil((res.data.total || 1) / perPage));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bình luận:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchComments();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div>
      <HeaderAdmin />
      <div className="main-container">
        <h2 className="text-xl font-semibold mb-3">Danh Sách Bình Luận</h2>

        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên người dùng hoặc sản phẩm..."
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button mb-2">Tìm kiếm</button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                fetchComments();
              }}
              className="search-button mb-2"
              style={{ marginLeft: "0" }}
            >
              Xem tất cả
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-left text-sm mb-3">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-3 border">#</th>
                <th className="px-6 py-3 border font-semibold">Tên Người Dùng</th>
                <th className="px-6 py-3 border font-semibold">Sản Phẩm</th>
                <th className="px-6 py-3 border font-semibold">Bình Luận</th>
                <th className="px-6 py-3 border font-semibold">Sao</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">Đang tải...</td>
                </tr>
              ) : comments.length > 0 ? (
                comments.map((comment, index) => (
                  <tr key={comment.id}>
                    <td className="p-2 border">{(currentPage - 1) * perPage + index + 1}</td>
                    <td className="p-2 border">{comment.user?.name || "Ẩn danh"}</td>
                    <td className="p-2 border">{comment.orderDetail?.variant?.product?.name || comment.orderDetail?.variant?.sku || "Không rõ"}</td>
                    <td className="p-2 border">{comment.comment_text}</td>
                    <td className="p-2 border">{comment.rating} ⭐</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6">Không có bình luận nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <div className="d-flex align-items-center flex-wrap mb-3">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (page >= currentPage - 1 && page <= currentPage + 1) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded mx-1 ${currentPage === page
                      ? "bg-[#1e40af] text-white"
                      : "bg-white text-black hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
