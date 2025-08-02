import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../../Constants.jsx";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import HeaderAdmin from "../../layout/header";

const AddProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
    const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Gọi API lấy danh sách danh mục và thương hiệu
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get(`${Constants.DOMAIN_API}/category/list`),
      ]);

      // Chỉ lấy các category và brand có status = 1
      const activeCategories = (catRes.data.data || []).filter(cat => cat.status === "active");

      setCategories(activeCategories);
    } catch (err) {
      console.error("Lỗi khi load category/brand:", err);
    }
  };

  fetchData();
}, []);


  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage("");

    try {
      let thumbnailUrl = "";

      if (thumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(thumbnailFile);
      }

      const productData = {
        ...formData,
        thumbnail: thumbnailUrl.url,
      };

      await axios.post(`${Constants.DOMAIN_API}/admin/products`, productData);

      toast.success("Thêm sản phẩm thành công!");
      navigate("/admin/products/getAll");

      reset();
      setThumbnailFile(null);
    } catch (error) {
      console.error(error);
      toast.error(
        "❌ Lỗi: " + (error.response?.data?.error || "Không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="container bg-white p-4 p-md-5 rounded shadow mt-2 mb-2">
  <h2 className="h5 mb-4 fw-semibold">Thêm sản phẩm mới</h2>

  {message && <p className="mb-3 text-primary small">{message}</p>}

  <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="row g-4">
      {/* Tên sản phẩm */}
      <div className="col-md-6">
        <label className="form-label small fw-medium">Tên sản phẩm *</label>
        <input
          type="text"
          className="form-control form-control-sm"
          {...register("name", {
            required: "Tên sản phẩm không được để trống",
            minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
          })}
        />
        {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
      </div>

      {/* Slug */}
      <div className="col-md-6">
        <label className="form-label small fw-medium">Slug *</label>
        <input
          type="text"
          className="form-control form-control-sm"
          {...register("slug", { required: "Slug không được để trống" })}
        />
        {errors.slug && <div className="text-danger small mt-1">{errors.slug.message}</div>}
      </div>

      {/* Mô tả */}
      <div className="col-12">
        <label className="form-label small fw-medium">Mô tả *</label>
        <textarea
          rows={4}
          className="form-control form-control-sm"
          {...register("description", { required: "Mô tả không được để trống" })}
        ></textarea>
        {errors.description && <div className="text-danger small mt-1">{errors.description.message}</div>}
      </div>

      
      

      {/* Danh mục */}
      <div className="col-md-6">
        <label className="form-label small fw-medium">Danh mục *</label>
        <select
          className="form-select form-select-sm"
          {...register("category_id", { required: "Vui lòng chọn danh mục" })}
        >
          <option value="">-- Chọn danh mục --</option>
          {Array.isArray(categories) &&
            categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
        {errors.category_id && <div className="text-danger small mt-1">{errors.category_id.message}</div>}
      </div>

      {/* Ảnh sản phẩm */}
      <div className="col-md-6">
        <label className="form-label small fw-medium">Ảnh sản phẩm *</label>
        <input
          type="file"
          accept="image/*"
          className="form-control form-control-sm"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
        />
      </div>

      {/* Trạng thái */}
      <div className="col-md-6">
        <label className="form-label small fw-medium">Trạng thái *</label>
        <select
          className="form-select form-select-sm"
          {...register("status", { required: "Trạng thái là bắt buộc" })}
        >
          <option value="1">Hiển thị</option>
          <option value="0">Ẩn</option>
        </select>
        {errors.status && <div className="text-danger small mt-1">{errors.status.message}</div>}
      </div>
    </div>

    {/* Nút submit */}
    <div className="mt-4 d-flex gap-2">
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-sm"
      >
        {loading ? "Đang thêm..." : "Thêm sản phẩm"}
      </button>
      <Link to="/admin/products/getAll" className="btn btn-secondary btn-sm">
        Quay lại
      </Link>
    </div>
  </form>
</div>



  );
};

export default AddProduct;
