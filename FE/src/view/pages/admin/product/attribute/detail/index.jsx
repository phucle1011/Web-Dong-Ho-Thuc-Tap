import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../../../Constants.jsx";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

function AttributeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    // Lấy thông tin thuộc tính theo ID
    useEffect(() => {
        const fetchAttribute = async () => {
            try {
                const response = await axios.get(`${Constants.DOMAIN_API}/admin/attribute/${id}`);
                const attribute = response.data.data;

                setValue("name", attribute.name);
            } catch (error) {
                toast.error("Không tìm thấy thuộc tính.");
                navigate("/admin/attribute/getall");
            }
        };

        fetchAttribute();
    }, [id, navigate, setValue]);

    // Gửi form cập nhật
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axios.put(`${Constants.DOMAIN_API}/admin/attribute/${id}`, data);
            toast.success("Cập nhật thuộc tính thành công!");
            navigate("/admin/attribute/getall");
        } catch (error) {
            toast.error("Cập nhật thuộc tính thất bại.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
            <div style={{ marginLeft: "14rem" }} className="min-h-screen bg-gray-100 p-4">
  <div className="card shadow">
    <div className="card-body">
      <h2 className="card-title h4 mb-4">Cập nhật thuộc tính</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label fw-medium">Tên thuộc tính *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="VD: Màu sắc, Chất liệu dây..."
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
          {loading ? "Đang cập nhật..." : "Cập nhật thuộc tính"}
        </button>
      </form>
    </div>
  </div>
</div>

    );
}

export default AttributeEdit;
