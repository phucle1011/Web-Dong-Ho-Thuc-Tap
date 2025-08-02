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
      <div className="flex-1 p-6" style={{ marginLeft: "14rem" }}>
        <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
          <div className="bg-white rounded p-4 mb-4">
            <h2 className="text-2xl font-bold text-red-500 mt-5">Chi tiết đơn hàng</h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h5 m-0 fw-bold">Thông tin khách hàng</h1>
              {/* <button onClick={() => window.print()} className="btn btn-primary">
                In hóa đơn
              </button> */}
            </div>

            <div className="row gy-2 text-sm">
              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Mã đơn:</label>
                <div>{order.order_code || "—"}</div>
              </div>

              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Họ tên:</label>
                <div>{user.name || "—"}</div>
              </div>

              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Số điện thoại:</label>
                <div>{user.phone || "—"}</div>
              </div>

              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Email:</label>
                <div>{user.email || "—"}</div>
              </div>

              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Địa chỉ:</label>
                <div>{order.shipping_address || "—"}</div>
              </div>

              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Phương thức thanh toán:</label>
                <div>{order.payment_method || "—"}</div>
              </div>

              <div className="col-md-6 d-flex gap-2">
                <label className="fw-bold m-0">Ngày đặt hàng:</label>
                <div>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
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
            <div className="mt-3 flex justify-end gap-4 no-printms-3">
              <button
                onClick={() => navigate("/admin/orders/getAll")}
                className="btn btn-primary"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;