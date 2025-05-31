import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Constants from "../../../../../Constants.jsx";
import FormDelete from "../../../../components/formDelete";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import HeaderAdmin from "../../layout/header";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
const [selectedBrand, setSelectedBrand] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // dùng để lưu input tạm thời
  const recordsPerPage = 10;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");



  // Gọi API lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/category/list`
        );
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
  if (!searchTerm && !selectedCategory && !selectedBrand) {
    fetchProducts(currentPage);
  } else {
    searchProducts(currentPage, searchTerm, selectedCategory, selectedBrand);
  }
}, [currentPage, searchTerm, selectedCategory, selectedBrand]);


  // Tách hàm search riêng
  const searchProducts = async (page, search, categoryId = "", brandId = "") => {
  try {
    const res = await axios.get(
      `${Constants.DOMAIN_API}/admin/products/productList/search`,
      {
        params: {
          searchTerm: search,
          categoryId: categoryId || undefined,
          page,
          limit: recordsPerPage,
        },
      }
    );
    setProducts(res.data.data);
    setTotalPages(res.data.totalPages || 1);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    setProducts([]);
    setTotalPages(1);
  }
};


  const deleteProduct = async () => {
    if (!selectedProduct) return;

    // Kiểm tra có biến thể không
    if (
      (selectedProduct.variantCount ?? selectedProduct.variants?.length ?? 0) >
      0
    ) {
      toast.error("Không thể xóa sản phẩm có biến thể.");
      setSelectedProduct(null);
      return;
    }

    try {
      await axios.delete(
        `${Constants.DOMAIN_API}/admin/products/${selectedProduct.id}`
      );
      toast.success("Xóa sản phẩm thành công");
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchProducts(currentPage, searchTerm);
      }
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

  const fetchProducts = async (page, search = "") => {
    try {
      const params = { page, limit: recordsPerPage };
      if (search) params.searchTerm = search;

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/products`, {
        params,
      });
      console.log(res.data);

      setProducts(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = async () => {
    const trimmedSearch = searchInput.trim();
    setCurrentPage(1); // reset page

    // Nếu không có từ khóa và danh mục trống, load lại danh sách gốc
    if (!trimmedSearch && !selectedCategory) {
      setSearchTerm("");
      fetchProducts(1);
      return;
    }

    try {
      const res = await axios.get(
  `${Constants.DOMAIN_API}/admin/products/productList/search`,
  {
    params: {
      searchTerm: trimmedSearch,
      categoryId: selectedCategory || undefined,
      brandId: selectedBrand || undefined,
      page: 1,
      limit: recordsPerPage,
    },
  }
);

      setProducts(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setSearchTerm(trimmedSearch);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setProducts([]);
      setTotalPages(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (

    <>
  <HeaderAdmin />
  <div className="container py-3">
    <div className="card shadow-sm">
      <div className="card-body">

        {/* Tiêu đề */}
        <h2 className="h5 mb-4">Danh sách sản phẩm</h2>

        {/* Thanh công cụ (thêm + tìm kiếm) */}
        <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
          <Link to="/admin/products/create" className="btn btn-primary">
            + Thêm sản phẩm
          </Link>

          <div className="d-flex flex-wrap gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Tìm kiếm theo tên sản phẩm..."
              className="form-control"
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            />

            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearchSubmit}
              className="btn btn-dark"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Bảng danh sách sản phẩm */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover mt-3">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Ảnh</th>
                <th>Trạng thái</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Biến thể</th>
                <th>Kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-3">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id}>
                    <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                    <td>{product.name}</td>
                    <td>
                      <img
                        src={product.thumbnail || "https://via.placeholder.com/60"}
                        alt={product.name}
                        className="img-thumbnail"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <span className={`badge ${product.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                        {product.status === 1 ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td>{product.category?.name || "Không có"}</td>
                    <td>{product.brand?.name || "Không có"}</td>
                    <td className="text-center">
                      {product.variantCount ?? product.variants?.length ?? 0}
                    </td>
                    <td className="text-center">
                      {product.variants
                        ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                        : 0}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link
                          to={`/admin/products/detail/${product.id}`}
                          className="btn btn-success btn-sm"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/products/addVariant/${product.id}`}
                          className="btn btn-warning btn-sm text-white"
                          title="Thêm biến thể"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="btn btn-danger btn-sm"
                          title="Xoá sản phẩm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="d-flex justify-content-center mt-4">
          <div className="btn-group">
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FaChevronLeft />
            </button>

            {currentPage > 2 && (
              <>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
                {currentPage > 3 && <span className="btn disabled">...</span>}
              </>
            )}

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (page >= currentPage - 1 && page <= currentPage + 1) {
                return (
                  <button
                    key={page}
                    className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="btn disabled">...</span>}
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <FaChevronRight />
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Modal xác nhận xoá */}
    {selectedProduct && (
      <FormDelete
        isOpen={true}
        onClose={() => setSelectedProduct(null)}
        onConfirm={deleteProduct}
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct.name}" không?`}
      />
    )}
  </div>
</>


  );
};

export default AdminProductList;
