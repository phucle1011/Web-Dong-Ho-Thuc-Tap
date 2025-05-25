import React, { useState } from "react";
import { FaFacebookMessenger, FaInstagram, FaTiktok, FaCommentDots } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Contact.css";

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="container my-5">
            <h1 className="text-center fw-bold">Liên Hệ Với Chúng Tôi</h1>
            <p className="text-center text-muted">Chúng tôi luôn sẵn sàng hỗ trợ bạn!</p>

            {/* FORM LIÊN HỆ & BẢN ĐỒ */}
            <div className="row g-4 my-4">
                <div className="col-md-6 d-flex equal-height">
                    <div className="p-4 border rounded shadow bg-light card-custom w-100">
                        <h2 className="fw-semibold">Gửi Tin Nhắn</h2>
                        {submitted && <p className="text-success">Cảm ơn! Chúng tôi sẽ liên hệ sớm.</p>}
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="name" placeholder="Họ và tên" className="form-control my-2" onChange={handleChange} />
                            <input type="email" name="email" placeholder="Email" className="form-control my-2" onChange={handleChange} />
                            <input type="text" name="phone" placeholder="Số điện thoại" className="form-control my-2" onChange={handleChange} />
                            <select name="subject" className="form-select my-2" onChange={handleChange}>
                                <option value="">Chủ đề liên hệ</option>
                                <option value="support">Hỗ trợ đặt hàng</option>
                                <option value="complaint">Khiếu nại</option>
                                <option value="cooperation">Hợp tác</option>
                                <option value="other">Khác</option>
                            </select>
                            <textarea name="message" placeholder="Nội dung tin nhắn" className="form-control my-2" onChange={handleChange}></textarea>
                            <button type="submit" className="btn btn-primary w-100">Gửi Ngay</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-6 d-flex equal-height">
                    <div className="border rounded shadow card-custom w-100 h-100">
                        <iframe
                            title="Bản đồ"
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d982.3553699324409!2d105.75751400665126!3d9.981999887739317!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08906415c355f%3A0x416815a99ebd841e!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1743232289585!5m2!1svi!2s"
                            className="w-100 h-100 rounded border"
                            allowFullScreen loading="lazy">
                        </iframe>
                    </div>
                </div>
            </div>

            {/* MẠNG XÃ HỘI & FAQ */}
            <div className="row g-4">
                <div className="col-md-6 d-flex equal-height-1">
                    <div className="p-4 border rounded shadow bg-light card-custom w-100">
                        <h2 className="fw-semibold">Mạng Xã Hội</h2>
                        <ul className="list-unstyled">
                            <li><FaFacebookMessenger className="text-primary" /> <a href="https://www.messenger.com/" target="_blank" rel="noopener noreferrer">Facebook Messenger</a></li>
                            <li><FaCommentDots className="text-success" /> <a href="https://zalo.me/" target="_blank" rel="noopener noreferrer">Zalo Chat</a></li>
                            <li><FaInstagram className="text-danger" /> <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li><FaTiktok className="text-dark" /> <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">TikTok</a></li>
                        </ul>
                    </div>
                </div>

                <div className="col-md-6 d-flex equal-height-1">
                    <div className="p-4 border rounded shadow bg-light card-custom w-100">
                        <h2 className="fw-semibold">Câu Hỏi Thường Gặp</h2>
                        <ul className="faq-list">
                            <li>Làm thế nào để đặt hàng?</li>
                            <li>Shop có hỗ trợ đổi trả không?</li>
                            <li>Mất bao lâu để nhận hàng?</li>
                            <li>Cần thông tin về địa chỉ nhận hàng?</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
