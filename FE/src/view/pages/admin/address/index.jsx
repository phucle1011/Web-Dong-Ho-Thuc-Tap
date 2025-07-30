import { useEffect, useState } from "react";
import axios from "axios";
import HeaderAdmin from "../layout/header";
import "./style.css"; // dùng lại style tím (comment-table, modal, ...)
import constant from "../../../../Constants";

const emptyCreateForm = {
  address_line: "",
  district: "",
  city: "",
  province: "",
  is_default: false,
};

const emptyEditForm = {
  id: null,
  user_id: null,
  address_line: "",
  district: "",
  city: "",
  province: "",
  is_default: false,
};

const AddressManage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Create form (không nhập ID thủ công)
  const [createForm, setCreateForm] = useState({ ...emptyCreateForm });
  const [selectedUserId, setSelectedUserId] = useState(""); // dropdown chọn user khi thêm

  // Edit form
  const [editForm, setEditForm] = useState({ ...emptyEditForm });

  // Danh sách user cho dropdown khi Thêm
  const [usersOptions, setUsersOptions] = useState([]);
  const [searchUserText, setSearchUserText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const baseURL = constant.DOMAIN_API;

  // ====== Fetch danh sách địa chỉ (có search theo tên user) ======
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/admin/address/list`, {
        params: search.trim() ? { search: search.trim() } : {},
      });
      setAddresses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách địa chỉ:", err);
      alert(err?.response?.data?.message || "Lỗi lấy danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () => fetchAddresses();
  const onEnterSearch = (e) => {
    if (e.key === "Enter") onSearch();
  };

  // ====== Fetch danh sách user cho modal Thêm (dropdown) ======
  const fetchUsersForCreate = async (keyword = "") => {
    try {
      setLoadingUsers(true);
      const params = { limit: 50 };
      if (keyword && keyword.trim()) params.search = keyword.trim();
      const res = await axios.get(`${baseURL}/admin/users`, { params });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setUsersOptions(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ====== Modal Thêm ======
  const openCreateModal = async () => {
    setCreateForm({ ...emptyCreateForm });
    setSelectedUserId("");
    setOpenCreate(true);
    // load user options mặc định
    await fetchUsersForCreate("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedUserId) {
        alert("Vui lòng chọn người dùng.");
        return;
      }
      const { address_line, district, city, province, is_default } = createForm;
      if (!address_line || !district || !city || !province) {
        alert("Vui lòng nhập đủ: Địa chỉ, Quận/Huyện, Thành phố, Tỉnh/Thành.");
        return;
      }

      setSaving(true);
      await axios.post(`${baseURL}/admin/user/${selectedUserId}/addresses`, {
        address_line,
        city,
        district,
        province,
        is_default: !!is_default,
      });
      setOpenCreate(false);
      await fetchAddresses();
    } catch (err) {
      console.error("Lỗi tạo địa chỉ:", err);
      alert(err?.response?.data?.message || "Lỗi tạo địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  // ====== Modal Sửa ======
  const openEditModal = (addr) => {
    setEditForm({
      id: addr.id,
      user_id: addr.user_id,
      address_line: addr.address_line || "",
      district: addr.district || "",
      city: addr.city || "",
      province: addr.province || "",
      is_default: !!addr.is_default,
    });
    setOpenEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, user_id, address_line, district, city, province, is_default } = editForm;
      if (!id || !user_id) {
        alert("Thiếu thông tin khóa địa chỉ hoặc người dùng.");
        return;
      }
      if (!address_line || !district || !city || !province) {
        alert("Vui lòng nhập đủ: Địa chỉ, Quận/Huyện, Thành phố, Tỉnh/Thành.");
        return;
      }
      setSaving(true);
      await axios.put(`${baseURL}/admin/user/${user_id}/addresses/${id}`, {
        address_line,
        city,
        district,
        province,
        is_default: !!is_default,
      });
      setOpenEdit(false);
      await fetchAddresses();
    } catch (err) {
      console.error("Lỗi cập nhật địa chỉ:", err);
      alert(err?.response?.data?.message || "Lỗi cập nhật địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  // ====== Xóa ======
  const handleDelete = async (addr) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await axios.delete(`${baseURL}/admin/user/${addr.user_id}/addresses/${addr.id}`);
      await fetchAddresses();
    } catch (err) {
      console.error("Lỗi xóa địa chỉ:", err);
      alert(err?.response?.data?.message || "Lỗi xóa địa chỉ");
    }
  };

  const formatDate = (dt) => {
    try {
      return dt ? new Date(dt).toLocaleString("vi-VN") : "";
    } catch {
      return dt || "";
    }
  };

  return (
    <>
      <HeaderAdmin />
      <div className="comment-container">
        <div className="comment-wrapper">
          <div className="comment-box">
            <h2 className="comment-title">DANH SÁCH ĐỊA CHỈ</h2>

            {/* Hàng công cụ (tìm kiếm + thêm) */}
            <div className="filter-row">
              <input
                className="filter-input"
                type="text"
                placeholder="Tìm theo tên người dùng…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onEnterSearch}
              />
              <button className="sort-btn" onClick={onSearch}>Tìm kiếm</button>
              <button className="reset-btn" onClick={() => { setSearch(""); fetchAddresses(); }}>
                Đặt lại
              </button>
              <button className="add-btn" onClick={openCreateModal}>
                + Thêm địa chỉ
              </button>
            </div>

            {/* Bảng */}
            <div className="table-responsive">
              <table className="comment-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Địa chỉ</th>
                    <th>Quận/Huyện</th>
                    <th>Tỉnh/Thành</th>
                    <th>Thành phố</th>
                    <th>Mặc định</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9}>Đang tải…</td>
                    </tr>
                  )}
                  {!loading && addresses.length === 0 && (
                    <tr>
                      <td colSpan={9}>Không có dữ liệu</td>
                    </tr>
                  )}
                  {!loading &&
                    addresses.map((addr) => (
                      <tr key={addr.id}>
                        <td>{addr.id}</td>
                        <td>
                          {addr.user?.name || `User #${addr.user_id}`}<br />
                          <small>{addr.user?.email || ""}</small>
                        </td>
                        <td>{addr.address_line}</td>
                        <td>{addr.district}</td>
                        <td>{addr.province}</td>
                        <td>{addr.city}</td>
                        <td>{addr.is_default ? "✔" : ""}</td>
                        <td>{formatDate(addr.created_at)}</td>
                        <td>
                          <button className="edit-btn" onClick={() => openEditModal(addr)}>
                            Sửa
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(addr)}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Thêm (KHÔNG nhập ID, chọn user bằng dropdown) */}
            {openCreate && (
              <div className="modal-overlay" onClick={() => setOpenCreate(false)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <h3 className="modal-title">Thêm địa chỉ</h3>
                  <form className="modal-form" onSubmit={handleCreateSubmit}>
                    {/* Chọn người dùng */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        className="filter-input"
                        placeholder="Tìm người dùng theo tên/email…"
                        value={searchUserText}
                        onChange={(e) => setSearchUserText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchUsersForCreate(searchUserText);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="sort-btn"
                        onClick={() => fetchUsersForCreate(searchUserText)}
                        disabled={loadingUsers}
                      >
                        {loadingUsers ? "Đang tìm…" : "Tìm user"}
                      </button>
                    </div>

                    <select
                      className="filter-select"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                      title="Chọn người dùng"
                    >
                      <option value="">-- Chọn người dùng --</option>
                      {usersOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Địa chỉ (số nhà, đường...)"
                      value={createForm.address_line}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, address_line: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Quận/Huyện"
                      value={createForm.district}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, district: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Tỉnh/Thành"
                      value={createForm.province}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, province: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Thành phố"
                      value={createForm.city}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, city: e.target.value })
                      }
                      required
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={!!createForm.is_default}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, is_default: e.target.checked })
                        }
                      />
                      {" "}Đặt làm địa chỉ mặc định
                    </label>
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
                  </form>
                </div>
              </div>
            )}

            {/* Modal Sửa (không cho đổi user, chỉ hiển thị) */}
            {openEdit && (
              <div className="modal-overlay" onClick={() => setOpenEdit(false)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <h3 className="modal-title">Cập nhật địa chỉ</h3>
                  <form className="modal-form" onSubmit={handleEditSubmit}>
                    <input
                      type="text"
                      value={
                        editForm.user_id
                          ? `Người dùng #${editForm.user_id}`
                          : "Không rõ người dùng"
                      }
                      disabled
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ (số nhà, đường...)"
                      value={editForm.address_line}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address_line: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Quận/Huyện"
                      value={editForm.district}
                      onChange={(e) =>
                        setEditForm({ ...editForm, district: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Tỉnh/Thành"
                      value={editForm.province}
                      onChange={(e) =>
                        setEditForm({ ...editForm, province: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Thành phố"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      required
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={!!editForm.is_default}
                        onChange={(e) =>
                          setEditForm({ ...editForm, is_default: e.target.checked })
                        }
                      />
                      {" "}Đặt làm địa chỉ mặc định
                    </label>
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
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AddressManage;
