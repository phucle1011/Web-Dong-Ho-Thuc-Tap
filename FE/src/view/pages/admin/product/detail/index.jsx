import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FormDelete from "../../../../components/formDelete";
import { toast } from "react-toastify";
import Constants from "../../../../../Constants.jsx";
import { Modal, Carousel } from "react-bootstrap";
import HeaderAdmin from "../../layout/header";

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setStartIndex(index);
    setShowModal(true);
  };

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/admin/products/${id}`);
      setProduct(res.data.data);
      setFormData(res.data.data);
      console.log("setProduct", res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "discount_price"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`http://localhost:5000/admin/products/${id}`, formData);
      toast.success("Cập nhật sản phẩm thành công!");
      fetchProduct(); // Cập nhật lại dữ liệu
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    } finally {
      setSaving(false);
    }
  };
  const deleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axios.delete(
        `${Constants.DOMAIN_API}/admin/variants/${selectedProduct.id}`
      );
      toast.success("Xóa sản phẩm thành công");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      if (
        error.response?.data?.error?.includes("foreign key constraint fails")
      ) {
        toast.error("Không thể xóa vì có sản phẩm đang sử dụng sản phẩm này.");
      } else {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSelectedProduct(null);
    }
  };
  if (!formData) return <div>Đang tải...</div>;

  return (
   <div className="container mt-4">
  <div className="bg-white shadow-sm rounded p-4 border">
    <h2 className="h4 fw-semibold mb-4">Chỉnh sửa sản phẩm</h2>

    <div className="row mb-4">
      <div className="col-md-3">
        <img
          src={formData.thumbnail || "https://via.placeholder.com/150"}
          alt={formData.name}
          className="img-fluid rounded border"
        />
      </div>
      <div className="col-md-9">
        <div className="mb-3">
          <label className="form-label fw-semibold">Tên sản phẩm:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Mô tả:</label>
          <textarea
            name="description"
            className="form-control"
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Trạng thái:</label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value={1}>Hiển thị</option>
            <option value={0}>Ẩn</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Danh mục:</label>
          <input
            type="text"
            className="form-control"
            value={formData.category?.name || "Không có"}
            readOnly
          />
        </div>
      </div>
    </div>

    <div className="d-flex gap-2">
      <button
        onClick={handleSave}
        className="btn btn-primary"
        disabled={saving}
      >
        {saving ? "Đang lưu..." : "Lưu"}
      </button>
      <Link to="/admin/products/getAll" className="btn btn-secondary">
        Quay lại
      </Link>
    </div>

    {product.variants?.length > 0 && (
      <div className="mt-5">
        <h5 className="mb-3">Biến thể sản phẩm:</h5>
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>SKU</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>Thuộc tính</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((variant, index) => (
              <tr key={variant.id}>
                <td className="text-center">{index + 1}</td>
                <td>{variant.sku}</td>
                <td>{Number(variant.price).toLocaleString()} đ</td>
                <td>{variant.stock ?? "Chưa có"}</td>
                <td>
                  {variant.attributeValues?.map((av) => (
                    <div key={av.id} className="mb-1">
                      <strong>{av.attribute?.name}:</strong>
                      {av.attribute?.name.toLowerCase() === "color" ? (
                        <span
                          className="d-inline-block rounded border ms-2"
                          style={{ backgroundColor: av.value, width: '20px', height: '20px' }}
                          title={av.value}
                        ></span>
                      ) : (
                        <span className="ms-2">{av.value}</span>
                      )}
                    </div>
                  ))}
                </td>
                <td className="text-center">
                  {variant.images?.length > 0 ? (
                    <img
                      src={variant.images[0].image_url}
                      alt="Variant"
                      width="60"
                      className="img-thumbnail"
                      onClick={() => handleImageClick(variant.images, 0)}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <Link
                      to={`/admin/products/editVariant/${variant.id}`}
                      className="btn btn-warning btn-sm"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </Link>
                    <button
                      onClick={() => setSelectedProduct(variant)}
                      className="btn btn-danger btn-sm"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedProduct && (
          <FormDelete
            isOpen={true}
            onClose={() => setSelectedProduct(null)}
            onConfirm={deleteProduct}
            message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct.name}" không?`}
          />
        )}
      </div>
    )}
  </div>

  {/* Modal hiển thị ảnh lớn */}
  <Modal
    show={showModal}
    onHide={() => setShowModal(false)}
    size="lg"
    centered
    backdrop="static"
    animation={true}
  >
    <Modal.Header closeButton>
      <Modal.Title>Xem ảnh</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Carousel interval={null} defaultActiveIndex={startIndex}>
        {selectedImages.map((img) => (
          <Carousel.Item key={img.id}>
            <img
              className="d-block w-100"
              src={img.image_url}
              alt="Ảnh lớn"
              style={{ maxHeight: "70vh", objectFit: "contain" }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </Modal.Body>
  </Modal>
</div>

  );
};

export default AdminProductDetail;
