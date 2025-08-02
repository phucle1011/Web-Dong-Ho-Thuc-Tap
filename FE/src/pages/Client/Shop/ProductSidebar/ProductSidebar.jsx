import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Constants from "../../../../Constants";
import "./ProductSidebar.css";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const ProductSidebar = () => {
  const query = useQuery();
  const initialTarget = parseInt(query.get("target"));
  const searchTerm = query.get("search") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState(initialTarget || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    getCategories();
    getTargetGroups();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [selectedCategory, selectedTargetGroup, searchTerm]);

  useEffect(() => {
    getProducts(currentPage);
  }, [selectedCategory, selectedTargetGroup, searchTerm, currentPage]);

  const getCategories = async () => {
    try {
      const res = await axios.get(Constants.DOMAIN_API + "/category/list");
      setCategories(res.data.data || []);
    } catch (e) {
      console.error("Lỗi lấy danh mục:", e);
    }
  };

  const getTargetGroups = async () => {
    try {
      const res = await axios.get(Constants.DOMAIN_API + "/target-groups");
      setTargetGroups(res.data.data || []);
    } catch (e) {
      console.error("Lỗi lấy nhóm thời trang:", e);
    }
  };

  const getProducts = async (page = 1) => {
    try {
      const params = {
        page,
        limit: productsPerPage
      };
      if (selectedCategory)    params.category     = selectedCategory;
      if (selectedTargetGroup) params.target_group = selectedTargetGroup;
      if (searchTerm)          params.search       = searchTerm;

      const res = await axios.get(Constants.DOMAIN_API + "/products", { params });
      let data = res.data.data || [];
      data = data.filter((p) => p.visibility !== "hidden");

      setProducts(data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setCurrentPage(res.data.pagination?.currentPage || 1);
    } catch (e) {
      console.error("Lỗi lấy sản phẩm:", e);
    }
  };

  const renderProduct = (product) => (
    <div className="product" key={product.id}>
      <img src={product.thumbnail} alt={product.name} />
      <h4>{product.name}</h4>
      <Link to={`/product/${product.id}`}>
        <button className="button">Mua Ngay</button>
      </Link>
    </div>
  );

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedTargetGroup(null);
  };

  return (
    <div className="container-sidebar">
      <aside className="shop-sidebar">
        <h3>Bộ Lọc</h3>

        <div className="filter-section">
          <h4>Thời Trang</h4>
          <ul>
            {targetGroups.map((group) => (
              <li key={group.id} className="custom-radio">
                <label>
                  <input
                    type="radio"
                    name="target"
                    value={group.id}
                    checked={selectedTargetGroup === group.id}
                    onChange={() => setSelectedTargetGroup(group.id)}
                  />
                  <span className="radio-label">{group.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="filter-section">
          <h4>Loại sản phẩm</h4>
          <ul>
            {categories.map((cat) => (
              <li key={cat.id} className="custom-radio">
                <label>
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(cat.id)}
                  />
                  <span className="radio-label">{cat.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <button className="button" onClick={resetFilters}>
          Huỷ lọc
        </button>
      </aside>

      <main className="product-list">
        <h3>Danh Sách Sản Phẩm</h3>
        <div className="products">
          {products.length > 0 ? (
            products.map(renderProduct)
          ) : (
            <p className="no-products">Không có sản phẩm phù hợp.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductSidebar;
