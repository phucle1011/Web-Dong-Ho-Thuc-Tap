const axios = require("axios");
const OrderModel = require("../../models/ordersModel");
const OrderDetail = require("../../models/orderDetailsModel");
const UserModel = require("../../models/usersModel");
const CartModel = require("../../models/cartDetailsModel");
const ProductVariantModel = require("../../models/productVariantsModel");
const RedisService = require("../../config/redisService");

const Stripe = require('stripe');
const requestIp = require("request-ip");
const moment = require("moment");
const { Op } = require("sequelize");
const sequelize = require("../../config/database");
const crypto = require("crypto");

require("dotenv").config();
const nodemailer = require("nodemailer");

class OrderController {
    static async get(req, res) {
        const userId = req.headers["x-user-id"];

        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const currentPage = parseInt(page, 10);
        const perPage = parseInt(limit, 10);
        const offset = (currentPage - 1) * perPage;

        try {
            const whereClause = {
                user_id: userId,
            };

            if (startDate || endDate) {
                whereClause.created_at = {};

                if (startDate) {
                    whereClause.created_at[Op.gte] = new Date(startDate);
                }

                if (endDate) {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    whereClause.created_at[Op.lte] = endOfDay;
                }
            }

            if (status && status !== "all") {
                whereClause.status = status;
            }

            const { count, rows } = await OrderModel.findAndCountAll({
                where: whereClause,
                include: [{ model: UserModel, as: "user" }],
                order: [["created_at", "DESC"]],
                offset,
                limit: perPage,
            });

            const filteredOrders = await OrderModel.findAll({
                where: whereClause,
                include: [{ model: UserModel, as: "user" }],
                order: [["created_at", "DESC"]],
            });

            const statusCounts = {
                all: filteredOrders.length,
                pending: 0,
                confirmed: 0,
                shipping: 0,
                completed: 0,
                delivered: 0,
                cancelled: 0,
            };

            filteredOrders.forEach((order) => {
                if (statusCounts.hasOwnProperty(order.status)) {
                    statusCounts[order.status]++;
                }
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: rows,
                pagination: {
                    totalItems: count,
                    currentPage,
                    totalPages: Math.ceil(count / perPage),
                },
                statusCounts,
            });
        } catch (error) {
            console.error(
                "Lỗi khi lấy danh sách đơn hàng:",
                error.message,
                error.stack
            );
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ.",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                status,
                address,
                phone,
                email,
                total_price,
                payment_method_id,
            } = req.body;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const previousStatus = order.status;

            if (name !== undefined) order.name = name;
            if (status !== undefined) order.status = status;
            if (address !== undefined) order.address = address;
            if (phone !== undefined) order.phone = phone;
            if (email !== undefined) order.email = email;
            if (total_price !== undefined) order.total_price = total_price;
            if (payment_method_id !== undefined)
                order.payment_method_id = payment_method_id;

            await order.save();

            if (previousStatus !== "cancelled" && status === "cancelled") {
                const user = await UserModel.findByPk(order.user_id);
                if (user && user.email) {
                    await this.sendOrderCancellationEmail(
                        order,
                        user,
                        user.email,
                        cancellation_reason
                    );
                }
            }

            res.status(200).json({
                status: 200,
                message: "Cập nhật thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async cancelOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { cancellation_reason } = req.body;

            const order = await OrderModel.findByPk(id, { transaction: t });
            if (!order) {
                await t.rollback();
                return res.status(404).json({ message: "Id không tồn tại" });
            }
            if (order.status !== "pending") {
                await t.rollback();
                return res.status(400).json({
                    message: "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'",
                });
            }

            const orderDetails = await OrderDetail.findAll({
                where: { order_id: id },
                attributes: [
                    'id',
                    'product_variant_id',
                    'order_id',
                    'quantity',
                    'price',
                    'created_at',
                    'updated_at'
                ],
                transaction: t
            });

            for (const d of orderDetails) {
                const pv = await ProductVariantModel.findByPk(d.product_variant_id, {
                    transaction: t, lock: t.LOCK.UPDATE
                });
                if (pv) {
                    pv.stock += d.quantity;
                    await pv.save({ transaction: t });
                }
            }
            order.status = "cancelled";
            order.cancellation_reason = cancellation_reason || null;
            await order.save({ transaction: t });

            await t.commit();

            res.status(200).json({
                status: 200,
                message: "Hủy đơn hàng thành công",
                data: order,
            });

            try {
                const user = await UserModel.findByPk(order.user_id);
                await OrderController.sendOrderCancellationEmail(
                    order,
                    user,
                    user?.email || "no-reply@example.com",
                    cancellation_reason
                );
            } catch (mailErr) {
                console.error("Lỗi khi gửi email hủy đơn:", mailErr);
            }

        } catch (error) {
            await t.rollback();
            console.error("Lỗi cancelOrder:", error);
            res.status(500).json({ error: "Máy chủ gặp trục trặc khi huỷ đơn." });
        }
    }

    static async sendOrderCancellationEmail(
        order,
        user,
        customerEmail,
        cancellationReason
    ) {
        try {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const formattedDate = new Date().toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false,
            });

            const formattedTotal = new Intl.NumberFormat("vi-VN").format(
                order.total_price
            );
            const formattedShipping = new Intl.NumberFormat("vi-VN").format(
                order.shipping_fee || 0
            );

            const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8" />
                <title>Hủy đơn hàng</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f5f5;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        max-width: 500px;
                        margin: auto;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    .title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #d32f2f;
                        margin-bottom: 16px;
                    }
                    .info {
                        font-size: 14px;
                        margin-bottom: 12px;
                    }
                    .info span {
                        font-weight: bold;
                    }
                    .reason {
                        font-style: italic;
                        color: #555;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">Đơn hàng của bạn đã bị hủy</div>
    
                    <div class="info"><span>Mã đơn hàng:</span> #${order.order_code
                }</div>
                    <div class="info"><span>Khách hàng:</span> ${user?.name || "Không xác định"
                }</div>
                    <div class="info"><span>Email:</span> ${user?.email || customerEmail
                }</div>
                    <div class="info"><span>Ngày hủy:</span> ${formattedDate}</div>
                    <div class="info"><span>Tổng tiền:</span> ${formattedTotal}₫</div>
    
