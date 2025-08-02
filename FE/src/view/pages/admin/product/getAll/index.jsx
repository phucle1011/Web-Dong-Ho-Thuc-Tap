import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Constants from "../../../../../Constants.jsx";
import FormDelete from "../../../../components/formDelete/index.jsx";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaPlus,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // fetch categories
  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/category/list`)
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error);
  }, []);

  // fetch or search products
  useEffect(() => {
    const params = { page: currentPage, limit: recordsPerPage };
    if (searchInput) params.searchTerm = searchInput;
    if (selectedCategory) params.categoryId = selectedCategory;

    const url =
      searchInput || selectedCategory
        ? `${Constants.DOMAIN_API}/admin/products/productList/search`
        : `${Constants.DOMAIN_API}/admin/products`;

    axios
      .get(url, { params })
      .then((res) => {
        setProducts(res.data.data);
        setTotalPages(
          res.data.totalPages || res.data.pagination?.totalPages || 1
        );
      })
      .catch(console.error);
  }, [currentPage, searchInput, selectedCategory]);

  const handleSearch = () => setCurrentPage(1);
  const clearFilter = () => {
    setSearchInput("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    // optional: check variantCount here...
    try {
      await axios.delete(
        `${Constants.DOMAIN_API}/admin/products/${selectedProduct.id}`
      );
      toast.success("Xóa sản phẩm thành công");
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setSelectedProduct(null);
    }
  };

  const renderPagination = () => (
    <div className="flex justify-center mt-6 space-x-1">
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        <FaAngleDoubleLeft />
      </button>
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        <FaChevronLeft />
      </button>
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        if (Math.abs(page - currentPage) <= 1) {
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          );
        }
        return null;
      })}
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        <FaChevronRight />
      </button>
      <button
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        <FaAngleDoubleRight />
      </button>
    </div>
  );

  return (
    <>
      <div
        style={{ marginLeft: "14rem" }}
        className="min-h-screen bg-gray-100 p-6"
      >
        <div className="container mx-auto bg-white shadow rounded-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
            <div className="flex gap-3">
  <Link
    to="/admin/attribute/getall"
    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded no-underline hover:no-underline"
  >
    <FaEye className="mr-2" /> Quản lý thuộc tính
  </Link>

  <Link
    to="/admin/products/create"
    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded no-underline hover:no-underline"
  >
    <FaPlus className="mr-2" /> Thêm sản phẩm
  </Link>
</div>

          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Tìm kiếm theo tên sản phẩm..."
            />
            <select
              className="border rounded px-3 py-2"
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
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-800 text-white rounded"
            >
              Tìm kiếm
            </button>
            {(searchInput || selectedCategory) && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Xem tất cả
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">Tên</th>
                  <th className="border p-2">Ảnh</th>
                  <th className="border p-2">Trạng thái</th>
                  <th className="border p-2">Danh mục</th>
                  <th className="border p-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="border p-4 text-center">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((prod, idx) => (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="border p-2 text-center">
                        {(currentPage - 1) * recordsPerPage + idx + 1}
                      </td>
                      <td className="border p-2">{prod.name}</td>
                      <td className="border p-2 text-center">
                        <img
                          src={
                            prod.thumbnail || "https://via.placeholder.com/60"
                          }
                          alt={prod.name}
                          className="w-12 h-12 object-cover mx-auto rounded"
                        />
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            prod.status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {prod.status === 1 ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td className="border p-2">
                        {prod.category?.name || "-"}
                      </td>
                      <td className="border p-2 text-center space-x-2">
                        <Link
                          to={`/admin/products/detail/${prod.id}`}
                          className="inline-block px-3 py-1 bg-blue-600 text-white rounded"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/products/addVariant/${prod.id}`}
                          className="inline-block px-3 py-1 bg-yellow-500 text-white rounded"
                          title="Thêm biến thể"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="inline-block px-3 py-1 bg-red-600 text-white rounded"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      </div>

      {/* Modal Xóa */}
      {selectedProduct && (
        <FormDelete
          isOpen
          onClose={() => setSelectedProduct(null)}
          onConfirm={deleteProduct}
          message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct.name}"?`}
        />
      )}
    </>
  );
};

export default AdminProductList;
