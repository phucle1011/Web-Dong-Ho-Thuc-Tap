import { useEffect, useState } from "react";
import axios from "axios";
import HeaderAdmin from "../../layout/header";
import "./style.css";
import constant from "../../../../../Constants";
import { FaEye, FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DEFAULT_LIMIT = 10;

const AddressManage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const baseURL = constant.DOMAIN_API;

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/admin/address/list`, {
        params: {
          page: currentPage,
          limit: DEFAULT_LIMIT,
          search: searchTerm.trim(),
        },
      });

      const { data = [], total = 0 } = res.data;
      const unique = data.reduce((acc, cur) => {
        if (!acc.find((a) => a.user_id === cur.user_id)) acc.push(cur);
        return acc;
      }, []);
      setAddresses(unique);
      setTotalPages(Math.ceil(total / DEFAULT_LIMIT));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", err);
      toast.error("Lỗi khi lấy danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [currentPage]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.warning("Vui lòng nhập mã đơn hàng hoặc tên người dùng cần tìm.");
      return;
    }
    setCurrentPage(1);
    fetchAddresses();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dt) => (dt ? new Date(dt).toLocaleString("vi-VN") : "");

  return (
    <>
      <HeaderAdmin />
      <div className="min-h-screen bg-gray-100 p-4" style={{ marginLeft: "14rem" }}>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">DANH SÁCH ĐỊA CHỈ</h2>

          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleEnter}
              placeholder="Vui lòng nhập mã đơn hàng hoặc tên khách hàng..."
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">Tìm</button>
          </div>

          <div className="overflow-auto mt-4">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">Tên người dùng</th>
                  <th className="border p-2">Địa chỉ</th>
                  <th className="border p-2">Tỉnh/Thành</th>
                  <th className="border p-2">Quận/Huyện</th>
                  <th className="border p-2">Mặc định</th>
                  <th className="border p-2">Ngày tạo</th>
                  <th className="border p-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center p-2">Đang tải...</td></tr>
                ) : addresses.length === 0 ? (
                  <tr><td colSpan={8} className="text-center p-2">Không có dữ liệu</td></tr>
                ) : (
                  addresses.map((addr, idx) => (
                    <tr key={addr.id}>
                      <td className="border p-2">{(currentPage - 1) * DEFAULT_LIMIT + idx + 1}</td>
                      <td className="border p-2">
                        {addr.user?.name || `User #${addr.user_id}`}<br />
                        <small>{addr.user?.email}</small>
                      </td>
                      <td className="border p-2">{addr.address_line}</td>
                      <td className="border p-2">{addr.city}</td>
                      <td className="border p-2">{addr.district}</td>
                      <td className="border p-2 text-center">{addr.is_default ? "✔" : ""}</td>
                      <td className="border p-2">{formatDate(addr.created_at)}</td>
                      <td className="border p-2 text-center">
                        <button
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          title="Xem chi tiết"
                          onClick={() => navigate(`/admin/address/detail/${addr.user_id}`)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION UI */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50 disabled:bg-gray-300"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50 disabled:bg-gray-300"
              >
                <FaChevronLeft />
              </button>

              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90"
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="px-2 text-gray-600">...</span>}
                </>
              )}

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page >= currentPage - 1 && page <= currentPage + 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === page
                          ? "bg-[#1e40af] text-white"
                          : "bg-[#1e40af] text-white hover:bg-[#1e40af]/90"
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
                    <span className="px-2 text-gray-600">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50 disabled:bg-gray-300"
              >
                <FaChevronRight />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white disabled:opacity-50 disabled:bg-gray-300"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressManage;
