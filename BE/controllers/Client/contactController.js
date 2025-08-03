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
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #ffffff;">
    <h2 style="color: #333333; border-bottom: 1px solid #cccccc; padding-bottom: 10px;">
      Thông tin liên hệ từ website
    </h2>

    <table style="width: 100%; margin-top: 20px; font-size: 15px; color: #333;">
      <tr>
        <td style="font-weight: bold; width: 150px;">Họ tên:</td>
        <td>${name}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Email:</td>
        <td>${email}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Số điện thoại:</td>
        <td>${phone}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Chủ đề:</td>
        <td>${subject || "Không có"}</td>
      </tr>
    </table>

    <div style="margin-top: 30px;">
      <p style="font-weight: bold;">Nội dung tin nhắn:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; border: 1px solid #ccc; white-space: pre-wrap;">
        ${message}
      </div>
    </div>

    <p style="margin-top: 40px; font-size: 13px; color: #888;">
      Email này được gửi từ hệ thống website liên hệ. Vui lòng không trả lời email này.
    </p>
  </div>
`

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
