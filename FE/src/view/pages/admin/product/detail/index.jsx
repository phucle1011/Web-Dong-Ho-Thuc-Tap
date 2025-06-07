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
    <div className="container mx-auto p-4">
      <HeaderAdmin />
      <div className="bg-white shadow rounded-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa sản phẩm</h2>

        <div className="flex gap-6 mb-4">
          <img
            src={formData.thumbnail || "https://via.placeholder.com/150"}
            alt={formData.name}
            className="w-40 h-40 object-cover rounded"
          />
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <label className="font-semibold">Tên sản phẩm:</label>
              <input
                type="text"
                name="name"
                className="border rounded p-2 w-full"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="font-semibold">Mô tả:</label>
              <textarea
                name="description"
                className="border rounded p-2 w-full"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="font-semibold">Trạng thái:</label>
              <select
                name="status"
                className="border rounded p-2 w-full"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">Danh mục:</label>
              <input
                type="text"
                className="border rounded p-2 w-full"
                value={formData.category?.name || "Không có"}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
          <Link
            to="/admin/products/getAll"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Quay lại
          </Link>
        </div>

        {/* Bảng biến thể vẫn giữ nguyên như cũ */}
       {product.variants?.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Biến thể sản phẩm:</h3>
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">#</th> {/* Cột thứ tự */}
          <th className="p-2 border">SKU</th>
          <th className="p-2 border">Giá</th>
          <th className="p-2 border">Kho</th>
          <th className="p-2 border">Thuộc tính</th>
          <th className="p-2 border">Ảnh</th>
          <th className="p-2 border">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {product.variants.map((variant, index) => (
          <tr key={variant.id} className="border-b">
            <td className="p-2 border text-center">{index + 1}</td> {/* Hiển thị STT */}
            <td className="p-2 border">{variant.sku}</td>
            <td className="p-2 border">
              {Number(variant.price).toLocaleString()} đ
            </td>
            <td className="p-2 border">
              {variant.stock !== undefined ? variant.stock : "Chưa có"}
            </td>
            <td className="p-2 border">
              {variant.attributeValues?.map((av) => (
                <div
                  key={av.id}
                  className="flex items-center gap-2 mb-1"
                >
                  <strong>{av.attribute?.name}:</strong>
                  {av.attribute?.name.toLowerCase() === "color" ? (
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: av.value }}
                      title={av.value}
                    ></div>
                  ) : (
                    <span>{av.value}</span>
                  )}
                </div>
              ))}
            </td>
            <td className="p-2 border text-center">
              <div className="flex justify-center items-center h-full">
                {variant.images && variant.images.length > 0 ? (
                  <img
                    key={variant.images[0].id}
                    src={variant.images[0].image_url}
                    alt="Variant"
                    width="60"
                    className="cursor-pointer rounded border"
                    onClick={() => handleImageClick(variant.images, 0)}
                  />
                ) : (
                  <span>Không có ảnh</span>
                )}
              </div>
            </td>
            <td className="p-2 border text-center">
              <div className="flex gap-2 justify-center">
                <Link
                  to={`/admin/products/editVariant/${variant.id}`}
                  className="bg-yellow-500 text-white py-1 px-3 rounded"
                >
                                    <i className="fa-solid fa-pen-to-square"></i>

                </Link>
                <button
                  onClick={() => setSelectedProduct(variant)}
                  className="bg-red-500 text-white py-1 px-3 rounded"
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
          <Modal.Title>Xem ảnh </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel interval={null} defaultActiveIndex={startIndex}>
            {selectedImages.map((img) => (
              <Carousel.Item key={img.id}>
                <img
                  className="d-block w-100"
                  src={img.image_url}
                  alt="Bình luận"
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
