import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HeaderAdmin from "../layout/header";
import constant from "../../../../Constants";
import { FaEdit, FaTrashAlt, FaChevronRight, FaAngleDoubleRight } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserManage.css";

const DEFAULT_LIMIT = 10;
const initialFilter = {
  search: "",
  role: "",
  status: "",
  page: 1,
  limit: DEFAULT_LIMIT,
  sortBy: "created_at",
  sortOrder: "DESC",
};

const ROLE_LABEL = {
  user: "Người dùng",
  admin: "Quản trị",
};

const STATUS_LABEL = {
  active: "Đang hoạt động",
  inactive: "Ngưng hoạt động",
  pending: "Chờ duyệt",
  locked: "Bị khóa",
};

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: DEFAULT_LIMIT, totalPages: 0 });
  const [filter, setFilter] = useState(initialFilter);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", status: "active" });

  const baseURL = constant.DOMAIN_API;

  const params = useMemo(() => {
    const p = {
      page: filter.page,
      limit: filter.limit,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
    };
    if (filter.search.trim()) p.search = filter.search.trim();
    if (filter.role) p.role = filter.role;
    if (filter.status) p.status = filter.status;
    return p;
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/admin/users`, { params });
      const { data, pagination } = res.data || {};
      setUsers(Array.isArray(data) ? data : []);
      setPagination(pagination || { total: 0, page: 1, totalPages: 0 });
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi khi lấy danh sách người dùng.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa người dùng này?");
    if (!ok) return;
    try {
      await axios.delete(`${baseURL}/admin/users/${id}`);
      toast.success(" Xóa người dùng thành công.");
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || " Lỗi khi xóa người dùng.");
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      status: user.status,
    });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${baseURL}/admin/users/${editingUser.id}`, editForm);
      toast.success(" Cập nhật người dùng thành công.");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(" Lỗi khi cập nhật người dùng.");
    }
  };

  const formatDateTime = (dt) => dt ? new Date(dt).toLocaleString("vi-VN") : "";

  const handleSearchChange = (e) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleSearchSubmit = () => {
    if (filter.search.trim() === '') {
      toast.warning("Vui lòng nhập mã đơn hàng hoặc tên người dùng cần tìm.");
      return;
    }
    setFilter({ ...filter, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page !== filter.page) setFilter({ ...filter, page });
  };

  return (
    <>
      <HeaderAdmin />
      <div style={{ marginLeft: "14rem" }} className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto bg-white shadow rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 mt-3">Danh sách người dùng</h2>
          </div>

          <div className="search-container mb-4 flex gap-2">
            <input
              type="text"
              value={filter.search}
              onChange={handleSearchChange}
              placeholder="Vui lòng nhập mã đơn hàng hoặc tên khách hàng..."
              className="search-input flex-grow border px-4 py-2 rounded"
            />
            <button onClick={handleSearchSubmit} className="search-button bg-blue-800 text-white px-4 py-2 rounded">
              Tìm kiếm
            </button>
          </div>

          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ảnh</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Quyền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">Đang tải dữ liệu...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">Không có dữ liệu.</td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                      <td>
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || "-"}</td>
                      <td>{ROLE_LABEL[u.role] || "-"}</td>
                      <td>
                        <span className={`status-label status-${u.status}`}>
                          {STATUS_LABEL[u.status] || u.status}
                        </span>
                      </td>
                      <td>{formatDateTime(u.created_at)}</td>
                      <td>
                        <div className="flex justify-center items-center gap-2">
                          <button
                            className="w-9 h-9 bg-yellow-500 text-white flex items-center justify-center rounded"
                            onClick={() => handleEditClick(u)}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            className="w-9 h-9 bg-red-600 text-white flex items-center justify-center rounded"
                            onClick={() => handleDelete(u.id)}
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
          </div>

          <div className="flex justify-center items-center gap-2 py-4">
            {pagination.page > 1 && (
              <button onClick={() => handlePageChange(pagination.page - 1)} className="px-3 py-1 border rounded bg-[#1e40af] text-white">
                <FaChevronRight className="rotate-180" />
              </button>
            )}
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              if (page >= pagination.page - 1 && page <= pagination.page + 1) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded ${pagination.page === page
                      ? "bg-[#1e40af] text-white"
                      : "bg-[#1e40af] text-white hover:bg-[#1e40af]/90"}`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}
            {pagination.page < pagination.totalPages && (
              <button onClick={() => handlePageChange(pagination.page + 1)} className="px-3 py-1 border rounded bg-[#1e40af] text-white">
                <FaChevronRight />
              </button>
            )}
            {pagination.page < pagination.totalPages && (
              <button onClick={() => handlePageChange(pagination.totalPages)} className="px-3 py-1 border rounded bg-[#1e40af] text-white">
                <FaAngleDoubleRight />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa người dùng</h3>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Họ tên"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                type="email"
                className="w-full p-2 border rounded"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="SĐT"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="locked">Bị khóa</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManage;
