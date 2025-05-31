const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const User = require("../../models/usersModel");


const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class AuthController {
    static async register(req, res) {
        try {
            console.log("Headers nhận được:", req.headers);
            console.log("Dữ liệu nhận được:", req.body);

            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email đã tồn tại!" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({ name, email, password: hashedPassword, role: "User", phoneNumber: '', address: '', avatar:'' });

            return res.status(201).json({ message: "Đăng ký thành công!", user });
        } catch (error) {
            console.error("Lỗi server:", error);
            return res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
    
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
            }
    
            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: "1h" }
            );

            const { password: _, ...userWithoutPassword } = user.toJSON();
    
            console.log("Token tạo thành công:", token);
    
            return res.status(200).json({
                message: "Đăng nhập thành công!",
                token,
                user: userWithoutPassword 
            });
    
        } catch (error) {
            console.error("Lỗi server:", error);
            return res.status(500).json({ message: "Lỗi server, vui lòng thử lại!", error: error.message });
        }
    }
    
    static async forgotPassword(req, res) {
        const { email } = req.body;
    
        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email." });
        }
    
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: "Email không tồn tại." });
            }
    
            const otp = Math.floor(100000 + Math.random() * 900000);
    
            req.session.otp = { email, code: otp, expire: Date.now() + 10 * 60 * 1000 };
            console.log("Session sau khi lưu OTP:", req.session); 
    
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
    
            const mailOptions = {  
                to: email,
                subject: "Mã xác thực đặt lại mật khẩu",
                html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
                       <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
                       <p>Mã này có hiệu lực trong 10 phút.</p>`,
            };
    
            await transporter.sendMail(mailOptions);
            return res.json({ message: "Mã OTP đã được gửi đến email của bạn." });
        } catch (error) {
            console.error("Lỗi trong quá trình quên mật khẩu:", error);
            return res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
        }
    }
    

    static async OTP(req, res) {
        const { email, otp } = req.body;
        const storedOtp = req.session.otp;
    
        console.log("OTP nhận được từ client:", otp);
        console.log("OTP trong session:", storedOtp);
    
        if (!storedOtp) {
            return res.status(400).json({ message: "Không tìm thấy OTP trong session." });
        }
    
        if (storedOtp.email !== email || storedOtp.code != otp || Date.now() > storedOtp.expire) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
        }
    
        delete req.session.otp; 
    
        return res.json({ message: "Mã OTP hợp lệ. Vui lòng thay đổi mật khẩu.", email });
    }
    
    static async resetPassword(req, res) {
        const { email, password, re_password } = req.body;
        console.log('Received data:', req.body);  
    
        if (!email || !password || !re_password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
        }
    
        if (password !== re_password) {
            return res.status(400).json({ message: "Mật khẩu không khớp. Vui lòng nhập lại." });
        }
    
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
    
            await User.update(
                { password: hashedPassword },
                { where: { email } }
            );
    
            return res.json({ message: "Mật khẩu đã được cập nhật thành công." });
        } catch (error) {
            console.error("Lỗi khi đặt lại mật khẩu:", error);
            return res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
        }
    }
    
}

module.exports = AuthController;
