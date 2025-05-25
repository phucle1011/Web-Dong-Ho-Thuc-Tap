import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import "./home.css";
import HeaderAdmin from "../layout/header";
import constant from "../../../../Constants";

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [cookies] = useCookies([constant.COOKIE_TOKEN]);

  useEffect(() => {
    const token = cookies[constant.COOKIE_TOKEN];
    if (!token) {
      console.error("Token không tồn tại trong cookie.");
      return;
    }

    const fetchCount = async (endpoint, setStateFn, label) => {
      try {
        const response = await axios.get(`${constant.DOMAIN_API}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStateFn(response.data.count);
      } catch (error) {
        console.error(`Lỗi khi lấy ${label}:`, error);
      }
    };

    fetchCount("/order/count", setOrderCount, "số lượng đơn hàng");
    fetchCount("/product/count", setProductCount, "số lượng sản phẩm");
    fetchCount("/review/count", setCommentCount, "số lượng bình luận");
    fetchCount("/user/count", setUserCount, "số lượng người dùng");
  }, [cookies]);

  return (
    <div className="main-container">
      <HeaderAdmin />
      <div className="dashboard-container">
        <h2 className="dashboard-title">Bảng Điều Khiển</h2>

        <div className="stats-container">
          {[
            { icon: "fa-box", label: "Số Lượng Đơn Hàng", value: orderCount },
            { icon: "fa-cogs", label: "Số Lượng Sản Phẩm", value: productCount },
            { icon: "fa-comments", label: "Số Lượng Bình Luận", value: commentCount },
            { icon: "fa-users", label: "Số Lượng Người Dùng", value: userCount },
          ].map((stat, index) => (
            <div key={index} className="stat-card">
              <i className={`fa ${stat.icon} stat-icon`}></i>
              <div className="stat-info">
                <p>{stat.label}</p>
                <h6>{stat.value}</h6>
              </div>
            </div>
          ))}
        </div>

        <div className="recent-sales">
          <h6 className="section-title">Giao Dịch Gần Đây</h6>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Hóa Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Số Tiền</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td>01 Jan 2025</td>
                    <td>INV-0123</td>
                    <td>John Doe</td>
                    <td>$123</td>
                    <td className="status-paid">Đã Thanh Toán</td>
                    <td>
                      <Link to="#" className="btn-detail">
                        Chi Tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
