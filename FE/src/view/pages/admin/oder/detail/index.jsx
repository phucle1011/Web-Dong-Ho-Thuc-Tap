import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";
import HeaderAdmin from "../../layout/header";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState({});
  const [orderDetails, setOrderDetails] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/${id}`);
      if (res.data.data) {
        setOrder(res.data.data);
        const details = Array.isArray(res.data.data.orderDetails)
          ? res.data.data.orderDetails
          : [];
        setOrderDetails(details);
        setUser(res.data.data.user || {});
      } else {
        setOrderDetails([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      toast.error("Không thể lấy chi tiết đơn hàng");
      navigate("/admin/orders");
    }
  };

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

  const totalAmount = Array.isArray(orderDetails)
    ? orderDetails.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0)
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-100 mb-4">
      <HeaderAdmin />
      <div className="flex-1 p-6" style={{ marginLeft: "16rem" }}>
        <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
          <div className="mt-5 mb-2">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Chi tiết đơn hàng</h2>
          </div>
          <div className="bg-white shadow rounded p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h5 m-0">Thông tin khách hàng</h1>
              <button onClick={() => window.print()} className="btn btn-primary">
                In hóa đơn
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Mã đơn</label>
                <input
                  type="text"
                  value={order.order_code || ""}
                  readOnly
                  className="form-control bg-light"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  value={user.name || ""}
                  readOnly
                  className="form-control bg-light"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  value={user.phone || ""}
                  readOnly
                  className="form-control bg-light"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  value={user.email || ""}
                  readOnly
                  className="form-control bg-light"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  value={order.shipping_address || ""}
                  readOnly
                  className="form-control bg-light"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phương thức thanh toán</label>
                <input
                  type="text"
                  value={order.payment_method || ""}
                  readOnly
                  className="form-control bg-light"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Ngày đặt hàng</label>
                <input
                  type="text"
                  value={
                    order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : ""
                  }
                  readOnly
                  className="form-control bg-light"
                />
              </div>
            </div>
          </div>


          <div className="bg-white shadow-md rounded-md p-4">
            <h3 className="font-semibold mb-3">Sản phẩm</h3>
            <table className="w-full border-collapse border text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Trạng thái</th>
                  <th className="border p-2">Tên sản phẩm</th>
                  <th className="border p-2">Số lượng</th>
                  <th className="border p-2">Đơn giá</th>
                  <th className="border p-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.length > 0 ? (
                  orderDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        {translateStatus(order.status)}
                      </td>
                      <td className="border p-2">
                        {item.productVariant?.variantProduct?.name ||
                          "Không có tên sản phẩm"}
                      </td>
                      <td className="border p-2">{item.quantity}</td>
                      <td className="border p-2">
                        {Number(item.price).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                      <td className="border p-2">
                        {(item.quantity * parseFloat(item.price)).toLocaleString(
                          "vi-VN",
                          { style: "currency", currency: "VND" }
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border p-2 text-center">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={4} className="text-end p-2 border">
                    Tổng cộng:
                  </th>
                  <th className="p-2 border">
                    {totalAmount.toLocaleString("vi-VN")} đ
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-4 no-print mb-4">
            <button
              onClick={() => navigate("/admin/orders/getAll")}
              className="btn btn-primary ms-2"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;