                    ${order.shipping_fee > 0
                    ? `<div class="info"><span>Phí vận chuyển:</span> +${formattedShipping}₫</div>`
                    : ""
                }
    
                    <div class="info"><span>Lý do hủy:</span> <span class="reason">${cancellationReason || "Không có lý do cụ thể"
                }</span></div>
    
                    <p style="margin-top: 20px; font-size: 13px; color: #777;">
                        Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ lại với chúng tôi. Cảm ơn bạn đã sử dụng dịch vụ.
                    </p>

                ${["momo", "vnpay"].includes(
                    order.payment_method?.toLowerCase?.()
                )
                    ? `<p style="margin-top: 12px; font-size: 13px; color: #d32f2f;">
                                Vì đơn hàng được thanh toán bằng <strong>${order.payment_method.toUpperCase()}</strong>, vui lòng liên hệ với chúng tôi để được hoàn tiền qua:
                                <br />Email: <a href="mailto:phuclnhpc09097@gmail.com">phuclnhpc09097@gmail.com</a>
                                <br />Zalo: <a href="https://zalo.me/0379169731" target="_blank">0379169731</a>
                           </p>`
                    : ""
                }

                </div>
            </body>
            </html>
            `;

            const mailOptions = {
                from: `"Cửa hàng của bạn" <${process.env.EMAIL_USER}>`,
                to: customerEmail,
                subject: `Hủy đơn hàng #${order.order_code}`,
                html: htmlContent,
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Lỗi gửi email hủy đơn hàng (chi tiết):", error);
            console.error("Không gửi được email hủy đơn:", err);
            throw new Error("Không thể gửi email hủy đơn hàng.");
        }
    }

    static async confirmDelivered(req, res) {
        try {
            const { id } = req.params;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

            if (order.status !== "delivered") {
                return res.status(400).json({
                    message:
                        "Chỉ được xác nhận giao hàng cho đơn hàng có trạng thái 'Đã giao hàng thành công'",
                });
            }

            order.status = "completed";
            await order.save();

            res.status(200).json({
                status: 200,
                message: "Xác nhận giao hàng thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        const {
            products,
            user_id,
            name,
            phone,
            customer_email,
            customer_phone,
            customer_name,
            shipping_address,
            payment_method,
            note,
            shipping_fee
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống.' });
        }
        if (!user_id) {
            return res.status(400).json({ message: 'Thiếu user_id trong yêu cầu.' });
        }

        const t = await sequelize.transaction();
        try {
            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    await t.rollback();
                    return res.status(400).json({ message: 'Thông tin biến thể sản phẩm bị thiếu.' });
                }

                const productVariant = await ProductVariantModel.findByPk(variant.id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!productVariant) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `Biến thể sản phẩm với ID ${variant.id} không tồn tại.`
                    });
                }
                if (productVariant.stock < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `Sản phẩm ${variant.sku} không đủ số lượng tồn kho.`
                    });
                }

                const price = parseFloat(variant.price);
                totalPrice += price * item.quantity;

                detailedCart.push({
                    variant: variant.id,
                    name: variant.sku,
                    price,
                    quantity: item.quantity,
                    total: price * item.quantity
                });

                productVariant.stock -= item.quantity;
                await productVariant.save({ transaction: t });
            }

            const finalTotal = totalPrice + (shipping_fee || 0);

            const order_code = `ORD-${Date.now()}`;

            const newOrder = await OrderModel.create({
                user_id,
                total_price: finalTotal,
                payment_method,
                order_code,
                shipping_address,
                note,
                shipping_fee: shipping_fee || 0,
                status: 'pending',
                cancellation_reason: '',
                shipping_code: null
            }, { transaction: t });

            const orderDetails = detailedCart.map(item => ({
                order_id: newOrder.id,
                product_variant_id: item.variant,
                quantity: item.quantity,
                price: item.price
            }));
            await OrderDetail.bulkCreate(orderDetails, { transaction: t });

            await t.commit();

            const currentDateTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
            // await OrderController.sendOrderConfirmationEmail(
            //     newOrder,
            //     { customer_name, customer_phone },
            //     products,
            //     customer_email,
            //     currentDateTime,
            //     customer_phone,
            //     customer_name,
            // );

            const successfullyOrderedProductIds = products.map(p => p.variant.id);
            return res.status(201).json({
                success: true,
                message: 'Đặt hàng thành công.',
                data: {
                    order: newOrder,
                    successfullyOrderedProductIds
                }
            });

        } catch (error) {
            await t.rollback();
            console.error('Lỗi khi tạo đơn hàng:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi tạo đơn hàng.',
                error: error.message
            });
        }
    }

    static sortObject(obj) {
        const ordered = {};
        const keys = Object.keys(obj).sort();
        keys.forEach((key) => {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
                ordered[key] = obj[key];
            }
        });
        return ordered;
    }

    static async createVNPayUrl(req, res) {
        try {
            const requiredEnvVars = [
                "VNPAY_TMN_CODE",
                "VNPAY_HASH_SECRET",
                "VNPAY_PAYMENT_URL",
                "VNPAY_RETURN_URL",
            ];
            for (const envVar of requiredEnvVars) {
                if (!process.env[envVar]) {
                    throw new Error(`Thiếu biến môi trường bắt buộc: ${envVar}`);
                }
            }

            let ipAddr = requestIp.getClientIp(req) || "127.0.0.1";

            const tmnCode = process.env.VNPAY_TMN_CODE.trim();
            const secretKey = process.env.VNPAY_HASH_SECRET.trim();

            const vnpUrl = process.env.VNPAY_PAYMENT_URL.trim();
            const returnUrl = process.env.VNPAY_RETURN_URL.trim();

            const rawAmount = Number(
                req.body.amount ??
                req.body.total_amount ??
                0
            );
            const usedFromWallet = Number(req.body.wallet_balance || 0);
            const amount = Math.floor(rawAmount - usedFromWallet);

            if (isNaN(amount) || amount <= 0 || amount > 9999999999) {
                return res
                    .status(400)
                    .json({ code: "03", message: "Số tiền không hợp lệ" });
            }

            const createDate = moment().format("YYYYMMDDHHmmss");
            const orderId = req.body.orderId || `VNPAY-${Date.now()}`;

            const extraData = {
                user_id: req.body.user_id,
                name: req.body.customer_name,
                phone: req.body.customer_phone,
                email: req.body.customer_email,
                address: req.body.shipping_address,
                note: req.body.note,
                products: req.body.products.map(p => ({
                    quantity: p.quantity,
                    variant_id: p.product_variant_id || p.variant?.id,
                    price: p.variant?.price || p.price,
                })),
                promotion: req.body.promotion,
                promotion_user_id: req.body.promotion_user_id || null,
                shipping_fee: req.body.shipping_fee,
                specialDiscount: req.body.promo_discount,
                discountAmount: req.body.voucher_discount,
                wallet_balance: usedFromWallet,
                orderId: req.body.orderId || `VNPAY-${Date.now()}`,
            };

            const redisKey = `order:${orderId}`;

            const saved = await RedisService.setData(redisKey, extraData, 86400);

            if (!saved) {
                throw new Error("Không thể lưu dữ liệu đơn hàng vào Redis");
            }

            const minimalOrderInfo = {
                orderId,
                userId: req.body.user_id,
                email: req.body.customer_email,
                amount,
                redisKey,
            };

            const orderInfo = Buffer.from(JSON.stringify(minimalOrderInfo)).toString(
                "base64"
            );

            const vnpParams = {
                vnp_Version: "2.1.0",
                vnp_Command: "pay",
                vnp_TmnCode: tmnCode,
                vnp_Amount: amount * 100,
                vnp_CreateDate: createDate,
                vnp_CurrCode: "VND",
                vnp_IpAddr: ipAddr,
                vnp_Locale: "vn",
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: req.body.orderType || "other",
                vnp_ReturnUrl: returnUrl,
                vnp_TxnRef: orderId,
                vnp_BankCode: req.body.bankCode || "",
            };

            const sortedParams = OrderController.sortObject(vnpParams);

            const signData = Object.entries(sortedParams)
                .map(
                    ([key, val]) =>
                        `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}`
                )
                .join("&");

            const hmac = crypto.createHmac("sha512", secretKey);
            hmac.update(Buffer.from(signData, "utf-8"));
            const signed = hmac.digest("hex");

            sortedParams.vnp_SecureHash = signed;

            const queryString = Object.entries(sortedParams)
                .map(
                    ([key, val]) =>
                        `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}`
                )
                .join("&");
            const paymentUrl = `${vnpUrl}?${queryString}`;

            return res.json({
                success: true,
                paymentUrl,
            });
        } catch (error) {
            console.error("Lỗi VNPay:", error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async handleVNPayCallback(req, res) {
        const t = await sequelize.transaction();
        try {
            const vnpParams = req.query;

            const secureHash = vnpParams.vnp_SecureHash;
            const orderId = vnpParams.vnp_TxnRef || "unknown";
            const amount = vnpParams.vnp_Amount ? vnpParams.vnp_Amount / 100 : 0;

            const orderInfo = vnpParams.vnp_OrderInfo;

            delete vnpParams.vnp_SecureHash;
            delete vnpParams.vnp_SecureHashType;

            const sortedParams = OrderController.sortObject(vnpParams);

            const signData = Object.entries(sortedParams)
                .map(([key, val]) => `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}`)
                .join("&");

            const secretKey = process.env.VNPAY_HASH_SECRET.trim();
            const hmac = crypto.createHmac("sha512", secretKey);
            const calculatedHash = hmac.update(signData, "utf-8").digest("hex");

            if (calculatedHash !== secureHash) {
                console.warn("⚠️ Hash mismatch:", { secureHash, calculatedHash });
                console.error("Chữ ký không hợp lệ");
                return res.redirect(
                    `${process.env.FRONTEND_URL}/payment/failed?error=Invalid_signature&orderId=${orderId}`
                );
            }

            if (vnpParams.vnp_ResponseCode !== "00") {
                console.error(`Giao dịch thất bại - Mã lỗi: ${vnpParams.vnp_ResponseCode}`);
                return res.redirect(
                    `${process.env.FRONTEND_URL}/payment/failed?error=Transaction_failed&code=${vnpParams.vnp_ResponseCode}&orderId=${orderId}`
                );
            }

            let minimalInfo;
            try {
                minimalInfo = JSON.parse(Buffer.from(orderInfo, "base64").toString("utf-8"));
                if (!minimalInfo.redisKey) {
                    throw new Error("Thiếu thông tin redisKey trong orderInfo");
                }
            } catch (decodeError) {
                console.error("Lỗi giải mã orderInfo:", decodeError.message);
                return res.redirect(
                    `${process.env.FRONTEND_URL}/payment/failed?error=Invalid_order_data&orderId=${orderId}`
                );
            }

            const decoded = await RedisService.getData(minimalInfo.redisKey);
            if (!decoded) {
                console.error("Không tìm thấy dữ liệu đơn hàng trong Redis");
                return res.redirect(
                    `${process.env.FRONTEND_URL}/payment/failed?error=Order_data_expired&orderId=${orderId}`
                );
            }
            await RedisService.deleteData(minimalInfo.redisKey);

            const {
                user_id,
                name,
                phone,
                email,
                address,
                note,
                products,
                promotion,
                shipping_fee,
                specialDiscount,
                discountAmount,
                promotion_user_id
            } = decoded;

            const usedFromWallet = Number(decoded.wallet_balance || 0);
            if (usedFromWallet > 0) {
                const user = await UserModel.findByPk(user_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                const currentBalance = Number(user.balance || 0);
                if (currentBalance < usedFromWallet) {
                    await t.rollback();
                    return res.redirect(
                        `${process.env.FRONTEND_URL}/payment/failed?error=Insufficient_wallet_balance&orderId=${orderId}`
                    );
                }

                user.balance = currentBalance - usedFromWallet;
                await user.save({ transaction: t });
            }

            let totalPrice = 0;
            const detailedCart = [];
            const emailProducts = [];

            for (const item of products) {
                if (!item.variant_id) {
                    console.error("Sản phẩm không hợp lệ (thiếu variant_id):", item);
                    await t.rollback();
                    return res.redirect(
                        `${process.env.FRONTEND_URL}/payment/failed?error=Invalid_product_data&orderId=${orderId}`
                    );
                }

                const productVariant = await ProductVariantModel.findByPk(item.variant_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!productVariant) {
                    console.error(`Không tìm thấy sản phẩm: ${item.variant_id}`);
                    await t.rollback();
                    return res.redirect(
                        `${process.env.FRONTEND_URL}/payment/failed?error=Product_not_found&productId=${item.variant_id}&orderId=${orderId}`
                    );
                }

                const price = parseFloat(productVariant.price);
                totalPrice += price * item.quantity;

                detailedCart.push({
                    product_id: item.variant_id,
                    name: productVariant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });

                emailProducts.push({
                    quantity: item.quantity,
                    variant: {
                        id: productVariant.id,
                        sku: productVariant.sku,
                        price: price,
                        name: productVariant?.product?.name || productVariant.sku
                    }
                });

                if (productVariant.stock < item.quantity) {
                    await t.rollback();
                    return res.redirect(
                        `${process.env.FRONTEND_URL}/payment/failed?error=Insufficient_stock&productId=${item.variant_id}&orderId=${orderId}`
                    );
                }
                productVariant.stock -= item.quantity;
                await productVariant.save({ transaction: t });
            }

            if (promotion) {
                const normalPromotion = await PromotionModel.findByPk(promotion, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (normalPromotion && !normalPromotion.special_promotion) {
                    const now = new Date();
                    if (
                        normalPromotion.status !== "active" ||
                        now < normalPromotion.start_date ||
                        now > normalPromotion.end_date ||
                        normalPromotion.quantity <= 0 ||
                        totalPrice < parseFloat(normalPromotion.min_price_threshold)
                    ) {
                        await t.rollback();
                        return res.redirect(
                            `${process.env.FRONTEND_URL}/payment/failed?error=Invalid_normal_promotion&orderId=${orderId}`
                        );
                    }

                    normalPromotion.quantity = Math.max(0, normalPromotion.quantity - 1);
                    await normalPromotion.save({ transaction: t });
                }
            }

            let promoUser = null;
            if (promotion_user_id) {
                promoUser = await PromotionUserModel.findOne({
                    where: {
                        id: parseInt(promotion_user_id),
                        user_id,
                        email_sent: true,
                        used: false,
                    },
                    include: [
                        { model: PromotionModel, as: "promotion", required: true },
                    ],
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!promoUser || !promoUser.promotion) {
                    await t.rollback();
                    return res.redirect(
                        `${process.env.FRONTEND_URL}/payment/failed?error=Invalid_special_promotion&orderId=${orderId}`
                    );
                }

                const specialPromotion = promoUser.promotion;
                const now = new Date();
                if (
                    specialPromotion.status !== "active" ||
                    now < specialPromotion.start_date ||
                    now > specialPromotion.end_date ||
                    specialPromotion.quantity <= 0 ||
                    totalPrice < specialPromotion.min_price_threshold
                ) {
                    await t.rollback();
                    return res.redirect(
                        `${process.env.FRONTEND_URL}/payment/failed?error=Invalid_special_promotion&orderId=${orderId}`
                    );
                }

                promoUser.used = true;
                await promoUser.save({ transaction: t });
                specialPromotion.quantity = Math.max(0, specialPromotion.quantity - 1);
                await specialPromotion.save({ transaction: t });
            }

            if (!decoded.address) {
                console.error("Thiếu địa chỉ giao hàng");
                await t.rollback();
                return res.redirect(
                    `${process.env.FRONTEND_URL}/payment/failed?error=Missing_shipping_address&orderId=${orderId}`
                );
            }

            const newOrder = await OrderModel.create(
                {
                    user_id,
                    address: decoded.address,
                    total_price: amount,
                    payment_method: "VNPay",
                    order_code: orderId,
                    shipping_address: decoded.address,
                    note: decoded.note || "",
                    shipping_fee: parseFloat(decoded.shipping_fee) || 0,
                    status: "pending",
                    cancellation_reason: "null",
                    shipping_code: null,
                    discount_amount: parseFloat(decoded.discountAmount) || 0,
                    special_discount_amount: parseFloat(decoded.specialDiscount) || 0,
                    wallet_balance: usedFromWallet,
                },
                { transaction: t }
            );

            const orderDetails = detailedCart.map((item) => ({
                order_id: newOrder.id,
                product_variant_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            }));
            await OrderDetail.bulkCreate(orderDetails, { transaction: t });

            const successfullyOrderedProductIds = products.map((p) => p.variant_id || p.variant_id);
            await CartModel.destroy({
                where: {
                    user_id,
                    product_variant_id: successfullyOrderedProductIds,
                },
                transaction: t,
            });

            await t.commit();

            // try {
            //     // await OrderController.sendOrderConfirmationEmail(
            //     //     newOrder,
            //     //     { name, phone },
            //     //     emailProducts,
            //     //     email,
            //     //     new Date()
            //     // );
            // } catch (mailErr) {
            //     console.error("Lỗi gửi email xác nhận đơn hàng:", mailErr);
            // }

            return res.redirect("http://localhost:3000/cart");
        } catch (error) {
            console.error("🔥 ERROR in handleVNPayCallback:", error.stack);
            if (t && t.finished !== "commit") {
                try {
                    await t.rollback();
                } catch (rbErr) {
                    console.error("Rollback error:", rbErr);
                }
            }
            const orderId = req.query.vnp_TxnRef || "unknown";
            return res.redirect(
                `${process.env.FRONTEND_URL}/payment/failed?error=Server_error&orderId=${orderId}`
            );
        }
    }

    static async sendOrderConfirmationEmail(
        order,
        user,
        products,
        customer_email,
        currentDateTime,
        customer_phone,
        customer_name,
    ) {
        try {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const currentDateTimeUTC = new Date();
            const formattedDate = currentDateTimeUTC.toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false,
            });
            const formattedPrice = new Intl.NumberFormat("vi-VN").format(
                order.total_price
            );
            const formattedShipping = new Intl.NumberFormat("vi-VN").format(
                order.shipping_fee || 0
            );

            const productsHTML = products
                .map((item) => {
                    const variant = item.variant;
                    const productName =
                        variant?.product?.name || "Sản phẩm không xác định";
                    const price = new Intl.NumberFormat("vi-VN").format(
                        variant?.price || 0
                    );
                    const imageUrl = variant?.images?.[0]?.image_url;
                    const attributeValues = variant?.attributeValues ?? [];
                    const attributes = Array.isArray(attributeValues)
                        ? attributeValues.map((attr) => attr.value).join(" - ")
                        : "Không xác định";

                    return `
            <div class="product">
                <img src="${imageUrl}" alt="${productName}">
                <div class="product-info">
                <p style="margin-left: 10px;"><strong>${productName} (${attributes})</strong></p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-left: 10px; margin-top: 4px;">
                    <span style="font-size: 14px;">${price}₫</span>
                <span style="font-size: 13px; color: #555; margin-left: auto;">×${item.quantity}</span>
                </div>
                </div>
            </div>
            `;
                })
                .join("");

            const subtotal = products.reduce(
                (sum, item) => sum + item.variant.price * item.quantity,
                0
            );
            const shippingFee = order.shipping_fee || 0;
            const total = subtotal + shippingFee;

            const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Xác nhận đơn hàng</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                    padding: 20px;
                    color: #333;
                }
                .order-container {
                    max-width: 400px;
                    margin: auto;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    padding: 16px;
                }
                .shop-name {
                    font-weight: bold;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 12px;
                }
                .product {
                    display: flex;
                    gap: 10px;
                    margin: 16px 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 16px;
                }
                .product img {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .product-info {
                    flex-grow: 1;
                    font-size: 13px;
                }
                .price {
                    font-weight: bold;
                    font-size: 14px;
                    margin-top: 4px;
                }
                .summary {
                    margin-top: 20px;
                }
                .summary-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 15px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    margin: 6px 0;
                }
                .total {
                    font-weight: bold;
                    font-size: 15px;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="order-container">

                ${productsHTML}

                <div style="border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
                        <span style="color: #666;">Mã đơn hàng:</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;"">${order.order_code
                }</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
                        <span style="color: #666;">Ngày đặt hàng:</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;"">${formattedDate}</span>
                    </div>
                </div>

                <div class="summary">
                    <div class="summary-title">Tóm tắt kiện hàng</div>

                    <div class="summary-row">
                        <span>Tổng phụ</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">${new Intl.NumberFormat(
                    "vi-VN"
                ).format(subtotal)}₫</span>
                    </div>

                    <div class="summary-row">
                        <span>Vận chuyển</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">+ ${new Intl.NumberFormat(
                    "vi-VN"
                ).format(shippingFee)}₫</span>
                    </div>

                    <div class="summary-row total">
                        <span>Tổng (${products.length} mặt hàng)</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">${new Intl.NumberFormat(
                    "vi-VN"
                ).format(total)}₫</span>
                    </div>
                </div>
                <div style="margin-top: 24px;">
                <div style="font-weight: bold; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 16px">Địa chỉ vận chuyển</div>
                <div style="font-size: 14px; color: #333;">
                    <div>Họ và tên: ${customer_name || "Tên không xác định"}</div>
                    <div>Số điện thoại: (+84) ${customer_phone || ""}</div>
                    <div>Địa chỉ: ${order?.shipping_address || "Địa chỉ không có"
                }</div>
                </div>
            </div>
            </div>
        </body>
        </html>
        `;

            const mailOptions = {
                from: `"Cửa hàng của bạn" <${process.env.EMAIL_USER}>`,
                to: customer_email,
                subject: `Xác nhận đơn hàng #${order.order_code}`,
                html: htmlContent,
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Lỗi gửi email xác nhận đơn hàng:", error);
            throw new Error("Không thể gửi email xác nhận đơn hàng.");
        }
    }
}

module.exports = OrderController;