// header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./layout.css";

const HeaderAdmin = () => {
  return (
    <div className="admin-sidebar bg-dark text-white p-3 vh-100">
      <Link to="/admin" className="navbar-brand text-white fw-bold mb-3 d-block text-center">
        <h1 className="fa fa-user-edit me-2 "></h1>ADMIN
      </Link>
      <nav className="nav flex-column">
        <Link to="/Admin" className="nav-link text-white">Tổng Quan</Link>
        <Link to="/admin/product" className="nav-link text-white">Quản lý sản phẩm</Link>
        <Link to="/admin/categories" className="nav-link text-white">Quản lý loại sản phẩm</Link>
        <Link to="/admin/orders" className="nav-link text-white">Quản lý đơn hàng</Link>
        <Link to="/admin/users" className="nav-link text-white">Quản lý người dùng</Link>
        <Link to="/admin/comments" className="nav-link text-white">Quản lý bình luận</Link>
        <Link to="/admin/addresses" className="nav-link text-white">Quản lý địa chỉ</Link>

      </nav>
    </div>
  );
};

export default HeaderAdmin;