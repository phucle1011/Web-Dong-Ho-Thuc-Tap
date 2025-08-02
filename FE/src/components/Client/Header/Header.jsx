// src/components/Header.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import Constants from "../../../Constants";
import logo from "../../../assets/img/logo.webp";
import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cookies, , removeCookie] = useCookies(["token", "role"]);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // State mới: số mục trong giỏ
  const [cartCount, setCartCount] = useState(0);

  // Thiết lập auth + user
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

  // Fetch giỏ hàng để lấy count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!cookies.token) {
        setCartCount(0);
        return;
      }
      try {
        const token = cookies.token;
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            user: user.id,
          },
        });
        // Nếu muốn show số mục: res.data.data.length
        // Nếu muốn tổng số lượng: sum over .quantity
        const items = res.data.data || [];
        const count = items.length;
        setCartCount(count);
      } catch (err) {
        console.error("Lỗi fetchCart trong Header:", err);
        setCartCount(0);
      }
    };
    fetchCartCount();
  }, [cookies.token, location.pathname]); // reload khi đổi page hoặc token

  const handleLogout = () => {
    removeCookie("token");
    removeCookie("role");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="container-header">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="Fashion Shop" />
        </Link>

        {/* Thanh tìm kiếm */}
        <div className="search-bar">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          <button type="submit">
            <FaSearch />
          </button>
        </div>

        {/* Điều hướng */}
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
                  state: { from: "/cart", message: "Vui lòng đăng nhập để xem giỏ hàng" },
                });
              }
            }}
          >
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
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
