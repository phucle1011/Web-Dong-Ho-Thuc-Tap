import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HeaderAdmin from "../layout/header";
import "./style.css"; // Giữ đúng tên file CSS bạn đang dùng
import constant from "../../../../Constants";

const DEFAULT_LIMIT = 10;

// Bộ lọc mặc định
const initialFilter = {
  search: "",
  role: "",
  status: "",
  page: 1,
  limit: DEFAULT_LIMIT,
  sortBy: "created_at",
  sortOrder: "DESC",
};

// Mẫu form rỗng
const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  avatar: "",
  role: "user",
  status: "active",
};

// Bản đồ hiển thị tiếng Việt cho role/status (giữ nguyên value để gửi lên BE)
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
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  });
  const [filter, setFilter] = useState(initialFilter);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Trạng thái modal
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [createForm, setCreateForm] = useState({ ...emptyUserForm });
  const [editForm, setEditForm] = useState({ ...emptyUserForm, id: null });
  const [saving, setSaving] = useState(false);

  const baseURL = constant.DOMAIN_API;

  // Tạo params gọi API từ bộ lọc
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

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${baseURL}/admin/users`, { params });
      const { data, pagination } = res.data || {};
      setUsers(Array.isArray(data) ? data : []);
      if (pagination) {
        setPagination({
          total: pagination.total || 0,
          page: pagination.page || 1,
          limit: pagination.limit || DEFAULT_LIMIT,
          totalPages: pagination.totalPages || 0,
        });
      } else {
        // Fallback nếu BE chưa trả pagination
        setPagination((prev) => ({
          ...prev,
          page: params.page || 1,
          limit: params.limit || DEFAULT_LIMIT,
        }));
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      setErrorMsg(
        err?.response?.data?.message || "Đã xảy ra lỗi khi lấy danh sách người dùng."
      );
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi params thay đổi
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.role,
    params.status,
    params.search,
  ]);

  // ===== Xử lý bộ lọc / sắp xếp / phân trang =====
  const handleSearchChange = (e) => {
    setFilter((f) => ({ ...f, search: e.target.value, page: 1 }));
  };

  const handleRoleChange = (e) => {
    setFilter((f) => ({ ...f, role: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e) => {
    setFilter((f) => ({ ...f, status: e.target.value, page: 1 }));
  };

  const handleSortByChange = (e) => {
    setFilter((f) => ({ ...f, sortBy: e.target.value, page: 1 }));
  };

  const handleSortOrderToggle = () => {
    setFilter((f) => ({
      ...f,
      sortOrder: f.sortOrder === "ASC" ? "DESC" : "ASC",
      page: 1,
    }));
  };

  const goToPage = (newPage) => {
    if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages)) return;
    setFilter((f) => ({ ...f, page: newPage }));
  };

  const resetFilter = () => setFilter(initialFilter);

  // ===== Xử lý Tạo / Sửa / Xóa =====
  const openCreateModal = () => {
    setCreateForm({ ...emptyUserForm });
    setOpenCreate(true);
  };

  const openEditModal = async (id) => {
    try {
      setSaving(true);
      const res = await axios.get(`${baseURL}/admin/users/${id}`);
      const user = res.data;
      setEditForm({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        password: "", // Để trống, nếu nhập sẽ đổi mật khẩu
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role || "user",
        status: user.status || "active",
      });
      setOpenEdit(true);
    } catch (err) {
      console.error("Lỗi lấy chi tiết người dùng:", err);
      alert(err?.response?.data?.message || "Không lấy được chi tiết người dùng.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...createForm };
      if (!payload.name || !payload.email || !payload.password) {
        alert("Vui lòng nhập đủ Họ tên / Email / Mật khẩu!");
        return;
      }
      await axios.post(`${baseURL}/admin/users`, payload);
      setOpenCreate(false);
      await fetchUsers();
    } catch (err) {
      console.error("Lỗi tạo người dùng:", err);
      alert(err?.response?.data?.message || "Đã xảy ra lỗi khi tạo người dùng.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { id, ...data } = editForm;
      // Nếu mật khẩu để trống => không gửi field password
      if (!data.password) delete data.password;
      await axios.put(`${baseURL}/admin/users/${id}`, data);
      setOpenEdit(false);
      await fetchUsers();
    } catch (err) {
      console.error("Lỗi cập nhật người dùng:", err);
      alert(err?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật người dùng.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa người dùng này?");
    if (!ok) return;
    try {
      await axios.delete(`${baseURL}/admin/users/${id}`);
      // Nếu trang hiện tại chỉ còn 1 bản ghi sau khi xóa -> lùi về trang trước cho mượt
      if (users.length === 1 && filter.page > 1) {
        setFilter((f) => ({ ...f, page: f.page - 1 }));
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Lỗi xóa người dùng:", err);
      alert(err?.response?.data?.message || "Đã xảy ra lỗi khi xóa người dùng.");
    }
  };

  // Định dạng thời gian hiển thị theo vi-VN
  const formatDateTime = (dt) => {
    if (!dt) return "";
    try {
      return new Date(dt).toLocaleString("vi-VN");
    } catch {
      return dt;
    }
  };

  return (
    <>
      <HeaderAdmin />
      <div className="comment-container">{/* Tái sử dụng layout giống trang Comment */ }
        <div className="comment-wrapper">
          <div className="comment-box">
            <h2 className="comment-title">DANH SÁCH NGƯỜI DÙNG</h2>

            {/* Hàng bộ lọc */}
            <div className="filter-row">
              <input
                className="filter-input"
                type="text"
                placeholder="Tìm theo họ tên, email, số điện thoại…"
                value={filter.search}
                onChange={handleSearchChange}
              />

              <select
                className="filter-select"
                value={filter.role}
                onChange={handleRoleChange}
                title="Quyền hạn"
              >
                <option value="">-- Quyền hạn --</option>
                <option value="user">{ROLE_LABEL.user}</option>
                <option value="admin">{ROLE_LABEL.admin}</option>
              </select>

              <select
                className="filter-select"
                value={filter.status}
                onChange={handleStatusChange}
                title="Trạng thái"
              >
                <option value="">-- Trạng thái --</option>
                <option value="active">{STATUS_LABEL.active}</option>
                <option value="inactive">{STATUS_LABEL.inactive}</option>
                <option value="pending">{STATUS_LABEL.pending}</option>
                <option value="locked">{STATUS_LABEL.locked}</option>
              </select>

              <select
                className="filter-select"
                value={filter.sortBy}
                onChange={handleSortByChange}
                title="Sắp xếp theo"
              >
                <option value="created_at">Sắp xếp: Ngày tạo</option>
                <option value="name">Sắp xếp: Họ tên</option>
                <option value="email">Sắp xếp: Email</option>
                <option value="role">Sắp xếp: Quyền hạn</option>
                <option value="status">Sắp xếp: Trạng thái</option>
              </select>

              <button className="sort-btn" onClick={handleSortOrderToggle} title="Đổi thứ tự sắp xếp">
                {filter.sortOrder === "ASC" ? "Tăng dần ▲" : "Giảm dần ▼"}
              </button>

              <button className="add-btn" onClick={openCreateModal}>
                + Thêm người dùng
              </button>
              <button className="reset-btn" onClick={resetFilter}>
                Đặt lại
              </button>
            </div>

            {/* Bảng danh sách */}
            <div className="table-responsive">
              <table className="comment-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ảnh đại diện</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Quyền hạn</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={9}>Không có dữ liệu.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={9}>Đang tải…</td>
                    </tr>
                  )}
                  {!loading &&
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>
                          <img
                            src={
                              u.avatar ||
                              "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(u.name || "User")
                            }
                            alt={u.name}
                            className="avatar-img"
                          />
                        </td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || "-"}</td>
                        <td>{ROLE_LABEL[u.role] || u.role}</td>
                        <td className={`status-badge status-${u.status}`}>
                          {STATUS_LABEL[u.status] || u.status}
                        </td>
                        <td>{formatDateTime(u.created_at)}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(u.id)}
                          >
                            Sửa
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(u.id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="pagination-row">
              <button
                className="page-btn"
                disabled={filter.page <= 1}
                onClick={() => goToPage(filter.page - 1)}
              >
                « Trước
              </button>
              <span className="page-info">
                Trang {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                className="page-btn"
                disabled={
                  pagination.totalPages
                    ? filter.page >= pagination.totalPages
                    : users.length < filter.limit
                }
                onClick={() => goToPage(filter.page + 1)}
              >
                Sau »
              </button>

              <select
                className="filter-select"
                value={filter.limit}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
                title="Số dòng mỗi trang"
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm */}
      {openCreate && (
        <div className="modal-overlay" onClick={() => setOpenCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Thêm người dùng</h3>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, password: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, phone: e.target.value }))
                    }
                    placeholder="VD: 0912345678"
                  />
                </div>
                <div className="form-field">
                  <label>Ảnh đại diện (URL)</label>
                  <input
                    type="text"
                    value={createForm.avatar}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, avatar: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="form-field">
                  <label>Quyền hạn</label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, role: e.target.value }))
                    }
                  >
                    <option value="user">{ROLE_LABEL.user}</option>
                    <option value="admin">{ROLE_LABEL.admin}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Trạng thái</label>
                  <select
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, status: e.target.value }))
                    }
                  >
                    <option value="active">{STATUS_LABEL.active}</option>
                    <option value="inactive">{STATUS_LABEL.inactive}</option>
                    <option value="pending">{STATUS_LABEL.pending}</option>
                    <option value="locked">{STATUS_LABEL.locked}</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setOpenCreate(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
              {!!errorMsg && <p className="error-text">{errorMsg}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {openEdit && (
        <div className="modal-overlay" onClick={() => setOpenEdit(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Cập nhật người dùng</h3>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Mật khẩu (để trống nếu không đổi)</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-field">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, phone: e.target.value }))
                    }
                    placeholder="VD: 0912345678"
                  />
                </div>
                <div className="form-field">
                  <label>Ảnh đại diện (URL)</label>
                  <input
                    type="text"
                    value={editForm.avatar}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, avatar: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="form-field">
                  <label>Quyền hạn</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, role: e.target.value }))
                    }
                  >
                    <option value="user">{ROLE_LABEL.user}</option>
                    <option value="admin">{ROLE_LABEL.admin}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, status: e.target.value }))
                    }
                  >
                    <option value="active">{STATUS_LABEL.active}</option>
                    <option value="inactive">{STATUS_LABEL.inactive}</option>
                    <option value="pending">{STATUS_LABEL.pending}</option>
                    <option value="locked">{STATUS_LABEL.locked}</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setOpenEdit(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Đang lưu…" : "Cập nhật"}
                </button>
              </div>
              {!!errorMsg && <p className="error-text">{errorMsg}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManage;
