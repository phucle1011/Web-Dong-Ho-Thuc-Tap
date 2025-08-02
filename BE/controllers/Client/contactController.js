const nodemailer = require("nodemailer");

class ContactController {
  static async sendEmail(req, res) {
    const { name, email, phone, subject, message } = req.body;

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,    
          pass: process.env.GMAIL_PASS,    
        },
      });

      const mailOptions = {
        from: email,
        to: process.env.GMAIL_USER,
        subject: `[Liên hệ] ${subject || "Không có chủ đề"}`,
        html: `
          <h3>Thông tin liên hệ</h3>
          <p><strong>Họ tên:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Số điện thoại:</strong> ${phone}</p>
          <p><strong>Nội dung:</strong></p>
          <p>${message}</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "Gửi email thành công!" });
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      return res.status(500).json({ message: "Không thể gửi email." });
    }
  }
}

module.exports = ContactController;
