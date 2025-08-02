// File: AddressManagedetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../../Constants";
import HeaderAdmin from "../../layout/header";

const AddressManagedetail = () => {
  const { id } = useParams(); // đây là user_id
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseURL = Constants.DOMAIN_API;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/admin/address/user/${id}`);
      setUser(res.data.user || null);
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Lỗi khi lấy địa chỉ người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dt) => (dt ? new Date(dt).toLocaleString("vi-VN") : "");

  return (
    <>
      <HeaderAdmin />
      <div className="min-h-screen bg-gray-100 p-4" style={{ marginLeft: "14rem" }}>
        <div className="bg-white p-6 rounded shadow">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 bg-gray-400 text-white px-4 py-2 rounded"
          >
            ← Quay lại
          </button>

          <h2 className="text-2xl font-bold mb-4">Chi tiết địa chỉ theo người dùng</h2>

          {loading ? (
            <p>Đang tải...</p>
          ) : user ? (
            <div className="mb-6">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Họ tên:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Trạng thái:</strong> {user.status}</p>
            </div>
          ) : (
            <p className="text-red-600">Không tìm thấy người dùng.</p>
          )}

          <h3 className="text-xl font-semibold mb-2">Danh sách địa chỉ</h3>

          <div className="overflow-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Địa chỉ</th>
                  <th className="border p-2">Quận/Huyện</th>
                  <th className="border p-2">Tỉnh/Thành</th>
                  <th className="border p-2">Mặc định</th>
                  <th className="border p-2">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {addresses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-2">Không có địa chỉ</td>
                  </tr>
                ) : (
                  addresses.map((addr) => (
                    <tr key={addr.id} className="hover:bg-gray-50">
                      <td className="border p-2">{addr.id}</td>
                      <td className="border p-2">{addr.address_line}</td>
                      <td className="border p-2">{addr.district}</td>
                      <td className="border p-2">{addr.city}</td>
                      <td className="border p-2 text-center">{addr.is_default ? "✔" : ""}</td>
                      <td className="border p-2">{formatDate(addr.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressManagedetail;
