import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaEye } from "react-icons/fa";
import Constants from "../../../../../Constants";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";
import HeaderAdmin from "../../layout/header";
import "./oder.css";
import { Link } from "react-router-dom";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return null;
}

function translateStatus(status) {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "shipping":
      return "Đang giao";
    case "completed":
      return "Hoàn thành";
    case "delivered":
      return "Đã giao hàng thành công";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

const getStatusesForOrder = (currentStatus) => {
  switch (currentStatus) {
    case "pending":
      return ["pending", "confirmed", "shipping", "completed", "delivered", "cancelled"];
    case "confirmed":
      return ["confirmed", "shipping", "completed", "delivered", "cancelled"];
    case "shipping":
      return ["shipping", "completed", "delivered"];
    case "completed":
      return ["completed", "delivered"];
    case "delivered":
      return ["delivered"];
    case "cancelled":
      return ["cancelled"];
    default:
      return ["pending", "confirmed", "shipping", "completed", "delivered", "cancelled"];
  }
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfoMap, setTrackingInfoMap] = useState({});
  const recordsPerPage = 10;
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  const formatDateVN = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split("T")[0];
  };

  const fetchOrders = async (page = 1, status = "", search = "") => {
    setLoading(true);
    const token = getCookie(Constants.COOKIE_TOKEN);
    try {
      const params = { page, limit: recordsPerPage };
      if (status) params.status = status;
      if (search) params.searchTerm = search;

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setOrders(res.data.data);
      setTotalPages(res.data.totalPages || 1);

      if (res.data.counts) {
        setStatusCounts({
          all: res.data.counts.all || 0,
          pending: res.data.counts.pending || 0,
          confirmed: res.data.counts.confirmed || 0,
          shipping: res.data.counts.shipping || 0,
          completed: res.data.counts.completed || 0,
          delivered: res.data.counts.delivered || 0,
          cancelled: res.data.counts.cancelled || 0,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      toast.error("Lỗi khi lấy danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter, searchTerm);
  }, [currentPage, statusFilter, searchTerm]);

  const deleteOrder = async () => {
    if (!selectedOrder) return;
    const token = getCookie(Constants.COOKIE_TOKEN);
    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/orders/delete/${selectedOrder.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Hủy đơn hàng thành công");
      setSelectedOrder(null);
      fetchOrders(currentPage, statusFilter, searchTerm);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      const message = error.response?.data?.message || "";

      if (message === "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'") {
        toast.warning("Chỉ được hủy những đơn hàng có trạng thái là 'Chờ xác nhận'");
      } else if (message === "Id không tồn tại") {
        toast.error("Đơn hàng không tồn tại");
      } else {
        toast.error("Không thể hủy đơn hàng");
      }
    } finally {
      setSelectedOrder(null);
    }
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    const token = getCookie(Constants.COOKIE_TOKEN);
    try {
      await axios.put(`${Constants.DOMAIN_API}/admin/orders/edit/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders(currentPage, statusFilter, searchTerm);
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
      console.error("Lỗi cập nhật:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchSubmit = async () => {
    if (searchTerm.trim() === '') {
      toast.warning("Vui lòng nhập mã đơn hàng hoặc tên người dùng cần tìm.");
      return;
    }
    setCurrentPage(1);
    const token = getCookie(Constants.COOKIE_TOKEN);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { searchTerm: searchTerm.trim() },
      });
      if (res.data.data.length === 0) {
        toast.warning("Không tìm thấy đơn hàng nào.");
      }
      setOrders(res.data.data);
      setTotalPages(1);
      toast.success("Tìm kiếm đơn hàng thành công");
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
      toast.error("Không tìm thấy đơn hàng");
      setOrders([]);
    }
  };

  const handleExcelExport = async () => {
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn đầy đủ khoảng thời gian.");
      return;
    }
    const token = getCookie(Constants.COOKIE_TOKEN);
    const start = formatDateVN(startDate);
    const end = formatDateVN(endDate);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/export-excel`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: start, end_date: end },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DonHang_${start}_den_${end}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  const handleTrackOrder = async (orderCode) => {
    if (!orderCode) return;
    const token = getCookie(Constants.COOKIE_TOKEN);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/track/${orderCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      if (!data.locations || data.locations.length === 0) {
        toast.info("Đơn hàng chưa có thông tin theo dõi vận chuyển.");
      }
      setTrackingInfoMap(prev => ({
        ...prev,
        [orderCode]: {
          orderCode,
          status: data.status,
          location: data.locations && data.locations.length > 0 ? data.locations[0].location : "Không có thông tin vị trí",
          locations: data.locations || [],
        }
      }));
    } catch (error) {
      console.error("Lỗi khi theo dõi đơn hàng:", error);
      toast.error("Không thể theo dõi đơn hàng");
      setTrackingInfoMap(prev => {
        const newMap = { ...prev };
        delete newMap[orderCode];
        return newMap;
      });
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFilterByDate = async () => {
    if (!startDate || !endDate) {
      toast.warning("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc");
      return;
    }
    const start = formatDateVN(startDate);
    const end = formatDateVN(endDate);
    const token = getCookie(Constants.COOKIE_TOKEN);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/filter-by-date`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: start,
          endDate: end,
          status: statusFilter || undefined,
        },
      });
      if (res.data.data.length === 0) {
        toast.warning("Không có đơn hàng trong khoảng thời gian này.");
      }
      setOrders(res.data.data);
      setTotalPages(1);
      // toast.success("Lọc đơn hàng theo ngày thành công");
    } catch (error) {
      console.error("Lỗi khi lọc đơn hàng:", error);
      toast.error("Không thể lọc đơn hàng theo ngày");
    }
  };

  return (
    <div>
      <HeaderAdmin />
      <div className="main-container">
        <h2 className="text-2xl font-semibold">Danh Sách Đơn Hàng</h2>
        <div className="order-container custom-column-layout">
          <div className="p-4 bg-white rounded shadow-md flex flex-col space-y-6 w-full">
            <div className="w-full space-y-4">
              <p className="font-semibold mb-2 text-sm">Chọn khoảng thời gian:</p>
              <div className="flex flex-wrap items-center gap-2 max-w-[700px] text-sm">
                <label>Từ ngày:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="border px-2 py-1 rounded"
                  placeholderText="Chọn ngày bắt đầu"
                />
                <label className="ms-2">Đến ngày:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="border px-2 py-1 rounded"
                  placeholderText="Chọn ngày kết thúc"
                />
                <button
                  onClick={handleExcelExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded ms-4 min-w-[90px] text-xs"
                >
                  Xuất Excel
                </button>
                <button
                  onClick={handleFilterByDate}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded min-w-[90px] text-xs ms-2"
                >
                  Lọc theo ngày
                </button>
              </div>
            </div>


          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "", label: "Tất cả", color: "bg-gray-800", textColor: "text-white", count: statusCounts.all },
            { key: "pending", label: "Chờ xác nhận", color: "bg-amber-300", textColor: "text-amber-800", count: statusCounts.pending },
            { key: "confirmed", label: "Đã xác nhận", color: "bg-yellow-300", textColor: "text-yellow-900", count: statusCounts.confirmed },
            { key: "shipping", label: "Đang giao", color: "bg-blue-300", textColor: "text-blue-900", count: statusCounts.shipping },
            { key: "completed", label: "Hoàn thành", color: "bg-emerald-300", textColor: "text-emerald-800", count: statusCounts.completed },
            { key: "delivered", label: "Đã giao", color: "bg-green-300", textColor: "text-green-800", count: statusCounts.delivered },
            { key: "cancelled", label: "Đã hủy", color: "bg-rose-300", textColor: "text-rose-800", count: statusCounts.cancelled },
          ].map(({ key, label, color, textColor, count }) => (
            <button
              key={key || "all"}
              onClick={() => handleFilterClick(key)}
              className={`m-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${statusFilter === key ? "bg-blue-900 text-white" : `${color} ${textColor}`
                }`}
            >
              <span>{label}</span>
              <span className="rounded-md px-2 py-0.5 text-xs font-semibold leading-none">{count}</span>
            </button>
          ))}
        </div>

        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Vui lòng nhập mã đơn hàng hoặc tên khách hàng..."
            className="search-input"
          />
          <button onClick={handleSearchSubmit} className="search-button mb-2">
            Tìm kiếm
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                fetchOrders(currentPage, statusFilter);
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
                <th className="w-12 px-4 py-3 border border-gray-300">ID</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Mã đơn</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Tên khách hàng</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Ngày đặt</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Ghi chú</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Trạng thái</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-600">Đang tải dữ liệu...</td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td className="p-2 border border-gray-300">{order.id}</td>
                      <td className="p-2 border border-gray-300">{order.order_code || "(không có mã)"}</td>
                      <td className="p-2 border border-gray-300">{order.userOrder?.name || order.user?.name || "Không rõ"}</td>
                      <td className="p-2 border border-gray-300">{order.order_date ? new Date(order.order_date).toLocaleString("vi-VN", { hour12: false }) : (order.created_at ? new Date(order.created_at).toLocaleString("vi-VN", { hour12: false }) : "Không rõ")}</td>
                      <td className="p-2 border border-gray-300">{order.note || "Không có"}</td>
                      <td className="p-2 border border-gray-300">
                        <select
                          value={order.status}
                          onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                          className="capitalize border rounded px-2 py-1"
                        >
                          {getStatusesForOrder(order.status).map(status => (
                            <option key={status} value={status}>{translateStatus(status)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 border border-gray-300 flex gap-2 flex-wrap">
                        <Link to={`/admin/orders/detail/${order.id}`} className="detail bg-blue-500 text-white py-1 px-3 rounded"><FaEye /></Link>
                        {/* <button onClick={() => handleTrackOrder(order.order_code)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded">
                          Vị trí
                        </button> */}
                        {/* {["pending"].includes(order.status) && (
                          <button onClick={() => setSelectedOrder(order)} className="bg-red-500 text-white px-3 py-1 rounded ms-2">
                            Hủy
                          </button>
                        )} */}
                      </td>
                    </tr>
                    {trackingInfoMap[order.order_code] && (
                      <tr>
                        <td colSpan={10} className="p-4 bg-yellow-50 border border-gray-300 rounded-lg">
                          <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-semibold mb-2">Theo dõi đơn hàng: <span className="text-blue-700">{order.order_code}</span></h4>
                            {trackingInfoMap[order.order_code].locations.length === 0 && (
                              <p>Chưa có thông tin vận chuyển.</p>
                            )}
                            {trackingInfoMap[order.order_code].locations.map((loc, idx) => (
                              <div key={idx} className="mb-3 p-3 bg-white rounded border border-gray-200 shadow-sm relative">
                                <div className="absolute -left-3 top-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                                <p><strong>Thời gian:</strong> {new Date(loc.time).toLocaleString("vi-VN", { hour12: false })}</p>
                                <p><strong>Vị trí:</strong> {loc.location}</p>
                                <p><strong>Trạng thái:</strong> {loc.status}</p>
                                {loc.note && <p><strong>Ghi chú:</strong> {loc.note}</p>}
                              </div>
                            ))}
                            <button onClick={() => {
                              const newMap = { ...trackingInfoMap };
                              delete newMap[order.order_code];
                              setTrackingInfoMap(newMap);
                            }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2">
                              Đóng
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-600">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <FormDelete
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            onConfirm={deleteOrder}
            message={`Bạn có chắc chắn muốn hủy đơn hàng có mã đơn "${selectedOrder.order_code}" không?`}
          />
        )}

        <div className="d-flex justify-content-center mt-3">
          <div className="d-flex align-items-center flex-wrap mb-3">
            <button disabled={currentPage === 1} onClick={() => handlePageChange(1)} className="px-3 py-1 border rounded disabled:opacity-50"><FaAngleDoubleLeft /></button>
            <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1 border rounded disabled:opacity-50"><FaChevronLeft /></button>

            {currentPage > 2 && (
              <>
                <button onClick={() => handlePageChange(1)} className="px-3 py-1 border rounded">1</button>
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
                    className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-600 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                <button onClick={() => handlePageChange(totalPages)} className="px-3 py-1 border rounded">{totalPages}</button>
              </>
            )}

            <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1 border rounded disabled:opacity-50"><FaChevronRight /></button>
            <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)} className="px-3 py-1 border rounded disabled:opacity-50"><FaAngleDoubleRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;