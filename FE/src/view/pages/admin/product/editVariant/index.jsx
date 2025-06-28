import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderAdmin from "../../layout/header";

const EditVariantForm = () => {
  const { id } = useParams();
  const [variant, setVariant] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    price: "",
    stock: "",
    attributes: [],
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attrRes = await axios.get(
          "http://localhost:5000/admin/product-attributes"
        );
        setAttributesList(attrRes.data.data);

        const res = await axios.get(
          `http://localhost:5000/admin/variants/${id}`
        );
        const data = res.data.data;

        setVariant(data);
        setFormData({
          sku: data.sku || "",
          price: data.price || "",
          stock: data.stock || "",
          attributes:
            data.attributeValues?.map((attr) => ({
              id: attr.id,
              attribute_id: attr.product_attribute_id,
              value: attr.value,
            })) || [],
          images:
            data.images?.map((img) => ({
              id: img.id,
              url: img.image_url,
            })) || [],
        });
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        toast.error("Lỗi khi tải dữ liệu!");
      }
    };

    fetchData();
  }, [id]);

  console.log(formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const addAttributeField = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { attribute_id: "", value: "" }],
    }));
  };

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadToCloudinary(file);
      const newImages = [...formData.images];
      newImages[index] = { id: null, url };
      setFormData((prev) => ({ ...prev, images: newImages }));
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Upload thất bại:", error);
      toast.error("Lỗi khi upload ảnh lên Cloudinary!");
    }
  };

  const handleDeleteAttribute = async (id) => {
    const newAttributes = [...formData.attributes];
    const index = newAttributes.findIndex((attr) => attr.id === id);
    if (index === -1) return;

    if (id) {
      try {
        await axios.delete(
          `http://localhost:5000/admin/product-variants/deleteAttributeValueById/${id}`
        );
      } catch (error) {
        console.error("Lỗi khi xóa thuộc tính:", error);
        toast.error("Xoá thuộc tính thất bại!");
        return;
      }
    }

    newAttributes.splice(index, 1);
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const handleDeleteImage = async (index) => {
    const image = formData.images[index];
    if (!image) return;

    if (image.id) {
      try {
        await axios.delete(
          `http://localhost:5000/admin/variant-images/${image.id}`
        );
      } catch (error) {
        console.error("Lỗi khi xóa ảnh:", error);
        toast.error("Xoá ảnh thất bại!");
        return;
      }
    }

    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));
    toast.success("Đã xoá ảnh.");
  };

 const addImageField = () => {
  setFormData((prev) => ({
    ...prev,
    images: [...prev.images, { id: null, url: "" }],
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedData = {
      ...formData,
      images: formData.images.map((img) => img.url),
    };

    try {
      await axios.put(
        `http://localhost:5000/admin/variants/${id}`,
        preparedData
      );
      toast.success("Cập nhật biến thể thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  if (!variant) return <p>Đang tải dữ liệu...</p>;

  return (
    <>
  <form
    onSubmit={handleSubmit}
    className="container my-5 p-4 bg-white shadow rounded"
  >
    <h2 className="h3 text-center fw-bold mb-4">Chỉnh sửa biến thể</h2>

    {/* Thông tin cơ bản */}
    <div className="row g-3 mb-4">
      <div className="col-md-4">
        <label htmlFor="sku" className="form-label">SKU</label>
        <input
          type="text"
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          className="form-control"
          placeholder="Mã SKU"
        />
      </div>
      <div className="col-md-4">
        <label htmlFor="price" className="form-label">Giá</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="form-control"
          placeholder="Giá"
        />
      </div>
      <div className="col-md-4">
        <label htmlFor="stock" className="form-label">Tồn kho</label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className="form-control"
          placeholder="Tồn kho"
        />
      </div>
    </div>

    {/* Thuộc tính */}
    <fieldset className="border rounded p-3 mb-4">
      <legend className="float-none w-auto px-2 fw-semibold">Thuộc tính</legend>
      <div className="d-flex flex-column gap-3 mt-2">
        {formData.attributes.map((attr, index) => {
          const selectedAttr = attributesList.find(
            (item) => item.id === parseInt(attr.attribute_id)
          );
          const isColor =
            selectedAttr?.name.toLowerCase() === "color" ||
            selectedAttr?.name.toLowerCase() === "màu";

          return (
            <div key={index} className="row g-2 align-items-center">
              <div className="col-md-4">
                <select
                  value={attr.attribute_id}
                  onChange={(e) =>
                    handleAttributeChange(index, "attribute_id", e.target.value)
                  }
                  className="form-select"
                >
                  <option value="">Chọn thuộc tính</option>
                  {attributesList
                    .filter((item) => {
                      const isSelected = formData.attributes.some(
                        (a, i) =>
                          i !== index && parseInt(a.attribute_id) === item.id
                      );
                      return !isSelected;
                    })
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-4">
                {isColor ? (
                  <input
                    type="color"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(index, "value", e.target.value)
                    }
                    className="form-control form-control-color"
                  />
                ) : (
                  <input
                    type="text"
                    value={attr.value}
                    placeholder="Giá trị"
                    onChange={(e) =>
                      handleAttributeChange(index, "value", e.target.value)
                    }
                    className="form-control"
                  />
                )}
              </div>

              <div className="col-md-2">
                <button
                  type="button"
                  onClick={() => handleDeleteAttribute(attr.id)}
                  className="btn btn-outline-danger"
                  aria-label="Xóa thuộc tính"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          );
        })}

        {formData.attributes.length < attributesList.length && (
          <button
            type="button"
            onClick={addAttributeField}
            className="btn btn-link text-primary p-0"
          >
            + Thêm thuộc tính
          </button>
        )}
      </div>
    </fieldset>

    {/* Ảnh biến thể */}
    <fieldset className="border rounded p-3 mb-4">
      <legend className="float-none w-auto px-2 fw-semibold">Ảnh biến thể</legend>
      <div className="d-flex flex-column gap-3 mt-2">
        {formData.images.map((img, index) => (
          <div key={index} className="row g-3 align-items-center">
            <div className="col-auto">
              {img.url && (
                <img
                  src={img.url}
                  alt={`image-${index}`}
                  className="img-thumbnail"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              )}
            </div>
            <div className="col">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, index)}
                className="form-control"
              />
            </div>
            <div className="col-auto">
              <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                className="btn btn-outline-danger"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addImageField}
          className="btn btn-link text-primary p-0"
        >
          + Thêm ảnh
        </button>
      </div>
    </fieldset>

    {/* Nút submit */}
    <div className="d-flex gap-3">
      <button type="submit" className="btn btn-primary">Cập nhật</button>
      <Link to="/admin/products/getAll" className="btn btn-secondary">
        Quay lại
      </Link>
    </div>
  </form>
</>

  );
};

export default EditVariantForm;
