import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import logo from "../../../assets/img/logo.webp";
import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cookies, , removeCookie] = useCookies(["token", "role"]);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
const [cartCount, setCartCount] = useState(0);

  // Cập nhật khi location hoặc cookie thay đổi
  useEffect(() => {
    const token = cookies.token;
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuth(true);
      } catch {
        setUser(null);
        setIsAuth(false);
      }
    } else {
      setUser(null);
      setIsAuth(false);
    }
  }, [location, cookies.token]);

  const handleLogout = () => {
    removeCookie("token");
    removeCookie("role");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Nếu muốn truyền param trong URL: /shop?search=...
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    // Hoặc nếu trang /shop xử lý state:
    // navigate("/shop", { state: { search: searchTerm } });
  };

  return (
    <header className="header">
      <div className="container-header">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="Fashion Shop" />
        </Link>

        {/* Thanh tìm kiếm */}
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>

        {/* Điều hướng chính */}
        <nav className="nav">
          <ul className="nav-links">
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/shop">Sản phẩm</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </nav>

        {/* Hành động người dùng */}
        <div className="user-actions">
          <Link
            to={isAuth ? "/cart" : "#"}
            className="cart"
            onClick={(e) => {
              if (!isAuth) {
                e.preventDefault();
                navigate("/login", {
                  state: {
                    from: "/cart",
                    message: "Vui lòng đăng nhập để xem giỏ hàng",
                  },
                });
              }
            }}
          >
            <FaShoppingCart />
            <span className="cart-count">3</span>
          </Link>

          {isAuth && user ? (
            <div className="user-menu">
              <button className="user-btn">
                <img
                  src={user.avatar || require("../../../assets/img/user-4.jpg")}
                  alt="avatar"
                  className="user-avatar"
                />
                {user.name || "Tài khoản"}
              </button>
              <ul className="dropdown-menu">
                <li><Link to="/profile">Thông tin</Link></li>
                <li><Link to="/orders">Đơn hàng</Link></li>
                <li><button onClick={handleLogout}>Đăng xuất</button></li>
              </ul>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
