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

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState(initialTarget || null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    getCategories();
    getTargetGroups();
    getProducts();
  }, []);

  useEffect(() => {
    getProducts();
  }, [selectedCategory, selectedTargetGroup]);

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

  const getProducts = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedTargetGroup) params.target_group = selectedTargetGroup;

      const res = await axios.get(Constants.DOMAIN_API + "/products", { params });
      let data = res.data.data || [];
      console.log(data);
      

      // Optional: lọc client nếu visibility có tồn tại
      data = data.filter((p) => p.visibility !== "hidden");

      setProducts(data);
      setCurrentPage(1);
    } catch (e) {
      console.error("Lỗi lấy sản phẩm:", e);
    }
  };

  const renderProduct = (product) => {
    const hasSale = parseFloat(product.sale_price) > 0;

    return (
      <div className="product" key={product.id}>
        <img src={product.thumbnail} alt={product.name} />
        <h4>{product.name}</h4>
        {/* <p className="price">
          {hasSale ? (
            <>
              {parseInt(product.sale_price).toLocaleString()}đ{" "}
              <span className="old-price">
                {parseInt(product.price).toLocaleString()}đ
              </span>
            </>
          ) : (
            `${parseInt(product.price).toLocaleString()}đ`
          )}
        </p> */}
        <Link to={`/product/${product.id}`}>
          <button className="button">Mua Ngay</button>
        </Link>
      </div>
    );
  };

  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
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
          {currentProducts.length > 0 ? (
            currentProducts.map(renderProduct)
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
