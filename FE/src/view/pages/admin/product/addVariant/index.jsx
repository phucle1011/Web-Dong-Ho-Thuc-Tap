import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import HeaderAdmin from "../../layout/header";

function AddVariantForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [attributes, setAttributes] = useState([
    { attribute_id: "", value: "" },
  ]);
  const [images, setImages] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/product-attributes")
      .then((res) => setAllAttributes(res.data.data || []))
      .catch((err) => console.error("Lỗi lấy thuộc tính:", err));
  }, []);

  const addAttributeRow = () => {
    setAttributes([...attributes, { attribute_id: "", value: "" }]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!sku.trim()) newErrors.sku = "Vui lòng nhập mã SKU.";
    if (!price || parseFloat(price) <= 0)
      newErrors.price = "Giá phải lớn hơn 0.";
    if (!stock || parseInt(stock) < 0)
      newErrors.stock = "Tồn kho không hợp lệ.";

    attributes.forEach((attr, i) => {
      if (!attr.attribute_id) newErrors[`attr_${i}_id`] = "Chọn thuộc tính.";
      if (!attr.value.trim()) newErrors[`attr_${i}_value`] = "Nhập giá trị.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
const imageUrls = images.map(img => img.url);
const data = { sku, price, stock, attributes, images: imageUrls };

      await axios.post(
        `http://localhost:5000/admin/products/${productId}/variants`,
        data
      );
      toast.success("Tạo biến thể thành công!");
      navigate("/admin/products/getAll");
    } catch (err) {
      console.error("Lỗi tạo biến thể:", err);
      toast.error(err.response?.data?.error || "Đã có lỗi xảy ra");
    }
  };
  const removeAttributeRow = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };
  const deleteCloudImage = async (public_id) => {
  try {
    await axios.post("http://localhost:5000/admin/products/imagesClauding/", { public_id });
  } catch (err) {
    console.error("Lỗi xóa ảnh Cloudinary:", err);
  }
};
const handleCancel = async () => {
  // Xóa từng ảnh đã upload lên Cloudinary
  for (const img of images) {
    await deleteCloudImage(img.public_id);
  }

  // navigate("/admin/products/getAll");
};


  return (
            <div style={{ marginLeft: "14rem" }} className="min-h-screen bg-gray-100 p-4">
  <h2 className="h4 fw-bold mb-4">Thêm biến thể sản phẩm</h2>

  <form onSubmit={handleSubmit}>
    {/* SKU */}
    <div className="mb-3">
      <label className="form-label">Mã SKU *</label>
      <input
        type="text"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="form-control"
      />
      {errors.sku && <div className="text-danger small mt-1">{errors.sku}</div>}
    </div>

    {/* Giá */}
    <div className="mb-3">
      <label className="form-label">Giá *</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="form-control"
      />
      {errors.price && <div className="text-danger small mt-1">{errors.price}</div>}
    </div>

    {/* Tồn kho */}
    <div className="mb-3">
      <label className="form-label">Số lượng tồn kho *</label>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="form-control"
      />
      {errors.stock && <div className="text-danger small mt-1">{errors.stock}</div>}
    </div>

    {/* Thuộc tính biến thể */}
    <div className="mb-4">
      <label className="form-label fw-semibold">Thuộc tính biến thể *</label>
      {attributes.map((attr, index) => {
        const selectedAttr = allAttributes.find(
          (a) => a.id.toString() === attr.attribute_id.toString()
        );
        const isColor = selectedAttr?.name?.toLowerCase() === "color";

        return (
          <div className="row g-2 align-items-center mb-2" key={index}>
            {/* Tên thuộc tính */}
            <div className="col-md-5">
              {selectedAttr ? (
                <input
                  type="text"
                  value={selectedAttr.name}
                  disabled
                  className="form-control bg-light text-muted"
                />
              ) : (
                <select
                  value={attr.attribute_id}
                  onChange={(e) =>
                    handleAttributeChange(index, "attribute_id", e.target.value)
                  }
                  className="form-select"
                >
                  <option value="">-- Chọn thuộc tính --</option>
                  {allAttributes
                    .filter((opt) => {
                      return !attributes.some(
                        (a, i) =>
                          a.attribute_id === opt.id.toString() && i !== index
                      );
                    })
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                </select>
              )}
              {errors[`attr_${index}_id`] && (
                <div className="text-danger small mt-1">
                  {errors[`attr_${index}_id`]}
                </div>
              )}
            </div>

            {/* Giá trị thuộc tính */}
            <div className="col-md-5">
              <input
                type={isColor ? "color" : "text"}
                placeholder={isColor ? "" : "Giá trị"}
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(index, "value", e.target.value)
                }
                className={`form-control ${isColor ? "form-control-color" : ""}`}
              />
              {errors[`attr_${index}_value`] && (
                <div className="text-danger small mt-1">
                  {errors[`attr_${index}_value`]}
                </div>
              )}
            </div>

            {/* Xóa thuộc tính */}
            <div className="col-md-2 text-end">
              {attributes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttributeRow(index)}
                  className="btn btn-outline-danger btn-sm"
                  title="Xóa"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addAttributeRow}
        className="btn btn-link p-0 text-primary"
      >
        + Thêm thuộc tính
      </button>
    </div>

    {/* Ảnh biến thể */}
    <div className="mb-4">
      <label className="form-label">Ảnh biến thể</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={async (e) => {
          const files = Array.from(e.target.files);
          setUploading(true);
          const uploadedImages = [];

          for (const file of files) {
            try {
              const { url, public_id } = await uploadToCloudinary(file);
              uploadedImages.push({ url, public_id });
            } catch (error) {
              console.error("Lỗi upload ảnh:", error);
            }
          }

          setImages((prev) => [...prev, ...uploadedImages]);
          setUploading(false);
        }}
        className="form-control"
      />

      {/* Hiển thị ảnh */}
      <div className="row mt-3">
        {images.map((img, index) => (
          <div className="col-auto position-relative me-2 mb-2" key={index}>
            <img
              src={img}
              alt={`variant-${index}`}
              className="img-thumbnail"
              style={{ width: "90px", height: "90px", objectFit: "cover" }}
            />
            <button
              type="button"
              onClick={() => {
                const updated = [...images];
                updated.splice(index, 1);
                setImages(updated);
              }}
              className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
              style={{ padding: "2px 6px" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Submit & Cancel */}
    <div className="d-flex gap-2 mt-4">
      <button
        type="submit"
        disabled={uploading}
        className={`btn btn-primary px-4 ${uploading ? "disabled opacity-50" : ""}`}
      >
        Tạo biến thể
      </button>

      <button
        type="button"
        onClick={handleCancel}
        className="btn btn-secondary"
      >
        Quay lại
      </button>
    </div>
  </form>
</div>

  );
}

export default AddVariantForm;
