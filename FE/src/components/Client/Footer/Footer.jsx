import { FaFacebookF, FaInstagram, FaTiktok, FaCcVisa, FaCcMastercard } from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="client-footer">
      <div className="footer-container">
        {/* Thông tin liên hệ */}
        <div className="footer-column">
          <h3>📍 Thông Tin Liên Hệ</h3>
          <p>🏠 123 Nguyễn Văn A, Quận 1, TP. HCM</p>
          <p>📞 0901 234 567</p>
          <p>📧 support@polyfashion.com</p>
        </div>

        {/* Liên kết nhanh */}
        <div className="footer-column">
          <h3>🔗 Liên Kết Nhanh</h3>
          <ul>
            <li><a href="/about">Về Chúng Tôi</a></li>
            <li><a href="/return-policy">Chính Sách Đổi Trả</a></li>
            <li><a href="/guide">Hướng Dẫn Mua Hàng</a></li>
          </ul>
        </div>

        {/* Mạng xã hội */}
        <div className="footer-column">
          <h3>🌍 Kết Nối Với Chúng Tôi</h3>
          <div className="social-icons">
            <a href="https://facebook.com" className="facebook"><FaFacebookF /></a>
            <a href="https://instagram.com" className="instagram"><FaInstagram /></a>
            <a href="https://tiktok.com" className="tiktok"><FaTiktok /></a>
          </div>
        </div>

        {/* Thanh toán */}
        <div className="footer-column">
          <h3>💳 Thanh Toán An Toàn</h3>
          <div className="payment-icons">
            <FaCcVisa className="visa" />
            <FaCcMastercard className="mastercard" />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2025 Poly Fashion. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;