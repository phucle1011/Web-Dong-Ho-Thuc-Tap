import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../../../Constants.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AttributeCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (formData) => {
        setLoading(true);

        const cleanedData = {
            ...formData,
            name: formData.name.trim().replace(/\s+/g, " "),
        };

        try {
            await axios.post(`${Constants.DOMAIN_API}/admin/attribute`, cleanedData);
            toast.success("Thêm thuộc tính thành công!");
            navigate("/admin/attribute/getall");
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error("Tên thuộc tính đã tồn tại.");
            } else {
                toast.error("Thêm thuộc tính thất bại.");
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
            <div style={{ marginLeft: "14rem" }} className="min-h-screen bg-gray-100 p-4">
  <div className="card shadow">
    <div className="card-body">
      <h2 className="card-title h4 mb-4">Thêm thuộc tính mới</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label fw-medium">Tên thuộc tính *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="VD: Màu sắc, Kích thước..."
            {...register("name", {
              required: "Tên thuộc tính không được để trống",
              minLength: {
                value: 2,
                message: "Tên thuộc tính phải ít nhất 2 ký tự",
              },
            })}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Đang thêm..." : "Thêm thuộc tính"}
        </button>
      </form>
    </div>
  </div>
</div>

    );
}

export default AttributeCreate;
