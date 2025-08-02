import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEye,
  FaEyeSlash,
  FaRedo,
  FaTrashAlt
} from "react-icons/fa";
import Constants from "../../../Constants";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderTab() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const recordsPerPage = 10;
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeStatus, setActiveStatus] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetailsMap, setOrderDetailsMap] = useState({});
  const [confirmDeliveryOrder, setConfirmDeliveryOrder] = useState(null);
  const [user, setUser] = useState(null);

  const translateStatus = (status) => {
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
  };

  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const fetchStatusCounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`${Constants.DOMAIN_API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": user.id,
        },
      });
      setStatusCounts(res.data.statusCounts || statusCounts);
    } catch (error) {
      console.error("Lỗi khi tải statusCounts:", error);
      toast.error("Lỗi tải số lượng trạng thái.");
    }
  };

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  const fetchOrders = async (page = 1) => {
    try {
      const params = {
        page,
        limit: recordsPerPage,
      };

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchTerm.trim()) {
        params.searchTerm = searchTerm;
      }

      if (startDate) {
        params.startDate = formatDateLocal(startDate);
      }
      if (endDate) {
        params.endDate = formatDateLocal(endDate);
      }

      const user = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(`${Constants.DOMAIN_API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": user.id,
        },
        params,
      });

      setOrders(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      if (!res.data.data.length) {
        toast.info("Không tìm thấy đơn hàng nào.");
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      toast.error("Lỗi tải dữ liệu từ máy chủ.");
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, statusFilter]);

  const deleteOrder = async (reason) => {
    if (!selectedOrder) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.put(
        `${Constants.DOMAIN_API}/orders/cancel/${selectedOrder.id}`,
        { cancellation_reason: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": user.id,
          },
        }
      );

      toast.success("Hủy đơn hàng thành công");
      setSelectedOrder(null);
      fetchOrders(currentPage);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể hủy đơn hàng";

      if (
        message === "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'"
      ) {
        toast.warning("Chỉ được hủy những đơn hàng có trạng thái là 'Chờ xác nhận'");
      } else if (message === "Id không tồn tại") {
        toast.error("Đơn hàng không tồn tại");
      } else {
        toast.error(message);
      }
    } finally {
      setSelectedOrder(null);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchOrders(1);
    }
  }, [searchTerm]);

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setActiveStatus(status);
  };

  const handleReorder = async (orderId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        toast.error("Bạn chưa đăng nhập.");
        return;
      }

      const userId = user?.id;

      if (!userId) {
        toast.error("Không xác định được người dùng từ token.");
        return;
      }

      let items = [];

      if (!orderDetailsMap[orderId.id]) {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/${orderId.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const orderDetails = res.data?.data?.orderDetails || [];
        setOrderDetailsMap((prev) => ({
          ...prev,
          [orderId.id]: orderDetails,
        }));

        items = [...orderDetails];
      } else {
        items = [...orderDetailsMap[orderId.id]];
      }
      console.log(setOrderDetailsMap());
      

      if (items.length === 0) {
        toast.warning("Không có sản phẩm nào trong đơn hàng.");
        return;
      }

      for (const item of items) {
        const variantId = item.variant?.id;
        const quantity = item.quantity;

        if (!variantId || quantity <= 0) {

          continue;
        }

        try {
          const res = await axios.post(
            `${Constants.DOMAIN_API}/add-to-carts`,
            {
              userId,
              productVariantId: variantId,
              quantity,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "x-user-id": userId,
              },
            }
          );

        } catch (err) {
          console.error("Lỗi khi thêm vào giỏ:", err);
        }
      }

      toast.success("Đã thêm lại sản phẩm từ đơn hàng bị hủy vào giỏ hàng.");
      navigate("/cart");
    } catch (error) {
      console.error("Lỗi khi mua lại đơn hàng:", error);
      toast.error("Không thể mua lại đơn hàng.");
    }
  };

  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;

    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.data) {
        const orderDetails = res.data.data.orderDetails || [];

        const processedDetails = orderDetails.map((detail) => ({
          ...detail,
          comment: detail.comments?.[0] || null,
        }));

        setOrderDetailsMap((prev) => ({
          ...prev,
          [orderId]: processedDetails,
        }));
      } else {
        setOrderDetailsMap((prev) => ({
          ...prev,
          [orderId]: [],
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
      setOrderDetailsMap((prev) => ({
        ...prev,
        [orderId]: [],
      }));
    }
  };

  const FormDelete = ({ isOpen, onClose, onConfirm, message = "Bạn có chắc chắn muốn xóa?" }) => {
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
      const finalReason = reason === "Khác" ? customReason : reason;
      onConfirm(finalReason);
    };

    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
        <div className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>
          <h5 className="fw-semibold mb-3">{message}</h5>

          <label className="form-label mb-2">Lý do hủy:</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="form-select mb-3"
          >
            <option value="">-- Chọn lý do --</option>
            <option value="Không cần nữa">Không cần nữa</option>
            <option value="Thay đổi ý định">Thay đổi ý định</option>
            <option value="Giá quá cao">Giá quá cao</option>
            <option value="Giao hàng chậm">Giao hàng chậm</option>
            <option value="Khác">Khác</option>
          </select>

          {reason === "Khác" && (
            <>
              <label className="form-label mt-3">Vui lòng nhập lý do khác:</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do hủy..."
                className="form-control"
              />
            </>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={reason === "" || (reason === "Khác" && customReason.trim() === "")}
              className={`btn btn-danger ${reason === "Khác" && !customReason.trim() ? "disabled" : ""}`}
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>

    );
  };

  const handleConfirmDelivery = async () => {
    const order = confirmDeliveryOrder;
    if (!order) return;

    try {
      await axios.put(`${Constants.DOMAIN_API}/orders/confirm-delivered/${order.id}`);
      toast.success("Xác nhận giao hàng thành công");
      fetchOrders(currentPage);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể xác nhận giao hàng";
      toast.error(message);
    } finally {
      setConfirmDeliveryOrder(null);
    }
  };

  const FormConfirmDelivery = ({ isOpen, onClose, onConfirm, orderCode }) => {
    if (!isOpen) return null;

    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
        <div className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>
          <h5 className="fw-semibold mb-4">
            Bạn có chắc chắn muốn xác nhận đã giao hàng thành công cho đơn hàng có mã "{orderCode}"?
          </h5>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-success"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid p-2">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h2 className="h5 mb-0 font-weight-bold text-nowrap">Danh sách đơn hàng</h2>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-control w-auto"
                  placeholderText="Chọn ngày bắt đầu"
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-control w-auto"
                  placeholderText="Chọn ngày kết thúc"
                />
              </div>
              <button
                className="btn btn-primary btn-sm mb-2"
                onClick={() => fetchOrders(1)}
              >
                Lọc theo ngày
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <div className="w-100">
              <div className="overflow-auto mb-4">
                <div className="d-flex gap-2 text-sm text-left text-secondary text-nowrap ms-2" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                  {[
                    { key: "", label: "Tất cả", color: "bg-dark", textColor: "text-white", count: statusCounts.all },
                    { key: "pending", label: "Chờ xác nhận", color: "bg-warning", textColor: "text-dark", count: statusCounts.pending },
                    { key: "confirmed", label: "Đã xác nhận", color: "bg-warning", textColor: "text-dark", count: statusCounts.confirmed },
                    { key: "shipping", label: "Đang giao", color: "bg-info", textColor: "text-dark", count: statusCounts.shipping },
                    { key: "completed", label: "Hoàn thành", color: "bg-success", textColor: "text-white", count: statusCounts.completed },
                    { key: "delivered", label: "Đã giao", color: "bg-success", textColor: "text-white", count: statusCounts.delivered },
                    { key: "cancelled", label: "Đã hủy", color: "bg-danger", textColor: "text-white", count: statusCounts.cancelled },
                  ].map(({ key, label, color, textColor, count }) => {
                    const isActive = activeStatus === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleFilterClick(key)}
                        className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                      >
                        <span>{label}</span>
                        <span className={`badge ${color} ${textColor} rounded-pill ms-1`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <table className="table table-bordered table-hover">
                <thead className="thead-light">
                  <tr>
                    <th className="text-center">#</th>
                    <th className="text-center">Mã đơn</th>
                    <th className="text-center">Tên khách hàng</th>
                    <th className="text-center">Ngày tạo</th>
                    <th className="text-center">Trạng thái</th>
                    <th className="text-center">Tổng tiền</th>
                    <th className="text-center">Thanh toán</th>
                    <th className="text-center">Xem chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td className="text-center align-middle">{index + 1}</td>
                        <td className="text-center align-middle">#{order.order_code}</td>
                        <td className="text-center align-middle">{order.user?.name || "N/A"}</td>
                        <td className="text-center align-middle text-nowrap">
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="text-center align-middle">
                          {order.status === "delivered" ? (
                            <button
                              onClick={() => setConfirmDeliveryOrder(order)}
                              className="btn btn-success btn-sm"
                              type="button"
                            >
                              Xác nhận hoàn thành
                            </button>
                          ) : (
                            translateStatus(order.status)
                          )}
                        </td>
                        <td className="text-center align-middle text-nowrap">
                          {Number(order.total_price).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </td>
                        <td className="text-center align-middle text-nowrap">{order.payment_method}</td>
                        <td className="text-center align-middle">
                          <div className="d-flex justify-content-center gap-2">
                            <div
                              onClick={() => {
                                const isOpeningNew = expandedOrderId !== order.id;
                                if (isOpeningNew) {
                                  fetchOrderDetails(order.id);
                                }
                                setExpandedOrderId(isOpeningNew ? order.id : null);
                              }}
                              className="btn btn-warning btn-sm"
                              type="button"
                            >
                              {expandedOrderId === order.id ? (
                                <FaEyeSlash className="text-danger" />
                              ) : (
                                <FaEye />
                              )}
                            </div>

                            {order.status === "pending" && (
                              <div
                                onClick={() => setSelectedOrder(order)}
                                className="
                                      inline-flex items-center 
                                      px-3 py-1 
                                      text-sm font-medium 
                                      bg-red-600 text-white 
                                      rounded 
                                      hover:bg-red-600 
                                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                                    "
                                type="button"
                              >
                                <FaTrashAlt />
                              </div>
                            )}

                            {/* {(order.status === "cancelled" || order.status === "completed") && (
                              <div
                                onClick={() => handleReorder(order)}
                                className="
                                      inline-flex items-center 
                                      px-3 py-1 
                                      text-sm font-medium 
                                      bg-green-600 text-white 
                                      rounded 
                                      hover:bg-green-600 
                                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                    "
                                type="button"
                              >
                                <FaRedo />
                              </div>

                            )} */}
                          </div>
                        </td>
                      </tr>

                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan="8" className="p-0">
                            <div className="bg-light p-4 border-top">
                              <h3 className="font-weight-bold mb-4 h4">Chi tiết đơn hàng</h3>
                              <div className="card mb-4">
                                <div className="card-body">
                                  <h4 className="h5 font-weight-bold mb-4">Thông tin khách hàng</h4>
                                  <div className="row">
                                    <div className="col-md-6 mb-2">
                                      <span className="font-weight-bold">Mã đơn:</span> {order.order_code || "—"}
                                    </div>
                                    <div className="col-md-6 mb-2">
                                      <span className="font-weight-bold">Họ tên:</span> {order.user?.name || "—"}
                                    </div>
                                    <div className="col-md-6 mb-2">
                                      <span className="font-weight-bold">Số điện thoại:</span> {order.user?.phone || "—"}
                                    </div>
                                    <div className="col-md-6 mb-2">
                                      <span className="font-weight-bold">Email:</span> {order.user?.email || "—"}
                                    </div>
                                    <div className="col-md-6 mb-2">
                                      <span className="font-weight-bold">Địa chỉ:</span> {order.shipping_address || "—"}
                                    </div>
                                    <div className="col-md-6 mb-2">
                                      <span className="font-weight-bold">Phương thức thanh toán:</span> {order.payment_method || "—"}
                                    </div>
                                    <div className="col-12 mb-2">
                                      <span className="font-weight-bold">Ngày đặt hàng:</span>{" "}
                                      {order.created_at
                                        ? new Date(order.created_at).toLocaleDateString()
                                        : "—"}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="card">
                                <div className="card-body">
                                  <h4 className="h5 font-weight-bold mb-3">Sản phẩm</h4>
                                  <table className="table table-bordered text-center">
                                    <thead className="thead-light">
                                      <tr>
                                        <th>Trạng thái</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                        <th>Đánh giá</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(orderDetailsMap[order.id] || []).length > 0 ? (
                                        <>
                                          {orderDetailsMap[order.id].map((item, idx) => (
                                            <tr key={idx}>
                                              <td>{translateStatus(order.status)}</td>
                                              <td>{item.variant?.product?.name || "Không xác định"} ({item.variant?.sku})</td>
                                              <td>{item.quantity}</td>
                                              <td className="text-right">
                                                {Number(item.price).toLocaleString("vi-VN", {
                                                  style: "currency",
                                                  currency: "VND",
                                                })}
                                              </td>
                                              <td className="text-right">
                                                {(item.quantity * item.price).toLocaleString("vi-VN", {
                                                  style: "currency",
                                                  currency: "VND",
                                                })}
                                              </td>
                                              <td>
                                                {["delivered", "completed"].includes(order.status) ? (
                                                  <button
                                                    className="btn btn-link p-0"
                                                    onClick={() => {
                                                      const product = item.variant?.product;
                                                      const productId = product?.id;
                                                      const deliveredAt = new Date(item.updated_at);
                                                      const currentDate = new Date();
                                                      const daysPassed = (currentDate - deliveredAt) / (1000 * 60 * 60 * 24);

                                                      if (daysPassed > 7) {
                                                        toast.error("Thời gian đánh giá đã hết. Vượt quá 7 ngày kể từ khi giao hàng.");
                                                        return;
                                                      }

                                                      const editedOnce = item.comment && Number(item.comment.edited) === 1;

                                                      if (item.comment) {
                                                        if (editedOnce) {
                                                          navigate(`/product/${productId}#comment-${item.comment.id}`);
                                                        } else {
                                                          sessionStorage.setItem("pendingReviewOrderDetailId", item.id);
                                                          navigate(`/product/${productId}#review`);
                                                        }
                                                      } else {
                                                        sessionStorage.setItem("pendingReviewOrderDetailId", item.id);
                                                        navigate(`/product/${productId}#review`);
                                                      }
                                                    }}
                                                  >
                                                    {item.comment ? (
                                                      Number(item.comment.edited) === 1 ? (
                                                        <span>Xem đánh giá</span>
                                                      ) : (
                                                        <span>Chỉnh sửa đánh giá</span>
                                                      )
                                                    ) : (
                                                      <span>Đánh giá</span>
                                                    )}
                                                  </button>
                                                ) : (
                                                  <span className="text-muted font-italic">Chưa thể đánh giá</span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}

                                          {Number(order.shipping_fee) > 0 && (
                                            <tr className="bg-light">
                                              <td colSpan={5} className="text-right font-weight-bold border-top">
                                                Phí vận chuyển:
                                              </td>
                                              <td className="text-right border-top font-weight-bold">
                                                +{Number(order.shipping_fee).toLocaleString("vi-VN", {
                                                  style: "currency",
                                                  currency: "VND",
                                                })}
                                              </td>
                                            </tr>
                                          )}

                                          {Number(order.discount_amount) > 0 && (
                                            <tr className="bg-light">
                                              <td colSpan={5} className="text-right font-weight-bold border-top">
                                                Số tiền giảm giá:
                                              </td>
                                              <td className="text-right border-top text-danger font-weight-bold">
                                                -{Number(order.discount_amount).toLocaleString("vi-VN", {
                                                  style: "currency",
                                                  currency: "VND",
                                                })}
                                              </td>
                                            </tr>
                                          )}

                                          {Number(order.special_discount_amount) > 0 && (
                                            <tr className="bg-light">
                                              <td colSpan={5} className="text-right font-weight-bold border-top">
                                                Giảm giá đặc biệt:
                                              </td>
                                              <td className="text-right border-top text-danger font-weight-bold">
                                                -{Number(order.special_discount_amount).toLocaleString("vi-VN", {
                                                  style: "currency",
                                                  currency: "VND",
                                                })}
                                              </td>
                                            </tr>
                                          )}

                                          <tr className="bg-light font-weight-bold">
                                            <td colSpan={5} className="text-right border-top border-bottom">Tổng tiền:</td>
                                            <td className="text-right border-top border-bottom text-primary">
                                              {Number(order.total_price).toLocaleString("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                              })}
                                            </td>
                                          </tr>
                                        </>
                                      ) : (
                                        <tr>
                                          <td colSpan={6} className="text-center text-muted">
                                            Không có sản phẩm nào trong đơn này.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center mt-3 mb-5">
            <div className="flex items-center flex-wrap gap-1">
              {/* “First” và “Prev” */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90 disabled:bg-gray-300 disabled:opacity-50"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90 disabled:bg-gray-300 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>

              {/* Số trang */}
              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-2 py-0.5 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90"
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
                      onClick={() => setCurrentPage(page)}
                      className={`
                px-3 py-1 border rounded
                ${currentPage === page
                          ? "bg-[#1e40af] text-white"
                          : "bg-[#1e40af] text-white hover:bg-[#1e40af]/90"}
              `}
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
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* “Next” và “Last” */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90 disabled:bg-gray-300 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 border rounded bg-[#1e40af] text-white hover:bg-[#1e40af]/90 disabled:bg-gray-300 disabled:opacity-50"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>

          {selectedOrder && (
            <FormDelete
              isOpen={true}
              onClose={() => setSelectedOrder(null)}
              onConfirm={deleteOrder}
              message={`Bạn có chắc chắn muốn hủy đơn hàng "${selectedOrder.order_code}"?`}
            />
          )}

          {confirmDeliveryOrder && (
            <FormConfirmDelivery
              isOpen={true}
              onClose={() => setConfirmDeliveryOrder(null)}
              onConfirm={handleConfirmDelivery}
              orderCode={confirmDeliveryOrder.order_code}
            />
          )}
        </div>
      </div>
    </div>
  );
}